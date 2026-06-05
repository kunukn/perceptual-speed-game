/// <reference types="vite/client" />

type ImportMetaEnv = {
  readonly VITE_APP_VERSION: string
}

type ImportMeta = {
  readonly env: ImportMetaEnv
}
