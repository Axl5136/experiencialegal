import { CheckCircleIcon, WalletIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '../../hooks/useLanguage'
import { useBlockchain } from '../../hooks/useBlockchain'
import Modal from '../Common/Modal'

function shortAddress(address) {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

function WalletConnectModal({ isOpen, onClose }) {
  const { t } = useLanguage()
  const { wallet, connected, loading, error, connectWallet } = useBlockchain()

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('blockchain.walletModal.title')}>
      {connected ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/10 p-4">
            <CheckCircleIcon className="h-6 w-6 shrink-0 text-success" />
            <div>
              <p className="text-sm font-semibold text-foreground">{t('blockchain.walletModal.connected')}</p>
              <p className="mt-0.5 font-mono text-xs text-foreground/60">{shortAddress(wallet.address)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full cursor-pointer rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity duration-200 hover:opacity-90"
          >
            {t('blockchain.walletModal.close')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <p className="text-sm text-foreground/70">{t('blockchain.walletModal.description')}</p>

          <button
            type="button"
            onClick={connectWallet}
            disabled={loading}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <WalletIcon className="h-4 w-4" />
            {loading ? t('blockchain.walletModal.connecting') : t('blockchain.walletModal.connect')}
          </button>

          <p className="text-center text-xs text-foreground/50">{t('blockchain.walletModal.hint')}</p>
        </div>
      )}
    </Modal>
  )
}

export default WalletConnectModal
