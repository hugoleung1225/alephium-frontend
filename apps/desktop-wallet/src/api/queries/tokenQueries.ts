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

import { batchers, ONE_DAY_MS } from '@alephium/shared'
import { explorer, NFTMetaData, NFTTokenUriMetaData } from '@alephium/web3'
import { TokenInfo, TokenStdInterfaceId } from '@alephium/web3/dist/src/api/api-explorer'
import { queryOptions, skipToken, UseQueryResult } from '@tanstack/react-query'
import axios from 'axios'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import { combineIsLoading } from '@/api/apiDataHooks/apiDataHooksUtils'
import { getQueryConfig } from '@/api/apiDataHooks/utils/getQueryConfig'
import { convertTokenDecimalsToNumber, matchesNFTTokenUriMetaDataSchema } from '@/api/apiUtils'
import { TokenId } from '@/types/tokens'

export type TokenTypesQueryFnData = Record<explorer.TokenStdInterfaceId, TokenId[]>

export const StdInterfaceIds = Object.values(explorer.TokenStdInterfaceId)

interface TokenQueryProps extends SkipProp {
  id: TokenId
  networkId?: number
}

interface NFTQueryProps extends TokenQueryProps {
  tokenUri?: NFTMetaData['tokenUri']
}

enum NFTDataTypes {
  image = 'image',
  video = 'video',
  audio = 'audio',
  other = 'other'
}

type NFTDataType = keyof typeof NFTDataTypes

export const tokenTypeQuery = ({ id, networkId, skip }: TokenQueryProps) =>
  queryOptions({
    queryKey: ['token', 'type', id],
    // We always want to remember the type of a token, even when user navigates for too long from components that use
    // tokens.
    ...getQueryConfig({ staleTime: Infinity, gcTime: Infinity, networkId }),
    queryFn:
      !skip && networkId !== undefined
        ? async () => {
            const tokenInfo = await batchers.tokenTypeBatcher.fetch(id)

            return tokenInfo?.stdInterfaceId
              ? { ...tokenInfo, stdInterfaceId: tokenInfo.stdInterfaceId as TokenStdInterfaceId }
              : null
          }
        : skipToken
  })

export const combineTokenTypeQueryResults = (results: UseQueryResult<TokenInfo | null>[]) => ({
  data: results.reduce(
    (tokenIdsByType, { data: tokenInfo }) => {
      if (!tokenInfo) return tokenIdsByType
      const stdInterfaceId = tokenInfo.stdInterfaceId as explorer.TokenStdInterfaceId

      if (StdInterfaceIds.includes(stdInterfaceId)) {
        tokenIdsByType[stdInterfaceId].push(tokenInfo.token)
      } else {
        // Except from NonStandard, the interface might be any string or undefined. We merge all that together.
        tokenIdsByType[explorer.TokenStdInterfaceId.NonStandard].push(tokenInfo.token)
      }

      return tokenIdsByType
    },
    {
      [explorer.TokenStdInterfaceId.Fungible]: [],
      [explorer.TokenStdInterfaceId.NonFungible]: [],
      [explorer.TokenStdInterfaceId.NonStandard]: []
    } as Record<explorer.TokenStdInterfaceId, TokenId[]>
  ),
  ...combineIsLoading(results)
})

export const fungibleTokenMetadataQuery = ({ id, networkId, skip }: TokenQueryProps) =>
  queryOptions({
    queryKey: ['token', 'fungible', 'metadata', id],
    ...getQueryConfig({ staleTime: Infinity, gcTime: Infinity, networkId }),
    meta: { isMainnet: networkId === 0 },
    queryFn: !skip
      ? async () => {
          const tokenMetadata = await batchers.ftMetadataBatcher.fetch(id)

          return tokenMetadata ? convertTokenDecimalsToNumber(tokenMetadata) : null
        }
      : skipToken
  })

export const nftMetadataQuery = ({ id, networkId, skip }: TokenQueryProps) =>
  queryOptions({
    queryKey: ['token', 'non-fungible', 'metadata', id],
    ...getQueryConfig({ staleTime: Infinity, gcTime: Infinity, networkId }),
    queryFn: !skip ? async () => (await batchers.nftMetadataBatcher.fetch(id)) ?? null : skipToken
  })

export const nftDataQuery = ({ id, tokenUri, networkId, skip }: NFTQueryProps) =>
  queryOptions({
    queryKey: ['token', 'non-fungible', 'data', id],
    // We don't want to delete the NFT data when the user navigates away from NFT components.
    ...getQueryConfig({ staleTime: ONE_DAY_MS, gcTime: Infinity, networkId }),
    queryFn:
      !skip && !!tokenUri
        ? async () => {
            const res = await axios.get(tokenUri)
            const nftData = res.data as NFTTokenUriMetaData

            if (!nftData || !nftData.name) {
              return Promise.reject()
            }

            const dataTypeRes = nftData.image ? (await axios.get(nftData.image)).headers['content-type'] || '' : ''

            const dataTypeCategory = dataTypeRes.split('/')[0]

            const dataType = dataTypeCategory in NFTDataTypes ? (dataTypeCategory as NFTDataType) : 'other'

            return matchesNFTTokenUriMetaDataSchema(nftData)
              ? { id, dataType, ...nftData }
              : {
                  id,
                  dataType,
                  name: nftData.name,
                  image: nftData.image ? nftData.image.toString() : ''
                }
          }
        : skipToken
  })
