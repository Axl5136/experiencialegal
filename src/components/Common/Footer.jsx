import { useLanguage } from '../../hooks/useLanguage'

function Footer() {
  const { t } = useLanguage()
  return (
    <footer className="border-t border-border bg-white px-6 py-3 text-center text-xs text-foreground/40">
      © 2024 {t('common.appName')}. {t('common.disclaimer')}
    </footer>
  )
}

export default Footer
