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

import { useInfiniteQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import useFetchWalletLatestTransaction from '@/api/apiDataHooks/wallet/useFetchWalletLatestTransaction'
import { walletTransactionsInfiniteQuery } from '@/api/queries/transactionQueries'
import queryClient from '@/api/queryClient'
import { useAppSelector } from '@/hooks/redux'
import { useCappedAddressesHashes } from '@/hooks/useAddresses'
import { selectCurrentlyOnlineNetworkId } from '@/storage/network/networkSelectors'

const useFetchWalletTransactionsInfinite = () => {
  const networkId = useAppSelector(selectCurrentlyOnlineNetworkId)
  const { addressHashes, isCapped } = useCappedAddressesHashes()

  const { data: latestTx, isLoading: isLoadingLatestTx } = useFetchWalletLatestTransaction()

  const query = walletTransactionsInfiniteQuery({ addressHashes, networkId, skip: isLoadingLatestTx })

  const { data, fetchNextPage, isLoading, hasNextPage, isFetchingNextPage } = useInfiniteQuery(query)

  const refresh = useCallback(() => queryClient.refetchQueries({ queryKey: query.queryKey }), [query.queryKey])

  const fetchedConfirmedTxs = useMemo(() => data?.pages.flat() ?? [], [data?.pages])
  const latestFetchedTxHash = fetchedConfirmedTxs[0]?.hash
  const latestUnfetchedTxHash = latestTx?.hash
  const showNewTxsMessage = !isLoading && latestUnfetchedTxHash && latestFetchedTxHash !== latestUnfetchedTxHash

  return {
    data: fetchedConfirmedTxs,
    fetchNextPage,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    refresh,
    showNewTxsMessage,
    isDataComplete: !isCapped
  }
}

export default useFetchWalletTransactionsInfinite
