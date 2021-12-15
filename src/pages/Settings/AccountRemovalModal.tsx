// Copyright 2018 - 2021 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

import { useTheme } from 'styled-components'

import Modal from '../../components/Modal'
import { AlertTriangle } from 'lucide-react'
import { Button } from '../../components/Buttons'
import InfoBox from '../../components/InfoBox'
import { Section } from '../../components/PageComponents/PageContainers'
import { CenteredSecondaryParagraph } from '../../components/Paragraph'

const AccountRemovalModal = ({ onAccountRemove, onClose }: { onAccountRemove: () => void; onClose: () => void }) => {
  const theme = useTheme()

  return (
    <Modal title="Remove account" onClose={onClose} focusMode>
      <Section>
        <AlertTriangle size={60} color={theme.global.alert} style={{ marginBottom: 35 }} />
      </Section>
      <Section>
        <InfoBox
          importance="alert"
          text="Please make sure to have your secret phrase saved and stored somewhere secure to restore your wallet in the future. Without the 24 words, your wallet will be unrecoverable and permanently lost."
        />

        <CenteredSecondaryParagraph>
          <b>Not your keys, not your coins.</b>
        </CenteredSecondaryParagraph>
      </Section>
      <Section inList>
        <Button alert onClick={onAccountRemove}>
          CONFIRM REMOVAL
        </Button>
      </Section>
    </Modal>
  )
}

export default AccountRemovalModal
