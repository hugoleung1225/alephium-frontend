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
import { getHumanReadableError, throttledClient, WALLETCONNECT_ERRORS } from '@alephium/shared'
import { SignUnsignedTxResult } from '@alephium/web3'
import { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import InfoBox from '@/components/InfoBox'
import { InputFieldsColumn } from '@/components/InputFieldsColumn'
import useAnalytics from '@/features/analytics/useAnalytics'
import { closeModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import { useWalletConnectContext } from '@/features/walletConnect/walletConnectContext'
import { SignUnsignedTxData } from '@/features/walletConnect/walletConnectTypes'
import { useAppDispatch } from '@/hooks/redux'
import CenteredModal, { ModalContent, ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import {
  unsignedTransactionDecodingFailed,
  unsignedTransactionSignFailed,
  unsignedTransactionSignSucceeded
} from '@/storage/transactions/transactionsActions'

export interface SignUnsignedTxModalProps {
  txData: SignUnsignedTxData
}

const SignUnsignedTxModal = memo(({ id, txData }: ModalBaseProp & SignUnsignedTxModalProps) => {
  const { t } = useTranslation()
  const { sendAnalytics } = useAnalytics()
  const dispatch = useAppDispatch()
  const { sendUserRejectedResponse, sendSuccessResponse, sendFailureResponse } = useWalletConnectContext()

  const [isLoading, setIsLoading] = useState(false)
  const [decodedUnsignedTx, setDecodedUnsignedTx] = useState<Omit<SignUnsignedTxResult, 'signature'> | undefined>(
    undefined
  )

  useEffect(() => {
    const decodeUnsignedTx = async () => {
      setIsLoading(true)

      try {
        const decodedResult = await throttledClient.node.transactions.postTransactionsDecodeUnsignedTx({
          unsignedTx: txData.unsignedTx
        })

        setDecodedUnsignedTx({
          txId: decodedResult.unsignedTx.txId,
          fromGroup: decodedResult.fromGroup,
          toGroup: decodedResult.toGroup,
          unsignedTx: txData.unsignedTx,
          gasAmount: decodedResult.unsignedTx.gasAmount,
          gasPrice: BigInt(decodedResult.unsignedTx.gasPrice)
        })
      } catch (e) {
        const message = 'Could not decode unsigned tx'
        const errorMessage = getHumanReadableError(e, t(message))

        sendAnalytics({ type: 'error', message })
        dispatch(unsignedTransactionDecodingFailed(errorMessage))
        sendFailureResponse({
          message: getHumanReadableError(e, message),
          code: WALLETCONNECT_ERRORS.TRANSACTION_DECODE_FAILED
        })
      } finally {
        setIsLoading(false)
      }
    }

    decodeUnsignedTx()
  }, [dispatch, sendFailureResponse, sendAnalytics, t, txData.unsignedTx])

  const handleSign = async () => {
    if (!decodedUnsignedTx) return

    try {
      const signature = keyring.signTransaction(decodedUnsignedTx.txId, txData.fromAddress.hash)
      const signResult: SignUnsignedTxResult = { signature, ...decodedUnsignedTx }
      await sendSuccessResponse(signResult, true)

      dispatch(unsignedTransactionSignSucceeded)
      dispatch(closeModal({ id }))
    } catch (error) {
      const message = 'Could not sign unsigned tx'
      const errorMessage = getHumanReadableError(error, t(message))

      sendAnalytics({ type: 'error', message })
      dispatch(unsignedTransactionSignFailed(errorMessage))
      sendFailureResponse({
        message: getHumanReadableError(error, message),
        code: WALLETCONNECT_ERRORS.TRANSACTION_SIGN_FAILED
      })
    }
  }

  const rejectAndClose = (hideApp?: boolean) => {
    dispatch(closeModal({ id }))
    sendUserRejectedResponse(hideApp)
  }

  return (
    <CenteredModal
      id={id}
      title={t('Sign Unsigned Transaction')}
      onClose={rejectAndClose}
      isLoading={isLoading}
      dynamicContent
      focusMode
      noPadding
    >
      {decodedUnsignedTx && (
        <ModalContent>
          <InputFieldsColumn>
            <InfoBox label={t('Transaction ID')} text={decodedUnsignedTx.txId} wordBreak />
            <InfoBox label={t('Unsigned transaction')} text={decodedUnsignedTx.unsignedTx} wordBreak />
          </InputFieldsColumn>
          <ModalFooterButtons>
            <ModalFooterButton role="secondary" onClick={() => rejectAndClose(true)}>
              {t('Reject')}
            </ModalFooterButton>
            <ModalFooterButton onClick={handleSign} disabled={isLoading || !decodedUnsignedTx}>
              {t('Sign')}
            </ModalFooterButton>
          </ModalFooterButtons>
        </ModalContent>
      )}
    </CenteredModal>
  )
})

export default SignUnsignedTxModal
