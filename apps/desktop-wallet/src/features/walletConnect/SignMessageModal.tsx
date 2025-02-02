/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { keyring } from '@alephium/keyring'
import { getHumanReadableError, WALLETCONNECT_ERRORS } from '@alephium/shared'
import { hashMessage } from '@alephium/web3'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import InfoBox from '@/components/InfoBox'
import { InputFieldsColumn } from '@/components/InputFieldsColumn'
import useAnalytics from '@/features/analytics/useAnalytics'
import { closeModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import { useWalletConnectContext } from '@/features/walletConnect/walletConnectContext'
import { SignMessageData } from '@/features/walletConnect/walletConnectTypes'
import { useAppDispatch } from '@/hooks/redux'
import CenteredModal, { ModalContent, ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import { messageSignFailed, messageSignSucceeded } from '@/storage/transactions/transactionsActions'

export interface SignMessageModalProps {
  txData: SignMessageData
}

const SignMessageModal = memo(({ id, txData }: ModalBaseProp & SignMessageModalProps) => {
  const { t } = useTranslation()
  const { sendAnalytics } = useAnalytics()
  const dispatch = useAppDispatch()
  const { sendSuccessResponse, sendFailureResponse, sendUserRejectedResponse } = useWalletConnectContext()

  const handleSign = async () => {
    try {
      const messageHash = hashMessage(txData.message, txData.messageHasher)
      const signature = keyring.signMessageHash(messageHash, txData.fromAddress.hash)

      await sendSuccessResponse({ signature }, true)

      dispatch(messageSignSucceeded)
      dispatch(closeModal({ id }))
    } catch (error) {
      const message = 'Could not sign message'
      const errorMessage = getHumanReadableError(error, t(message))

      sendAnalytics({ type: 'error', message })
      dispatch(messageSignFailed(errorMessage))

      sendFailureResponse({
        message: getHumanReadableError(error, message),
        code: WALLETCONNECT_ERRORS.MESSAGE_SIGN_FAILED
      })
    }
  }

  const rejectAndClose = (hideApp?: boolean) => {
    dispatch(closeModal({ id }))
    sendUserRejectedResponse(hideApp)
  }

  return (
    <CenteredModal id={id} title={t('Sign Message')} onClose={rejectAndClose} dynamicContent focusMode noPadding>
      <ModalContent>
        <InputFieldsColumn>
          <InfoBox label={t('Message')} text={txData.message} />
        </InputFieldsColumn>
        <ModalFooterButtons>
          <ModalFooterButton role="secondary" onClick={() => rejectAndClose(true)}>
            {t('Reject')}
          </ModalFooterButton>
          <ModalFooterButton onClick={handleSign}>{t('Sign')}</ModalFooterButton>
        </ModalFooterButtons>
      </ModalContent>
    </CenteredModal>
  )
})

export default SignMessageModal
