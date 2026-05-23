import { LanguageSwitcher } from '@/i18n/LanguageSwitcher';

export function AppHeader() {
  const { t } = useTranslation();
  return (
    <>
      <h1 className="text-center text-2xl font-bold text-slate-900">
        {t('game.title')}
      </h1>
      <p className="text-center text-sm text-slate-500">{t('game.subtitle')}</p>
      <div className="absolute inset-e-0 top-0">
        <LanguageSwitcher />
      </div>
    </>
  );
}
