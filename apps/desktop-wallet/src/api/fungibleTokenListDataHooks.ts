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

import { ONE_DAY_MS } from '@alephium/shared'
import { mainnet, testnet, TokenList } from '@alephium/token-list'
import { skipToken, useQuery } from '@tanstack/react-query'
import axios from 'axios'

import { useAppSelector } from '@/hooks/redux'

const TOKEN_LIST_QUERY_KEY = 'tokenList'

export const useFungibleTokenList = () => {
  const networkId = useAppSelector((s) => s.network.settings.networkId)
  const network = networkId === 0 ? 'mainnet' : networkId === 1 ? 'testnet' : undefined

  const { data, isLoading } = useQuery({
    queryKey: [TOKEN_LIST_QUERY_KEY, network],
    queryFn: !network
      ? skipToken
      : () =>
          axios
            .get(`https://raw.githubusercontent.com/alephium/token-list/master/tokens/${network}.json`)
            .then(({ data }) => (data as TokenList)?.tokens),
    initialData: network === 'mainnet' ? mainnet.tokens : network === 'testnet' ? testnet.tokens : [],
    staleTime: ONE_DAY_MS
  })

  // TODO: Maybe return an object instead of an array for faster search?
  return {
    data,
    isLoading
  }
}
