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

import { AddressDetailsModalProps } from '@/modals/AddressDetailsModal'
import { AddressOptionsModalProps } from '@/modals/AddressOptionsModal'
import { CSVExportModalProps } from '@/modals/CSVExportModal'
import { NFTDetailsModalProps } from '@/modals/NFTDetailsModal'
import { ReceiveModalProps } from '@/modals/ReceiveModal'
import { SettingsModalProps } from '@/modals/SettingsModal'
import { TransactionDetailsModalProps } from '@/modals/TransactionDetailsModal'

const ModalNames = {
  AddressDetailsModal: 'AddressDetailsModal',
  CSVExportModal: 'CSVExportModal',
  NFTDetailsModal: 'NFTDetailsModal',
  TransactionDetailsModal: 'TransactionDetailsModal',
  AddressOptionsModal: 'AddressOptionsModal',
  SettingsModal: 'SettingsModal',
  ReceiveModal: 'ReceiveModal',
  WalletConnectModal: 'WalletConnectModal',
  SecretPhraseModal: 'SecretPhraseModal',
  WalletQRCodeExportModal: 'WalletQRCodeExportModal',
  EditWalletNameModal: 'EditWalletNameModal',
  NotificationsModal: 'NotificationsModal',
  AdvancedOperationsSideModal: 'AdvancedOperationsSideModal'
} as const

export type ModalName = keyof typeof ModalNames

export type OpenModalParams =
  | {
      name: typeof ModalNames.AddressDetailsModal
      props: AddressDetailsModalProps
    }
  | {
      name: typeof ModalNames.CSVExportModal
      props: CSVExportModalProps
    }
  | {
      name: typeof ModalNames.NFTDetailsModal
      props: NFTDetailsModalProps
    }
  | {
      name: typeof ModalNames.TransactionDetailsModal
      props: TransactionDetailsModalProps
    }
  | {
      name: typeof ModalNames.AddressOptionsModal
      props: AddressOptionsModalProps
    }
  | {
      name: typeof ModalNames.SettingsModal
      props: SettingsModalProps
    }
  | {
      name: typeof ModalNames.ReceiveModal
      props: ReceiveModalProps
    }
  | {
      name: typeof ModalNames.WalletConnectModal
    }
  | {
      name: typeof ModalNames.SecretPhraseModal
    }
  | {
      name: typeof ModalNames.WalletQRCodeExportModal
    }
  | {
      name: typeof ModalNames.EditWalletNameModal
    }
  | {
      name: typeof ModalNames.NotificationsModal
    }
  | {
      name: typeof ModalNames.AdvancedOperationsSideModal
    }

export type ModalInstance = {
  id: number
  params: OpenModalParams
}

export interface ModalBaseProp {
  id: ModalInstance['id']
}
