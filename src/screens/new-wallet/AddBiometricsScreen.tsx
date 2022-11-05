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
import LottieView from 'lottie-react-native'
import { useCallback, useState } from 'react'
import styled from 'styled-components/native'

import animationSrc from '../../animations/fingerprint.json'
import Button from '../../components/buttons/Button'
import ButtonStack from '../../components/buttons/ButtonStack'
import Screen from '../../components/layout/Screen'
import SpinnerModal from '../../components/SpinnerModal'
import CenteredInstructions, { Instruction } from '../../components/text/CenteredInstructions'
import { useAppDispatch } from '../../hooks/redux'
import RootStackParamList from '../../navigation/rootStackRoutes'
import { biometricsToggled } from '../../store/activeWalletSlice'

type ScreenProps = StackScreenProps<RootStackParamList, 'AddBiometricsScreen'>

const instructions: Instruction[] = [
  { text: 'Do you want to activate biometric security? 👆', type: 'primary' },
  { text: 'Use fingerprint or face recognition instead of the passcode to unlock the wallet', type: 'secondary' }
]

const AddBiometricsScreen = ({ navigation }: ScreenProps) => {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)

  const navigateToWelcomePage = useCallback(() => navigation.navigate('NewWalletSuccessPage'), [navigation])

  const enableBiometrics = useCallback(async () => {
    setLoading(true)

    await dispatch(biometricsToggled({ enable: true }))
    navigateToWelcomePage()

    setLoading(false)
  }, [dispatch, navigateToWelcomePage])

  return (
    <Screen>
      <AnimationContainer>
        <StyledAnimation source={animationSrc} autoPlay speed={1.5} />
      </AnimationContainer>
      <CenteredInstructions instructions={instructions} stretch />
      <ActionsContainer>
        <ButtonStack>
          <Button title="Activate" type="primary" onPress={enableBiometrics} />
          <Button title="Later" type="secondary" onPress={navigateToWelcomePage} />
        </ButtonStack>
      </ActionsContainer>
      <SpinnerModal isActive={loading} text="Enabling biometrics..." />
    </Screen>
  )
}

export default AddBiometricsScreen

const AnimationContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`

const StyledAnimation = styled(LottieView)`
  width: 60%;
`

const ActionsContainer = styled.View`
  flex: 1.5;
  justify-content: center;
  align-items: center;
`
