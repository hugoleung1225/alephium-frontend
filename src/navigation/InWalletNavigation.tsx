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

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import {
  ArrowLeftRight as ArrowsIcon,
  LayoutTemplate as LayoutTemplateIcon,
  List as ListIcon
} from 'lucide-react-native'

import FooterMenu from '../components/FooterMenu'
import { InWalletLayoutContextProvider } from '../contexts/InWalletLayoutContext'
import AddressesScreen from '../screens/AddressesScreen'
import DashboardScreen from '../screens/DashboardScreen'
import TransfersScreen from '../screens/TransfersScreen'
import InWalletTabsParamList from './inWalletRoutes'

const InWalletTabs = createBottomTabNavigator<InWalletTabsParamList>()

const InWalletTabsNavigation = () => (
  <InWalletLayoutContextProvider>
    <InWalletTabs.Navigator
      screenOptions={{
        headerStyle: [{ elevation: 0, shadowOpacity: 0 }],
        headerTitle: ''
      }}
      tabBar={(props) => <FooterMenu {...props} />}
    >
      <InWalletTabs.Screen
        name="DashboardScreen"
        component={DashboardScreen}
        options={{
          title: 'Overview',
          tabBarIcon: ({ color, size }) => <ListIcon color={color} size={size} />
        }}
      />
      <InWalletTabs.Screen
        name="TransfersScreen"
        component={TransfersScreen}
        options={{
          title: 'Transfers',
          tabBarIcon: ({ color, size }) => <ArrowsIcon color={color} size={size} />
        }}
      />
      <InWalletTabs.Screen
        name="AddressesScreen"
        component={AddressesScreen}
        options={{
          title: 'Addresses',
          tabBarIcon: ({ color, size }) => <LayoutTemplateIcon color={color} size={size} />
        }}
      />
    </InWalletTabs.Navigator>
  </InWalletLayoutContextProvider>
)

export default InWalletTabsNavigation
