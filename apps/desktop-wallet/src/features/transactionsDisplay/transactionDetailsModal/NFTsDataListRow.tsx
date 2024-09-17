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

import { NFT } from '@alephium/shared'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import DataList from '@/components/DataList'
import NFTThumbnail from '@/components/NFTThumbnail'
import { openModal } from '@/features/modals/modalActions'
import { TransactionDetailsModalSectionProps } from '@/features/transactionsDisplay/transactionDetailsModal/types'
import useFetchTransactionTokens from '@/features/transactionsDisplay/useFetchTransactionTokens'
import { useAppDispatch } from '@/hooks/redux'

const NFTsDataListRow = ({ tx, addressHash }: TransactionDetailsModalSectionProps) => {
  const {
    data: { nfts }
  } = useFetchTransactionTokens(tx, addressHash)
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  if (nfts.length === 0) return null

  const openNFTDetailsModal = (nftId: NFT['id']) => dispatch(openModal({ name: 'NFTDetailsModal', props: { nftId } }))

  return (
    <DataList.Row label={t('NFTs')}>
      <NFTThumbnails>
        {nfts.map((nft) => (
          <NFTThumbnail nftId={nft.id} key={nft.id} onClick={() => openNFTDetailsModal(nft.id)} />
        ))}
      </NFTThumbnails>
    </DataList.Row>
  )
}

export default NFTsDataListRow

const NFTThumbnails = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`
