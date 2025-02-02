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

import useFetchTokensSeparatedByType from '@/api/apiDataHooks/utils/useFetchTokensSeparatedByType'
import useMergeAllTokensBalances from '@/api/apiDataHooks/utils/useMergeAllTokensBalances'
import { useFetchWalletBalancesAlphArray } from '@/api/apiDataHooks/wallet/useFetchWalletBalancesAlph'
import { useFetchWalletBalancesTokensArray } from '@/api/apiDataHooks/wallet/useFetchWalletBalancesTokens'

interface UseFetchWalletTokensByType {
  includeAlph: boolean
}

const useFetchWalletTokensByType = ({ includeAlph }: UseFetchWalletTokensByType) => {
  const { data: alphBalances, isLoading: isLoadingAlphBalances } = useFetchWalletBalancesAlphArray()
  const { data: tokensBalances, isLoading: isLoadingTokensBalances } = useFetchWalletBalancesTokensArray()
  const allTokensBalances = useMergeAllTokensBalances({
    includeAlph,
    alphBalances,
    tokensBalances
  })
  const { data, isLoading } = useFetchTokensSeparatedByType(allTokensBalances)

  return {
    data,
    isLoading: isLoading || isLoadingTokensBalances || (includeAlph ? isLoadingAlphBalances : false)
  }
}

export default useFetchWalletTokensByType
