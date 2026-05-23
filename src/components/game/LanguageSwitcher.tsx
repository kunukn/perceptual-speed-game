import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Settings } from 'lucide-react';
import { useLocalStorage } from 'usehooks-ts';

type Lang = 'en' | 'da';

const LANGUAGES: readonly { code: Lang; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'da', label: 'Dansk' },
];

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useLocalStorage<Lang>('perceptual-speed-lang', 'en');

  /* Apply persisted choice on mount and whenever it changes. */
  useEffect(() => {
    if (i18n.language !== lang) void i18n.changeLanguage(lang);
  }, [lang, i18n]);

  return (
    <Popover
      onOpenChange={(open) => {
        /* Warm the cache for every supported language while the user is deciding. */
        if (open) void i18n.loadLanguages(LANGUAGES.map((l) => l.code));
      }}
    >
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost" aria-label={t('common.settings')}>
          <Settings className="size-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-900">
            {t('common.language')}
          </p>
          <RadioGroup
            value={lang}
            onValueChange={(value) => setLang(value as Lang)}
            className="gap-2"
          >
            {LANGUAGES.map(({ code, label }) => (
              <div key={code} className="flex items-center gap-2">
                <RadioGroupItem id={`lang-${code}`} value={code} />
                <Label htmlFor={`lang-${code}`} className="text-sm font-normal">
                  {label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          <p className="border-t pt-2 text-xs leading-none text-slate-500">
            {import.meta.env.VITE_APP_VERSION}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
