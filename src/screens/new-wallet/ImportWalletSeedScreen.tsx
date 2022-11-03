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
import { colord } from 'colord'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Pressable, ScrollView } from 'react-native'
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import AppText from '../../components/AppText'
import Button from '../../components/buttons/Button'
import ConfirmWithAuthModal from '../../components/ConfirmWithAuthModal'
import Input from '../../components/inputs/Input'
import Screen, { ScreenSection, ScreenSectionTitle } from '../../components/layout/Screen'
import SpinnerModal from '../../components/SpinnerModal'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import useBiometrics from '../../hooks/useBiometrics'
import RootStackParamList from '../../navigation/rootStackRoutes'
import { biometricsToggled, walletGeneratedAndStoredWithPin } from '../../store/activeWalletSlice'
import { BORDER_RADIUS, BORDER_RADIUS_SMALL } from '../../style/globalStyle'
import { bip39Words } from '../../utils/bip39'

type ScreenProps = StackScreenProps<RootStackParamList, 'NewWalletNameScreen'>

type SelectedWord = {
  word: string
  timestamp: Date
}

const enablePasteForDevelopment = false

const ImportWalletSeedScreen = ({ navigation }: ScreenProps) => {
  const dispatch = useAppDispatch()
  const name = useAppSelector((state) => state.walletGeneration.walletName)
  const activeWallet = useAppSelector((state) => state.activeWallet)
  const isAuthenticated = !!activeWallet.mnemonic
  const hasAvailableBiometrics = useBiometrics()
  const [typedInput, setTypedInput] = useState('')
  const [selectedWords, setSelectedWords] = useState<SelectedWord[]>([])
  const [possibleMatches, setPossibleMatches] = useState<string[]>([])
  const theme = useTheme()
  const scrollRef = useRef<ScrollView>(null)
  const allowedWords = useRef(bip39Words.split(' '))
  const [loading, setLoading] = useState(false)
  const pin = useAppSelector((state) => state.credentials.pin)
  const [isPinModalVisible, setIsPinModalVisible] = useState(false)
  const lastActiveWallet = useRef(activeWallet)

  useEffect(() => {
    setPossibleMatches(
      typedInput.length <= 2
        ? []
        : allowedWords.current.filter((allowedWord) => allowedWord.startsWith(typedInput.toLowerCase().trim()))
    )
  }, [typedInput])

  const selectWord = useCallback(
    (word: string) => {
      if (!word) return

      setSelectedWords(
        selectedWords.concat([
          {
            word,
            timestamp: new Date()
          }
        ])
      )
      setTypedInput('')
    },
    [selectedWords]
  )

  const removeSelectedWord = (word: SelectedWord) =>
    setSelectedWords(selectedWords.filter((selectedWord) => selectedWord.timestamp !== word.timestamp))

  const handleEnterPress = useCallback(
    () => possibleMatches.length > 0 && selectWord(possibleMatches[0]),
    [possibleMatches, selectWord]
  )

  const importWallet = useCallback(
    async (pin?: string) => {
      if (!name) return

      if (!pin) {
        setIsPinModalVisible(true)
        return
      }

      setLoading(true)

      const importedMnemonic = enablePasteForDevelopment ? typedInput : selectedWords.map(({ word }) => word).join(' ')

      await dispatch(walletGeneratedAndStoredWithPin({ name, pin, mnemonicToImport: importedMnemonic }))

      if (!isAuthenticated) {
        setLoading(false)
        navigation.navigate('AddBiometricsScreen')
        return
      }

      // We assume the preference of the user to enable biometrics by looking at the auth settings of the current wallet
      if (isAuthenticated && lastActiveWallet.current.authType === 'biometrics' && hasAvailableBiometrics) {
        await dispatch(biometricsToggled(true))
      }

      setLoading(false)

      navigation.navigate('NewWalletSuccessPage')
    },
    [dispatch, hasAvailableBiometrics, isAuthenticated, name, navigation, selectedWords, typedInput]
  )

  const handleWalletImport = useCallback(() => importWallet(pin), [importWallet, pin])

  const closePinModal = useCallback(() => setIsPinModalVisible(false), [])

  // Alephium's node code uses 12 as the minimal mnemomic length.
  const isImportButtonVisible = selectedWords.length >= 12 || enablePasteForDevelopment

  return (
    <Screen>
      <ScrollView
        keyboardShouldPersistTaps="always"
        ref={scrollRef}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd()}
      >
        <ScreenSection>
          <ScreenSectionTitle>Secret phrase</ScreenSectionTitle>
          <SecretPhraseBox>
            <SecretPhraseWords>
              {selectedWords.map((word, index) => (
                <SelectedWordBox
                  key={`${word.word}-${word.timestamp}`}
                  onPress={() => removeSelectedWord(word)}
                  entering={FadeIn}
                  exiting={FadeOut}
                  layout={Layout.duration(200).delay(200)}
                >
                  <AppText color={theme.font.primary} bold>
                    {index + 1}. {word.word}
                  </AppText>
                </SelectedWordBox>
              ))}
            </SecretPhraseWords>
          </SecretPhraseBox>
          {isImportButtonVisible && (
            <ActionsContainer>
              <Button title="Import wallet" type="primary" wide onPress={handleWalletImport} />
            </ActionsContainer>
          )}
        </ScreenSection>
      </ScrollView>
      <ScreenSectionBottom>
        <PossibleMatches>
          {possibleMatches.map((word, index) => (
            <PossibleWordBox
              key={word}
              onPress={() => selectWord(word)}
              highlight={index === 0}
              entering={FadeIn.delay(index * 100)}
            >
              <Word highlight={index === 0} bold>
                {word}
              </Word>
            </PossibleWordBox>
          ))}
        </PossibleMatches>
        <Input
          value={typedInput}
          onChangeText={setTypedInput}
          onSubmitEditing={handleEnterPress}
          autoFocus
          label=""
          isTopRounded
          isBottomRounded
          blurOnSubmit={false}
          autoCorrect={false}
          error={typedInput.split(' ').length > 1 ? 'Please, type the words one by one' : ''}
          placeholder="Type your secret phrase word by word"
        />
      </ScreenSectionBottom>
      {isPinModalVisible && <ConfirmWithAuthModal usePin onConfirm={importWallet} onCancel={closePinModal} />}
      <SpinnerModal isActive={loading} text="Importing wallet..." />
    </Screen>
  )
}

