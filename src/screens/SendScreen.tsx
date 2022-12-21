/*
Copyright 2018 - 2022 The Alephium Authors
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

import {
  APIError,
  convertAlphToSet,
  convertSetToAlph,
  formatAmountForDisplay,
  getHumanReadableError,
  MINIMAL_GAS_AMOUNT,
  MINIMAL_GAS_PRICE
} from '@alephium/sdk'
import { SweepAddressTransaction } from '@alephium/sdk/api/alephium'
import { StackScreenProps } from '@react-navigation/stack'
import { isEmpty } from 'lodash'
import { Codesandbox } from 'lucide-react-native'
import { useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ScrollView, View } from 'react-native'
import Toast from 'react-native-root-toast'
import styled, { useTheme } from 'styled-components/native'

import client from '../api/client'
import { buildSweepTransactions, signAndSendTransaction } from '../api/transactions'
import Amount from '../components/Amount'
import AppText from '../components/AppText'
import Button from '../components/buttons/Button'
import ButtonsRow from '../components/buttons/ButtonsRow'
import ConfirmWithAuthModal from '../components/ConfirmWithAuthModal'
import ExpandableRow from '../components/ExpandableRow'
import HighlightRow from '../components/HighlightRow'
import InfoBox from '../components/InfoBox'
import AddressSelector from '../components/inputs/AddressSelector'
import Input from '../components/inputs/Input'
import Screen, {
  BottomModalScreenTitle,
  BottomScreenSection,
  ScreenSection,
  ScreenSectionTitle
} from '../components/layout/Screen'
import ModalWithBackdrop from '../components/ModalWithBackdrop'
import SpinnerModal from '../components/SpinnerModal'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import InWalletTabsParamList from '../navigation/inWalletRoutes'
import RootStackParamList from '../navigation/rootStackRoutes'
import { selectAddressByHash, selectDefaultAddress, transactionSent } from '../store/addressesSlice'
import { AddressHash } from '../types/addresses'
import { getAvailableBalance } from '../utils/addresses'
import {
  validateIsAddressValid,
  validateIsNumericStringValid,
  validateOptionalIsNumericStringValid
} from '../utils/forms'

type ScreenProps = StackScreenProps<InWalletTabsParamList & RootStackParamList, 'SendScreen'>

type TxStep = 'build' | 'send'

type FormData = {
  fromAddressHash: AddressHash
  toAddressHash: AddressHash
  amountInAlph: string
  gasAmount: string
  gasPriceInAlph: string
}

const requiredErrorMessage = 'This field is required'

const SendScreen = ({
  navigation,
  route: {
    params: { addressHash }
  }
}: ScreenProps) => {
  const theme = useTheme()
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const requiresAuth = useAppSelector((state) => state.settings.requireAuth)
  const {
    control,
    watch,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      fromAddressHash: addressHash ?? defaultAddress?.hash,
      toAddressHash: '',
      amountInAlph: '',
      gasAmount: '',
      gasPriceInAlph: ''
    }
  })
  const { fromAddressHash, toAddressHash, gasAmount, amountInAlph, gasPriceInAlph } = watch()
  const fromAddress = useAppSelector((state) => selectAddressByHash(state, fromAddressHash))
  const dispatch = useAppDispatch()

  const [amount, setAmount] = useState(BigInt(0))
  const [fees, setFees] = useState<bigint>(BigInt(0))
  const [unsignedTxId, setUnsignedTxId] = useState('')
  const [unsignedTransaction, setUnsignedTransaction] = useState('')
  const [isConsolidateUTXOsModalVisible, setIsConsolidateUTXOsModalVisible] = useState(false)
  const [consolidationRequired, setConsolidationRequired] = useState(false)
  const [isSweeping, setIsSweeping] = useState(false)
  const [sweepUnsignedTxs, setSweepUnsignedTxs] = useState<SweepAddressTransaction[]>([])
  const [isAuthenticationModalVisible, setIsAuthenticationModalVisible] = useState(false)
  const [txStep, setTxStep] = useState<TxStep>('build')
  const [isBuildingTx, setIsBuildingTx] = useState(false)
  const [isSendingTx, setIsSendingTx] = useState(false)

  const isFormValid = isEmpty(errors)
  const totalAmount = amount + fees
  const loadingMessage = {
    build: 'Calculating fees...',
    send: 'Sending...'
  }[txStep]

  const validateOptionalMinGasAmount = (value: string) =>
    !value || parseInt(value) >= MINIMAL_GAS_AMOUNT || `Gas must be at least ${MINIMAL_GAS_AMOUNT}`
  const validateOptionalMinGasPrice = (value: string) =>
    !value ||
    convertAlphToSet(value) >= MINIMAL_GAS_PRICE ||
    `Gas price must be at least ${formatAmountForDisplay(MINIMAL_GAS_PRICE, true)}`

  useEffect(() => setTxStep('build'), [fromAddress, toAddressHash, amountInAlph, gasAmount, gasPriceInAlph])

  const buildConsolidationTransactions = useCallback(async () => {
    if (!fromAddress) return

    setIsBuildingTx(true)
    setIsSweeping(true)

    try {
      const { unsignedTxs, fees } = await buildSweepTransactions(
        fromAddress.hash,
        fromAddress.publicKey,
        fromAddress.hash
      )
      setSweepUnsignedTxs(unsignedTxs)
      setFees(fees)
    } catch (e) {
      Toast.show(getHumanReadableError(e, 'Error while building the transaction'))
    } finally {
      setIsBuildingTx(false)
    }
  }, [fromAddress])

  const buildTransaction = useCallback(
    async (formData: FormData) => {
      if (!fromAddress?.hash || !isFormValid) return

      setIsBuildingTx(true)
      const amountInSet = convertAlphToSet(formData.amountInAlph)
      const isSweep = amountInSet === getAvailableBalance(fromAddress)

      setAmount(amountInSet)
      setIsSweeping(isSweep)

      const gasPriceInSet = formData.gasPriceInAlph ? convertAlphToSet(formData.gasPriceInAlph) : ''
      try {
        if (isSweep) {
          const { unsignedTxs, fees } = await buildSweepTransactions(
            fromAddress.hash,
            fromAddress.publicKey,
            formData.toAddressHash
          )
          setSweepUnsignedTxs(unsignedTxs)
          setFees(fees)
        } else {
          const { data } = await client.cliqueClient.transactionCreate(
            fromAddress.hash,
            fromAddress.publicKey,
            formData.toAddressHash,
            amountInSet.toString(),
            undefined,
            formData.gasAmount ? parseInt(formData.gasAmount) : undefined,
            gasPriceInSet.toString() || undefined
          )
          setUnsignedTransaction(data.unsignedTx)
          setUnsignedTxId(data.txId)
          setFees(BigInt(data.gasAmount) * BigInt(data.gasPrice))
        }

        setTxStep('send')
      } catch (e) {
        // TODO: When API error codes are available, replace this substring check with a proper error code check
        const { error } = e as APIError
        if (error?.detail && (error.detail.includes('consolidating') || error.detail.includes('consolidate'))) {
          setConsolidationRequired(true)
          setIsSweeping(true)
          setIsConsolidateUTXOsModalVisible(true)
          await buildConsolidationTransactions()
        } else {
          Toast.show(getHumanReadableError(e, 'Error while building the transaction'))
        }
      } finally {
        setIsBuildingTx(false)
      }
    },
    [buildConsolidationTransactions, fromAddress, isFormValid]
  )

  const sendTransaction = useCallback(async () => {
    if (!fromAddress?.hash) return

    setIsSendingTx(true)

    try {
      const unsignedTxs = isSweeping ? sweepUnsignedTxs : [{ txId: unsignedTxId, unsignedTx: unsignedTransaction }]

      for (const { txId, unsignedTx } of unsignedTxs) {
        const data = await signAndSendTransaction(fromAddress, txId, unsignedTx)
        dispatch(
          transactionSent({
            hash: data.txId,
            fromAddress: fromAddress.hash,
            toAddress: consolidationRequired ? fromAddress.hash : toAddressHash,
            timestamp: new Date().getTime(),
            amount: amount.toString(),
            status: 'pending'
          })
        )
      }

      navigation.navigate('TransfersScreen')
    } catch (e) {
      Toast.show(getHumanReadableError(e, 'Could not send transaction'))
    } finally {
      setIsSendingTx(false)
    }
  }, [
    amount,
    consolidationRequired,
    dispatch,
    fromAddress,
    isSweeping,
    navigation,
    sweepUnsignedTxs,
    toAddressHash,
    unsignedTransaction,
    unsignedTxId
  ])

  const authenticateAndSend = useCallback(async () => {
    if (requiresAuth) {
      setIsAuthenticationModalVisible(true)
    } else {
      sendTransaction()
    }
  }, [requiresAuth, sendTransaction])

  const handleUseMaxAmountPress = useCallback(() => {
    if (!fromAddress) return

    setValue('amountInAlph', convertSetToAlph(getAvailableBalance(fromAddress)))
  }, [fromAddress, setValue])

  return (
    <Screen>
      <ScrollView>
        <MainContent>
          <>
            <ScreenSection>
              <BottomModalScreenTitle>Send</BottomModalScreenTitle>
            </ScreenSection>
            <ScreenSection>
              <Controller
                name="fromAddressHash"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AddressSelector
                    label="From address"
                    value={value}
                    onValueChange={onChange}
                    onBlur={onBlur}
                    isTopRounded
                    hasBottomBorder
                    error={
                      errors.fromAddressHash?.type === 'required'
                        ? requiredErrorMessage
                        : errors.fromAddressHash?.message
                    }
                  />
                )}
                rules={{
                  required: true,
                  validate: validateIsAddressValid
                }}
                control={control}
              />

              <Controller
                name="toAddressHash"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="To address"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    hasBottomBorder
                    error={
                      errors.toAddressHash?.type === 'required' ? requiredErrorMessage : errors.toAddressHash?.message
                    }
                  />
                )}
                rules={{
                  required: true,
                  validate: validateIsAddressValid
                }}
                control={control}
              />
              <Controller
                name="amountInAlph"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Amount"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    isBottomRounded
                    keyboardType="number-pad"
                    error={
                      errors.amountInAlph?.type === 'required' ? requiredErrorMessage : errors.amountInAlph?.message
                    }
                    RightContent={
                      <UseMaxButton
                        title="Use max"
                        onPress={handleUseMaxAmountPress}
                        type="transparent"
                        variant="accent"
                      />
                    }
                  />
                )}
                rules={{
                  required: true,
                  validate: validateIsNumericStringValid
                }}
                control={control}
              />
            </ScreenSection>
            <ScreenSection>
              <ExpandableRow title="Tweak gas settings" expandedHeight={165}>
                <Controller
                  control={control}
                  rules={{
                    validate: {
                      validateOptionalIsNumericStringValid,
                      validateOptionalMinGasAmount
                    }
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Gas"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      isTopRounded
                      hasBottomBorder
                      keyboardType="number-pad"
                      error={errors.gasAmount?.message}
                    />
                  )}
                  name="gasAmount"
                />
                <Controller
                  control={control}
                  rules={{
                    validate: {
                      validateOptionalIsNumericStringValid,
                      validateOptionalMinGasPrice
                    }
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Gas price"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      isBottomRounded
                      hasBottomBorder
                      keyboardType="number-pad"
                      error={errors.gasPriceInAlph?.message}
                    />
                  )}
                  name="gasPriceInAlph"
                />
              </ExpandableRow>
            </ScreenSection>
            {txStep === 'send' && !isBuildingTx && fees && totalAmount && (
              <ScreenSection>
                <ScreenSectionTitle>Summary</ScreenSectionTitle>
                <HighlightRow title="Expected fee" isTopRounded hasBottomBorder isSecondary>
                  <Amount value={fees} fullPrecision />
                </HighlightRow>
                <HighlightRow title="Total amount" isBottomRounded isSecondary>
                  <Amount value={totalAmount} fullPrecision bold color={theme.global.accent} />
                </HighlightRow>
              </ScreenSection>
            )}
          </>
        </MainContent>
        <BottomScreenSection>
          <Button
            title={txStep === 'build' ? 'Continue' : 'Confirm'}
            gradient
            onPress={txStep === 'build' ? handleSubmit(buildTransaction) : authenticateAndSend}
            wide
            disabled={isBuildingTx || isSendingTx || !isFormValid}
          />
        </BottomScreenSection>
        <ModalWithBackdrop
          animationType="fade"
          visible={isConsolidateUTXOsModalVisible}
          closeModal={() => setIsConsolidateUTXOsModalVisible(false)}
        >
          <ConsolidationModalContent>
            <ScreenSectionStyled fill>
              <InfoBox title="Action to take" Icon={Codesandbox} iconColor="#64f6c2">
                <View>
                  <AppText>
                    It appers that the address you use to send funds from has too many UTXOs! Would you like to
                    consolidate them? This will cost as small fee.
                  </AppText>
                  <Fee>
                    <Amount prefix="Fee:" value={fees} fullPrecision fadeDecimals bold />
                  </Fee>
                </View>
              </InfoBox>
            </ScreenSectionStyled>
            <BottomScreenSection>
              <ButtonsRow>
                <Button title="Cancel" onPress={() => setIsConsolidateUTXOsModalVisible(false)} />
                <Button title="Consolidate" onPress={authenticateAndSend} />
              </ButtonsRow>
            </BottomScreenSection>
          </ConsolidationModalContent>
        </ModalWithBackdrop>
        {isAuthenticationModalVisible && <ConfirmWithAuthModal onConfirm={sendTransaction} />}
      </ScrollView>
      <SpinnerModal isActive={isBuildingTx || isSendingTx} text={loadingMessage} />
    </Screen>
  )
}

export default SendScreen

const ConsolidationModalContent = styled.View`
 flex: 1
 width: 100%;
 background-color: ${({ theme }) => theme.bg.primary};
`

const MainContent = styled.View`
  flex: 1;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

const ScreenSectionStyled = styled(ScreenSection)`
  align-items: center;
  justify-content: center;
`

const Fee = styled(AppText)`
  display: flex;
  margin-top: 20px;
`

const UseMaxButton = styled(Button)`
  padding-right: 0;
`
