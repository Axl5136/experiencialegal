import { useState } from 'react'
import { CheckBadgeIcon, DocumentTextIcon, KeyIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '../../hooks/useLanguage'
import { useBlockchain } from '../../hooks/useBlockchain'
import Modal from '../Common/Modal'

function SignatureModal({ isOpen, onClose, expedienteId, documentId, documentName }) {
  const { t } = useLanguage()
  const { prepareSignature, signAndVerify, loading, error } = useBlockchain()
  const [step, setStep] = useState(1) // 1=prepare, 2=sign, 3=success
  const [eip712Data, setEip712Data] = useState(null)
  const [certificateId, setCertificateId] = useState(null)

  const handleClose = () => {
    setStep(1)
    setEip712Data(null)
    setCertificateId(null)
    onClose()
  }

  const handlePrepare = async () => {
    try {
      const data = await prepareSignature(expedienteId, documentId)
      setEip712Data(data)
      setStep(2)
    } catch {
      // El error ya queda expuesto vía `error` del context
    }
  }

  const handleSign = async () => {
    if (!eip712Data) return
    try {
      const result = await signAndVerify(eip712Data, expedienteId, documentId)
      setCertificateId(result.certId)
      setStep(3)
    } catch {
      // El error ya queda expuesto vía `error` del context
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('blockchain.signatureModal.title')}>
      <div className="space-y-4">
        {step === 1 && (
          <>
            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted p-4">
              <DocumentTextIcon className="h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">{documentName}</p>
                <p className="mt-1 text-xs text-foreground/60">{t('blockchain.signatureModal.intro')}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handlePrepare}
              disabled={loading}
              className="w-full cursor-pointer rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? t('blockchain.signatureModal.preparing') : t('blockchain.signatureModal.prepare')}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4">
              <KeyIcon className="h-5 w-5 shrink-0 text-warning" />
              <p className="text-xs text-foreground/70">{t('blockchain.signatureModal.confirmHint')}</p>
            </div>
            <button
              type="button"
              onClick={handleSign}
              disabled={loading}
              className="w-full cursor-pointer rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? t('blockchain.signatureModal.signing') : t('blockchain.signatureModal.sign')}
            </button>
          </>
        )}

        {step === 3 && certificateId && (
          <>
            <div className="flex items-start gap-3 rounded-lg border border-success/30 bg-success/10 p-4">
              <CheckBadgeIcon className="h-6 w-6 shrink-0 text-success" />
              <div>
                <p className="text-sm font-semibold text-success">{t('blockchain.signatureModal.success')}</p>
                <p className="mt-1 break-all font-mono text-xs text-foreground/60">
                  {t('blockchain.signatureModal.certificate')}: {certificateId}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-full cursor-pointer rounded-lg bg-muted px-4 py-2.5 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-border"
            >
              {t('blockchain.signatureModal.close')}
            </button>
          </>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>
    </Modal>
  )
}

export default SignatureModal
