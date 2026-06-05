import { LanguageSwitcher } from '@/i18n/LanguageSwitcher'

export function AppHeader() {
  const { t } = useTranslation()
  return (
    <div className="relative flex w-full items-center justify-center">
      <h1 className="text-center text-2xl font-bold text-slate-900">
        {t('app.title')}
      </h1>
      <div className="absolute inset-e-0 top-0">
        <LanguageSwitcher />
      </div>
    </div>
  )
}
