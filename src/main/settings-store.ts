import Store from 'electron-store'
import { AppSettings, DEFAULT_SETTINGS } from '../shared/types'

const store = new Store<AppSettings>({
  defaults: DEFAULT_SETTINGS,
  name: 'settings'
})

export function getSettings(): AppSettings {
  return store.store
}

export function setSettings(partial: Partial<AppSettings>): AppSettings {
  for (const [key, value] of Object.entries(partial)) {
    store.set(key as keyof AppSettings, value)
  }
  return store.store
}
