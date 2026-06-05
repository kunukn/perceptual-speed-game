import { GitHubIcon } from '@/components/icons/GitHubIcon'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Settings } from 'lucide-react'
import { useLocalStorage } from 'usehooks-ts'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'da', label: 'Dansk' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'pt', label: 'Português' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'ru', label: 'Русский' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'ar', label: 'العربية' },
  { code: 'ur', label: 'اردو' },
] as const

type Lang = (typeof LANGUAGES)[number]['code']

/* Fallback ordering by approximate global speaker count (L1 + L2). */
const FALLBACK_ORDER: readonly Lang[] = [
  'en',
  'zh',
  'hi',
  'es',
  'ar',
  'bn',
  'pt',
  'ru',
  'ja',
  'de',
  'fr',
  'ur',
  'id',
  'da',
]

const LANGUAGES_BY_SPEAKERS = FALLBACK_ORDER.map(
  (code) => LANGUAGES.find((l) => l.code === code)!,
)

const MAX_RECENTS = 3

function detectInitialLang(): Lang {
  if (typeof navigator === 'undefined') return 'en'

  const primary = navigator.language?.split('-')[0]?.toLowerCase()
  const match = LANGUAGES.find((l) => l.code === primary)

  return match ? match.code : 'en'
}

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  const [lang, setLang] = useLocalStorage<Lang>(
    'perceptual-speed-lang',
    detectInitialLang(),
  )
  const [recents, setRecents] = useLocalStorage<Lang[]>(
    'perceptual-speed-lang-recents',
    [],
  )

  /* Apply persisted choice on mount and whenever it changes. */
  useEffect(() => {
    if (i18n.language !== lang) void i18n.changeLanguage(lang)
  }, [lang, i18n])

  const handleSelect = (value: string) => {
    const next = value as Lang
    setLang(next)
    setRecents((prev) =>
      [next, ...prev.filter((c) => c !== next)].slice(0, MAX_RECENTS),
    )
  }

  const pinnedCodes = Array.from(new Set<Lang>([lang, ...recents])).slice(
    0,
    MAX_RECENTS,
  )
  const pinned = pinnedCodes
    .map((c) => LANGUAGES.find((l) => l.code === c))
    .filter((l): l is (typeof LANGUAGES)[number] => l !== undefined)
  const rest = LANGUAGES_BY_SPEAKERS.filter(
    (l) => !pinnedCodes.includes(l.code),
  )

  const renderItem = ({ code, label }: { code: Lang; label: string }) => (
    <div key={code} className="flex items-center gap-2">
      <RadioGroupItem id={`lang-${code}`} value={code} />
      <Label htmlFor={`lang-${code}`} className="text-sm font-normal">
        {label}
      </Label>
    </div>
  )

  return (
    <Popover
      onOpenChange={(open) => {
        /* Warm the cache for every supported language while the user is deciding. */
        if (open) void i18n.loadLanguages(LANGUAGES.map((l) => l.code))
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="ghost" aria-label={t('common.settings')}>
          <Settings className="size-5" />
          <span className="hidden lg:inline">{t('common.settings')}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48">
        <div className="space-y-4">
          <p className="text-sm font-medium text-slate-900">
            {t('common.language')}
          </p>
          <RadioGroup
            value={lang}
            onValueChange={handleSelect}
            className="gap-2"
          >
            {pinned.map(renderItem)}
            {pinned.length > 0 && rest.length > 0 && (
              <div className="border-t" />
            )}
            {rest.map(renderItem)}
          </RadioGroup>
          <div className="flex items-center gap-2 border-t px-1 pt-2">
            <p className="text-sm leading-none text-slate-500">
              {import.meta.env.VITE_APP_VERSION}
            </p>
            <a
              href="https://github.com/kunukn/perceptual-speed-game"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
              className="p-1"
            >
              <GitHubIcon size={16} />
            </a>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
