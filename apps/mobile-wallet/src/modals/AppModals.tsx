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

import styled from 'styled-components/native'

import { selectAllModals } from '~/features/modals/modalSelectors'
import { useAppSelector } from '~/hooks/redux'
import BuyModal from '~/modals/BuyModal'

const AppModals = () => {
  const openedModals = useAppSelector(selectAllModals)

  return (
    <ModalsContainer pointerEvents={openedModals.length > 0 ? 'auto' : 'none'}>
      {openedModals.map((modal) => {
        switch (modal.params.name) {
          case 'BuyModal':
            return <BuyModal id={modal.id} key={modal.id} {...modal.params.props} />
        }
      })}
    </ModalsContainer>
  )
}

export default AppModals

const ModalsContainer = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`
