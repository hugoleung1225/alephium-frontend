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
import styled from 'styled-components'

import useToken, { isFT } from '@/api/apiDataHooks/useToken'
import { useTokenPrice } from '@/api/apiDataHooks/useTokenPrices'
import Amount from '@/components/Amount'
import SkeletonLoader from '@/components/SkeletonLoader'
import { TokenBalancesRowBaseProps } from '@/features/assetsLists/tokenBalanceRow/types'

interface FTWorth extends TokenBalancesRowBaseProps {
  isLoadingBalance: boolean
  totalBalance?: bigint
}

const FTWorth = ({ tokenId, totalBalance, isLoadingBalance }: FTWorth) => {
  const { data: token } = useToken(tokenId)

  const symbol = isFT(token) ? token.symbol : undefined

  const { data: tokenPrice, isLoading: isLoadingTokenPrice } = useTokenPrice(symbol ? { symbol } : { skip: true })

  if (!isFT(token)) return null

  if (isLoadingBalance || isLoadingTokenPrice) return <SkeletonLoader height="20px" width="30%" />

  const worth =
    totalBalance !== undefined && tokenPrice !== undefined
      ? calculateAmountWorth(totalBalance, tokenPrice.price, token.decimals)
      : undefined

  if (worth === undefined) return null

  return (
    <Worth>
      <Amount value={worth} isFiat />
    </Worth>
  )
}

export default FTWorth

const Worth = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.font.secondary};
`
