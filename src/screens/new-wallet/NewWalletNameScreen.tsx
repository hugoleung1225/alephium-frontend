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

import { StackScreenProps } from '@react-navigation/stack'
import { usePostHog } from 'posthog-react-native'
import { useCallback, useState } from 'react'
import { Alert } from 'react-native'
import styled from 'styled-components/native'

import { ContinueButton } from '~/components/buttons/Button'
import ConfirmWithAuthModal from '~/components/ConfirmWithAuthModal'
import Input from '~/components/inputs/Input'
import { ScreenProps } from '~/components/layout/Screen'
import ScrollScreen from '~/components/layout/ScrollScreen'
import SpinnerModal from '~/components/SpinnerModal'
import CenteredInstructions, { Instruction } from '~/components/text/CenteredInstructions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import useBiometrics from '~/hooks/useBiometrics'
import { useSortedWallets } from '~/hooks/useSortedWallets'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { generateAndStoreWallet, updateBiometricsWallets } from '~/persistent-storage/wallets'
import { syncAddressesData, syncAddressesHistoricBalances } from '~/store/addressesSlice'
import { newWalletGenerated } from '~/store/wallet/walletActions'
import { selectAllWallets } from '~/store/wallet/walletsSlice'
import { newWalletNameEntered } from '~/store/walletGenerationSlice'
import { DEFAULT_MARGIN } from '~/style/globalStyle'
import { SimpleWallet } from '~/types/wallet'

const instructions: Instruction[] = [
  { text: "Alright, let's get to it.", type: 'secondary' },
  { text: 'How should we call this wallet?', type: 'primary' }
]

interface NewWalletNameScreenProps extends StackScreenProps<RootStackParamList, 'NewWalletNameScreen'>, ScreenProps {}

const NewWalletNameScreen = ({ navigation, ...props }: NewWalletNameScreenProps) => {
  const dispatch = useAppDispatch()
  const [name, setName] = useState('')
  const method = useAppSelector((s) => s.walletGeneration.method)
  const activeWalletMnemonic = useAppSelector((s) => s.activeWallet.mnemonic)
  const isBiometricsEnabled = useAppSelector((s) => s.settings.usesBiometrics)
  const wallets = useAppSelector(selectAllWallets)
  const pin = useAppSelector((s) => s.credentials.pin)
  const deviceHasBiometricsData = useBiometrics()
  const sortedWallets = useSortedWallets()
  const posthog = usePostHog()

  const [loading, setLoading] = useState(false)
  const [isPinModalVisible, setIsPinModalVisible] = useState(false)

  const walletNames = sortedWallets.map(({ name }) => name)
  const error = walletNames.includes(name) ? 'A wallet with this name already exists' : ''
  const isAuthenticated = !!activeWalletMnemonic

  const onSuccess = useCallback(() => {
    setLoading(false)

    navigation.navigate('NewWalletSuccessScreen')
  }, [navigation])

  const updateBiometrics = useCallback(
    async (wallets: SimpleWallet[]) => {
      try {
        await updateBiometricsWallets(wallets)
        onSuccess()
      } catch (e: unknown) {
        const error = e as { message?: string }

        console.log('error.message', error.message?.includes('User canceled the authentication'))

        if (error.message?.includes('User canceled the authentication')) {
          Alert.alert('Authentication required', 'Please authenticate to secure the new wallet.', [
            { text: 'Try again', onPress: () => updateBiometrics(wallets) }
          ])
        } else {
          console.error(e)
        }
      }
    },
    [onSuccess]
  )

  const createNewWallet = useCallback(
    async (pin?: string) => {
      if (!pin) {
        setIsPinModalVisible(true)
        return
      }

      setLoading(true)

      const wallet = await generateAndStoreWallet(name, pin)
      dispatch(newWalletGenerated(wallet))
      dispatch(syncAddressesData(wallet.firstAddress.hash))
      dispatch(syncAddressesHistoricBalances(wallet.firstAddress.hash))

      posthog?.capture('Generated new wallet', { note: 'With existing pin' })

      if (isBiometricsEnabled && deviceHasBiometricsData) {
        console.log('New wallets needs to be added to biometrics entry')

        updateBiometrics([...wallets, { id: wallet.id, mnemonic: wallet.mnemonic }])
      } else {
        onSuccess()
      }
    },
    [name, dispatch, posthog, isBiometricsEnabled, deviceHasBiometricsData, updateBiometrics, wallets, onSuccess]
  )

  const handleButtonPress = async () => {
    if (!name) return

    dispatch(newWalletNameEntered(name))

    if (!isAuthenticated) {
      navigation.navigate('PinCodeCreationScreen')
      return
    }

    if (method === 'import') {
      navigation.navigate('SelectImportMethodScreen')
      return
    }

    if (method === 'create') {
      createNewWallet(pin)
    }
  }

  return (
    <ScrollScreen
      usesKeyboard
      fill
      headerOptions={{
        type: 'stack',
        headerRight: () => <ContinueButton onPress={handleButtonPress} disabled={name.length < 3 || !!error} />
      }}
      keyboardShouldPersistTaps="always"
      {...props}
    >
      <ContentContainer>
        <CenteredInstructions instructions={instructions} />
        <StyledInput
          label="Wallet name"
          value={name}
          onChangeText={setName}
          autoFocus
          error={error}
          onSubmitEditing={handleButtonPress}
        />
      </ContentContainer>
      {isPinModalVisible && <ConfirmWithAuthModal usePin onConfirm={createNewWallet} />}
      <SpinnerModal isActive={loading} text="Creating wallet..." />
    </ScrollScreen>
  )
}

export default NewWalletNameScreen

const ContentContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`

const StyledInput = styled(Input)`
  margin-top: ${DEFAULT_MARGIN}px;
  width: 80%;
`
