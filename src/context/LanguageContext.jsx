import { useMemo, useState } from 'react'
import { LanguageContext } from './language-context'
import es from '../locales/es.json'
import en from '../locales/en.json'

const DICTIONARIES = { es, en }

function readStoredLanguage() {
  try {
    const raw = localStorage.getItem('preferences')
    const prefs = raw ? JSON.parse(raw) : null
    return prefs?.language === 'en' ? 'en' : 'es'
  } catch {
    return 'es'
  }
}

function resolvePath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj)
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(readStoredLanguage)

  const setLanguage = (lang) => {
    const next = lang === 'en' ? 'en' : 'es'
    setLanguageState(next)
    const raw = localStorage.getItem('preferences')
    const prefs = raw ? JSON.parse(raw) : {}
    localStorage.setItem('preferences', JSON.stringify({ ...prefs, language: next }))
  }

  const t = useMemo(() => {
    const dict = DICTIONARIES[language] || DICTIONARIES.es
    return (key) => resolvePath(dict, key) ?? key
  }, [language])

  const value = { language, setLanguage, t }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
