import i18n, { isRtl } from '@/i18n';

function applyLangDir(lng: string) {
  const root = document.documentElement;
  root.lang = lng;
  root.dir = isRtl(lng) ? 'rtl' : 'ltr';
}

applyLangDir(i18n.language);
i18n.on('languageChanged', applyLangDir);
