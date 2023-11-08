/*
Copyright 2018 - 2023 The Alephium Authors
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

import {
  BuildDeployContractTxResult,
  BuildExecuteScriptTxResult,
  BuildTransactionResult
} from '@alephium/web3/dist/src/api/api-alephium'
import { SignClientTypes } from '@walletconnect/types'

import { CallContractTxData, DeployContractTxData, TransferTxData } from '@/types/transactions'

export type SessionRequestEvent = SignClientTypes.EventArguments['session_request']

export type SessionProposalEvent = Pick<SignClientTypes.EventArguments['session_proposal'], 'id' | 'params'>

export type SessionRequestData =
  | {
      type: 'transfer'
      wcData: TransferTxData
      unsignedTxData: BuildTransactionResult
    }
  | {
      type: 'call-contract'
      wcData: CallContractTxData
      unsignedTxData: BuildExecuteScriptTxResult
    }
  | {
      type: 'deploy-contract'
      wcData: DeployContractTxData
      unsignedTxData: BuildDeployContractTxResult
    }
