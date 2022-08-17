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
import { ArrowDown as ArrowDownIcon, Plus as PlusIcon } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import Button from '../components/buttons/Button'
import Screen from '../components/layout/Screen'
import RadioButtonRow from '../components/RadioButtonRow'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import RootStackParamList from '../navigation/rootStackRoutes'
import { getStoredWalletById, getWalletsMetadata } from '../storage/wallets'
import { activeWalletChanged } from '../store/activeWalletSlice'
import { methodSelected, WalletGenerationMethod } from '../store/walletGenerationSlice'
import { WalletMetadata } from '../types/wallet'

export interface SwitchWalletScreenProps extends StackScreenProps<RootStackParamList, 'SwitchWalletScreen'> {
  style?: StyleProp<ViewStyle>
}

const SwitchWalletScreen = ({ navigation, style }: SwitchWalletScreenProps) => {
  const dispatch = useAppDispatch()
  const wallets = useSortedWallets()
  const theme = useTheme()
  const activeWalletMetadataId = useAppSelector((state) => state.activeWallet.metadataId)

  const handleButtonPress = (method: WalletGenerationMethod) => {
    dispatch(methodSelected(method))
    navigation.navigate('NewWalletIntroScreen')
  }

  const handleWalletItemPress = async (walletId: string) => {
    try {
      const storedWallet = await getStoredWalletById(walletId)
      if (!storedWallet) return

      if (storedWallet.authType === 'pin') {
        navigation.navigate('LoginScreen', { storedWallet })
      } else if (storedWallet.authType === 'biometrics') {
        dispatch(activeWalletChanged(storedWallet))
        navigation.navigate('InWalletScreen')
      } else {
        throw new Error('Unknown auth type')
      }
    } catch (e) {
      console.error('Could not switch wallets', e)
    }
  }

  return (
    <Screen style={style}>
      <ScreenSection>
        <Title>Wallets</Title>
        <Subtitle>Switch to another wallet?</Subtitle>
      </ScreenSection>
      <ScreenSection fill>
        {wallets.map((wallet, index) => (
          <RadioButtonRow
            key={wallet.id}
            title={wallet.name}
            onPress={() => handleWalletItemPress(wallet.id)}
            isFirst={index === 0}
            isLast={index === wallets.length - 1}
            isActive={wallet.id === activeWalletMetadataId}
            isInput
          />
        ))}
      </ScreenSection>
      <ScreenSection>
        <Buttons>
          <NewWalletButton
            title="New wallet"
            onPress={() => handleButtonPress('create')}
            prefixIcon={<PlusIcon size={24} color={theme.font.contrast} />}
          />
          <ImportWalletButton
            title="Import wallet"
            onPress={() => handleButtonPress('import')}
            prefixIcon={<ArrowDownIcon size={24} color={theme.font.contrast} />}
          />
        </Buttons>
      </ScreenSection>
    </Screen>
  )
}

export default SwitchWalletScreen

const useSortedWallets = () => {
  const [wallets, setWallets] = useState<WalletMetadata[]>([])
  const activeWalletId = useAppSelector((state) => state.activeWallet.metadataId)
  const activeWallet = wallets.find((wallet) => wallet.id === activeWalletId)

  const sortedWallets = wallets
    .filter((wallet) => wallet.id !== activeWalletId)
    .sort((a, b) => a.name.localeCompare(b.name))
  if (activeWallet) sortedWallets.unshift(activeWallet)

  useEffect(() => {
    const getWallets = async () => {
      const wallets = await getWalletsMetadata()
      setWallets(wallets)
    }
    getWallets()
  }, [activeWalletId])

  return sortedWallets
}

const Title = styled.Text`
  font-weight: 600;
  font-size: 26px;
`

const Subtitle = styled.Text`
  font-weight: 500;
  font-size: 16px;
  color: ${({ theme }) => theme.font.secondary};
`

const ScreenSection = styled.View<{ fill?: boolean }>`
  padding: 29px 20px;

  ${({ fill }) => fill && 'flex: 1;'}
`

const Buttons = styled.View`
  flex-direction: row;
`

const NewWalletButton = styled(Button)`
  flex: 1;
  margin-right: 5px;
`

const ImportWalletButton = styled(Button)`
  flex: 1;
  margin-left: 5px;
`
