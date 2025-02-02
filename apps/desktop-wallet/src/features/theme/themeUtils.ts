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

import { themeSettingsChanged, themeToggled } from '@/features/settings/settingsActions'
import SettingsStorage from '@/features/settings/settingsPersistentStorage'
import { GeneralSettings } from '@/features/settings/settingsTypes'
import { ThemeSettings, ThemeType } from '@/features/theme/themeTypes'
import { store } from '@/storage/store'
import { electron } from '@/utils/misc'

export const switchTheme = (theme: ThemeSettings) => {
  electron?.theme.setNativeTheme(theme)
  store.dispatch(themeSettingsChanged(theme))
}

export const toggleTheme = (theme: ThemeType) => {
  electron?.theme.setNativeTheme(theme)
  store.dispatch(themeToggled(theme))
}

export const getThemeType = () => {
  const storedSettings = SettingsStorage.load('general') as GeneralSettings

  return storedSettings.theme === 'system' ? 'dark' : storedSettings.theme
}
