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

import { NFT, selectNFTById } from '@alephium/shared'
import { Image } from 'expo-image'
import { memo, useEffect, useState } from 'react'
import styled, { useTheme } from 'styled-components/native'

import NFTPlaceholder from '~/components/NFTPlaceholder'
import NFTVideo from '~/components/NFTVideo'
import NFTWebView from '~/components/NFTWebView'
import { useAppSelector } from '~/hooks/redux'
import { BORDER_RADIUS_SMALL } from '~/style/globalStyle'

export interface NFTImageProps {
  nftId: NFT['id']
  size: number
  play?: boolean
}

enum NFTDataTypes {
  image = 'image',
  video = 'video',
  audio = 'audio',
  other = 'other'
}

type NFTDataType = keyof typeof NFTDataTypes

const NFTImage = ({ nftId, size, play }: NFTImageProps) => {
  const nft = useAppSelector((s) => selectNFTById(s, nftId))
  const theme = useTheme()

  const [hasError, setHasError] = useState(false)
  const [contentType, setContentType] = useState<NFTDataType>()

  const src = 'https://arweave.net/GCP1MY5LdqLBAVvWFpEzpejSfFbxtnmFtmTALiXcQHM'

  useEffect(() => {
    fetch(src).then((res) => {
      const contentType = res.headers.get('content-type') || ''
      const contentTypeCategory = contentType.split('/')[0]

      setContentType(contentTypeCategory in NFTDataTypes ? (contentTypeCategory as NFTDataType) : 'other')
    })
  }, [])

  if (!nft) return null

  // const src = nft.image

  const isDataUri = src.startsWith('data:image/')

  return hasError || contentType === 'other' ? (
    <NFTPlaceholder size={size} />
  ) : isDataUri ? (
    <NFTWebView imageUri={src} size={size} />
  ) : contentType === 'image' ? (
    <NFTImageStyled
      style={{ width: size, height: size }}
      transition={500}
      source={{ uri: src }}
      allowDownscaling
      contentFit="contain"
      onError={() => setHasError(true)}
      placeholder={{
        blurhash: theme.name === 'dark' ? 'L00000fQfQfQfQfQfQfQfQfQfQfQ' : 'L1PGpx-;fQ-;_3fQfQfQfQfQfQfQ'
      }}
    />
  ) : (
    <NFTVideo size={size} videoSource={src} play={play} />
  )
}

const NFTImageStyled = styled(Image)`
  border-radius: ${BORDER_RADIUS_SMALL}px;
  aspect-ratio: 1;
`

export default memo(NFTImage)
