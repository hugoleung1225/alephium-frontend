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

import { createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit'

import { appBecameInactive, appReset } from '~/store/appSlice'
import { newWalletGenerated, newWalletImportedWithMetadata, walletDeleted } from '~/store/wallet/walletActions'
import { ActiveWalletState, WalletUnlockedPayload } from '~/types/wallet'

const sliceName = 'activeWallet'

const initialState: ActiveWalletState = {
  id: '',
  name: '',
  mnemonic: '',
  isMnemonicBackedUp: undefined
}

const resetState = () => initialState

const activeWalletSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    mnemonicBackedUp: (state) => {
      state.isMnemonicBackedUp = true
    },
    walletSwitched: (_, action: PayloadAction<WalletUnlockedPayload>) => action.payload.wallet,
    walletUnlocked: (_, action: PayloadAction<WalletUnlockedPayload>) => action.payload.wallet
  },
  extraReducers: (builder) => {
    builder.addMatcher(isAnyOf(appBecameInactive, appReset, walletDeleted), resetState)
    builder.addMatcher(
      isAnyOf(newWalletGenerated, newWalletImportedWithMetadata),
      (_, { payload: { name, mnemonic, id, isMnemonicBackedUp } }) => ({
        id,
        name,
        mnemonic,
        isMnemonicBackedUp
      })
    )
  }
})

export const { mnemonicBackedUp, walletSwitched, walletUnlocked } = activeWalletSlice.actions

export default activeWalletSlice
