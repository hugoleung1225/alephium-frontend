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

import { Asset } from '@alephium/sdk'
import { TokenList } from '@alephium/token-list'
import { createAsyncThunk } from '@reduxjs/toolkit'

import client from '@/api/client'
import { TokenBasicMetadata, TokenMetadataWithId } from '@/types/assets'

export const syncNetworkTokensInfo = createAsyncThunk('assets/syncNetworkTokensInfo', async () => {
  let metadata = undefined
  const network = client.networkType

  if (network) {
    try {
      const response = await fetch(
        `https://raw.githubusercontent.com/alephium/token-list/master/tokens/${network}.json`
      )
      metadata = (await response.json()) as TokenList
    } catch (e) {
      console.warn('No metadata for network ', network)
    }
  }

  return metadata
})

export const syncUnknownTokensInfo = createAsyncThunk(
  'assets/syncUnknownTokensInfo',
  async (unknownTokenIds: Asset['id'][]): Promise<TokenBasicMetadata[]> => {
    const results = await Promise.allSettled(
      unknownTokenIds.map((id) =>
        client.node.fetchStdTokenMetaData(id).then((data) => ({
          id,
          ...data
        }))
      )
    )

    return (
      results.filter(({ status }) => status === 'fulfilled') as PromiseFulfilledResult<TokenMetadataWithId>[]
    ).map(({ value: { totalSupply, ...rest } }) => rest)
  }
)
