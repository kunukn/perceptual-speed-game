---
applyTo: 'src/i18n/locales/*.json'
---

# Translation instructions

All user-facing strings in `src/i18n/locales/*.json` should read as friendly, plain, everyday language — never bureaucratic, courtroom-formal, or technical-sounding. Assume the audience may include children as well as adults.

## Tone rules

- **Plain words over technical compounds.** Prefer the everyday word a child would actually hear.
  - ❌ `Commence the activity` (formal, stiff)
  - ✅ `Let's start`
- **Use the casual "you" form** in languages that have one.
  - FR `tu` not `vous` (`Chante`, not `Chantez`)
  - ES `tú` not `usted` (`Pulsa`, `Mantén`)
  - DE `du` (already standard here — keep it)
  - ID `kamu` / `-mu` not `Anda`
  - PT casual `você` forms; drop `por favor`
- **Drop polite filler.** "Please", `Veuillez`, `Bitte`, `Por favor`, `Tafadhali`, `Пожалуйста`, `请`, `कृपया`, `অনুগ্রহ করে`, `يرجى` — all out.
  - ❌ `Please enable it in your browser settings`
  - ✅ `Turn it on in your browser settings`
- **No parenthetical plurals.** `item(s)`, `Eintrag/Einträge`, `result(s)` read like form letters. Use a plain plural, or use i18next's `_one` / `_other` plural keys.
  - ❌ `{count} item(s) found`
  - ✅ `{count} items found`
- **Keep established domain terminology.** Well-known domain terms stay in their accepted form rather than being translated word-by-word.
- **Never rename i18n keys to fit copy.** Keys are referenced from the codebase; only edit the string _values_ in `src/i18n/locales/*.json`. If the key name becomes misleading after rewording, leave it — a rename is a separate, code-touching change.

## Process

- When in doubt about a language you don't speak natively, change only the lowest-risk items (parenthetical plurals, dropping "please") and flag the file for native-speaker review. Don't guess.
- After editing locale files, run `pnpm format`