export default ImportWalletSeedScreen

const SecretPhraseBox = styled.View`
  width: 100%;
  min-height: 250px;
  padding: 16px;
  background-color: ${({ theme }) => theme.bg.primary};
  border-top-left-radius: ${BORDER_RADIUS}px;
  border-top-right-radius: ${BORDER_RADIUS}px;
  border-bottom-left-radius: ${BORDER_RADIUS}px;
  border-bottom-right-radius: ${BORDER_RADIUS}px;
`

const SecretPhraseWords = styled.View`
  flex-direction: row;
  align-items: flex-start;
  flex-wrap: wrap;
`

const ActionsContainer = styled.View`
  justify-content: center;
  align-items: center;
  margin-top: 40px;
`

const ScreenSectionBottom = styled(ScreenSection)`
  background-color: ${({ theme }) => theme.bg.tertiary};
  width: 100%;
  padding-top: 16px;
`

const PossibleMatches = styled(Animated.View)`
  flex-direction: row;
  flex-wrap: wrap;
`

const Word = styled(AppText)<{ highlight?: boolean }>`
  color: ${({ highlight, theme }) => (highlight ? theme.font.contrast : theme.global.accent)};
`

const WordBox = styled(Animated.createAnimatedComponent(Pressable))`
  background-color: ${({ theme }) => theme.global.accent};
  padding: 10px 16px;
  margin: 0 10px 10px 0;
  border-top-left-radius: ${BORDER_RADIUS_SMALL}px;
  border-top-right-radius: ${BORDER_RADIUS_SMALL}px;
  border-bottom-left-radius: ${BORDER_RADIUS_SMALL}px;
  border-bottom-right-radius: ${BORDER_RADIUS_SMALL}px;
`

const PossibleWordBox = styled(WordBox)<{ highlight?: boolean }>`
  background-color: ${({ highlight, theme }) =>
    highlight ? theme.global.accent : colord(theme.global.accent).alpha(0.11).toHex()};
`

const SelectedWordBox = styled(WordBox)`
  background-color: ${({ theme }) => theme.bg.secondary};
`
