import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '../../hooks/useLanguage'

function CredentialBadges({ credentials }) {
  const { t } = useLanguage()

  if (!credentials || credentials.length === 0) {
    return <p className="text-sm text-foreground/50">{t('blockchain.credentials.empty')}</p>
  }

  return (
    <ul className="space-y-2">
      {credentials.map((cred, idx) => {
        const daysLeft = Math.ceil((new Date(cred.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))

        let style = 'border-success/30 bg-success/10 text-success'
        let Icon = CheckCircleIcon
        if (cred.revoked) {
          style = 'border-destructive/30 bg-destructive/10 text-destructive'
          Icon = XCircleIcon
        } else if (daysLeft < 30) {
          style = 'border-warning/30 bg-warning/10 text-warning'
          Icon = ExclamationTriangleIcon
        }

        return (
          <li key={idx} className={`flex items-start gap-2 rounded-lg border p-3 ${style}`}>
            <Icon className="h-5 w-5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">{cred.type}</p>
              <p className="text-xs opacity-80">
                {cred.revoked ? t('blockchain.credentials.revoked') : `${daysLeft} ${t('blockchain.credentials.daysLeftSuffix')}`}
              </p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default CredentialBadges
