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

import { calculateAmountWorth } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { useMemo } from 'react'

import { useFetchTokenPrice } from '@/api/apiDataHooks/useFetchTokenPrices'
import useFetchWalletBalancesAlph from '@/api/apiDataHooks/wallet/useFetchWalletBalancesAlph'

const useFetchWalletWorthAlph = () => {
  const { data: alphBalances, isLoading: isLoadingAlphBalances } = useFetchWalletBalancesAlph()
  const { data: alphPrice, isLoading: isLoadingAlphPrice } = useFetchTokenPrice(ALPH.symbol)

  return {
    data: useMemo(
      () => calculateAmountWorth(alphBalances?.totalBalance ?? BigInt(0), alphPrice?.price ?? 0, ALPH.decimals),
      [alphBalances?.totalBalance, alphPrice?.price]
    ),
    isLoading: isLoadingAlphBalances || isLoadingAlphPrice
  }
}

export default useFetchWalletWorthAlph
