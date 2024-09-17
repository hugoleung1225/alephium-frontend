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

import useAddressTokensByType from '@/api/apiDataHooks/address/useAddressTokensByType'
import useWalletTokensByType from '@/api/apiDataHooks/wallet/useWalletTokensByType'
import ExpandableTokensBalancesList from '@/features/assetsLists/ExpandableTokensBalancesList'
import { AddressNSTBalancesRow } from '@/features/assetsLists/tokenBalanceRow/AddressTokenBalancesRow'
import { WalletNSTBalancesRow } from '@/features/assetsLists/tokenBalanceRow/WalletTokenBalancesRow'
import { AddressTokensTabsProps, TokensTabsBaseProps } from '@/features/assetsLists/types'

export const AddressNSTsBalancesList = ({ addressHash, ...props }: AddressTokensTabsProps) => {
  const {
    data: { nstIds }
  } = useAddressTokensByType(addressHash)

  return (
    <ExpandableTokensBalancesList {...props} nbOfItems={3}>
      {nstIds.map((tokenId) => (
        <AddressNSTBalancesRow tokenId={tokenId} addressHash={addressHash} key={tokenId} />
      ))}
    </ExpandableTokensBalancesList>
  )
}

export const WalletNSTsBalancesList = (props: TokensTabsBaseProps) => {
  const {
    data: { nstIds }
  } = useWalletTokensByType()

  return (
    <ExpandableTokensBalancesList {...props} nbOfItems={3}>
      {nstIds.map((tokenId) => (
        <WalletNSTBalancesRow tokenId={tokenId} key={tokenId} />
      ))}
    </ExpandableTokensBalancesList>
  )
}
