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

import { orderBy } from 'lodash'
import { useMemo } from 'react'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import { useFetchWalletActivityTimestamps } from '@/api/apiDataHooks/wallet/useFetchWalletLastTransactions'
import { useAppSelector } from '@/hooks/redux'
import { selectDefaultAddress } from '@/storage/addresses/addressesSelectors'

const useFetchWalletAddressesActivityTimestampsSorted = (props?: SkipProp) => {
  const { hash: defaultAddressHash } = useAppSelector(selectDefaultAddress)
  const { data: addressesTimestamps, isLoading } = useFetchWalletActivityTimestamps({ skip: props?.skip })

  return {
    data: useMemo(
      () =>
        orderBy(
          addressesTimestamps,
          ({ addressHash, latestTxTimestamp }) =>
            addressHash === defaultAddressHash ? undefined : latestTxTimestamp ?? 0,
          'desc'
        ),
      [addressesTimestamps, defaultAddressHash]
    ),
    isLoading
  }
}

export default useFetchWalletAddressesActivityTimestampsSorted
