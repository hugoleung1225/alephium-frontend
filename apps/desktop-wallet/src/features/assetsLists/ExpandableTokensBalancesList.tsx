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

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

import { fadeIn } from '@/animations'
import ExpandRowButton from '@/features/assetsLists/ExpandRowButton'
import { TokensTabsBaseProps } from '@/features/assetsLists/types'

interface ExpandableTokensBalancesListProps extends TokensTabsBaseProps {
  nbOfItems: number
  children: ReactNode[]
}

const ExpandableTokensBalancesList = ({
  className,
  children,
  nbOfItems,
  ...props
}: ExpandableTokensBalancesListProps) => (
  <>
    <motion.div {...fadeIn} className={className}>
      {children}
    </motion.div>
    <ExpandRowButton {...props} isEnabled={nbOfItems > 3} />
  </>
)

export default ExpandableTokensBalancesList
