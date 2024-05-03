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

import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'

import { client, hashQueryKeyArray, PAGINATION_PAGE_LIMIT } from '@/api'

export const addressesQueries = {
  balances: {
    getAddressTokensBalances: (addressHash: string) =>
      queryOptions({
        queryKey: ['getAddressTokensBalances', addressHash],
        queryFn: async () => {
          const addressTotalTokenBalances = []
          let addressTokensPageResults = []
          let page = 1

          while (page === 1 || addressTokensPageResults.length === PAGINATION_PAGE_LIMIT) {
            addressTokensPageResults = await client.explorer.addresses.getAddressesAddressTokensBalance(addressHash, {
              limit: PAGINATION_PAGE_LIMIT,
              page
            })

            addressTotalTokenBalances.push(...addressTokensPageResults)

            page += 1
          }

          return addressTotalTokenBalances
        }
      }),
    getAddressAlphBalances: (addressHash: string) =>
      queryOptions({
        queryKey: ['getAddressAlphBalances', addressHash],
        queryFn: async () => await client.explorer.addresses.getAddressesAddressBalance(addressHash)
      })
  },
  transactions: {
    getAddressesTransactions: (addressesHashes: string[] = []) =>
      infiniteQueryOptions({
        queryKey: ['getAddressesTransactions', hashQueryKeyArray(addressesHashes)],
        queryFn: async ({ pageParam }) =>
          await client.explorer.addresses.postAddressesTransactions(
            { page: pageParam, limit: PAGINATION_PAGE_LIMIT },
            addressesHashes
          ),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages, lastPageParam) => (lastPageParam += 1)
      }),
    getAddressPendingTransactions: (addressHash: string) =>
      queryOptions({
        queryKey: ['getAddressPendingTransactions', addressHash],
        queryFn: async () => await client.explorer.addresses.getAddressesAddressMempoolTransactions(addressHash)
      })
  }
}
