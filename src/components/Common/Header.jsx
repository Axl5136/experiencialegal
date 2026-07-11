import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../hooks/useLanguage'

function Header() {
  const { user, logout } = useAuth()
  const { language, setLanguage, t } = useLanguage()

  return (
    <header className="flex items-center justify-between border-b border-border bg-white px-6 py-4">
      <span className="font-heading text-lg font-semibold text-primary">{t('common.appName')}</span>
      <div className="flex items-center gap-4 text-sm">
        <span className="hidden text-foreground/70 sm:inline">
          {t('common.hello')}, {user?.nombre}
        </span>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="cursor-pointer rounded-md border border-border px-2 py-1 transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="es">ES</option>
          <option value="en">EN</option>
        </select>
        <button
          onClick={logout}
          className="flex cursor-pointer items-center gap-1.5 text-foreground/60 transition-colors duration-200 hover:text-destructive"
        >
          <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{t('common.logout')}</span>
        </button>
      </div>
    </header>
  )
}

export default Header
