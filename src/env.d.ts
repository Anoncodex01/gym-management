/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ZENO_PAY_API_KEY: string
  readonly VITE_ZENO_PAY_ACCOUNT_ID: string
  readonly VITE_ZENO_PAY_SECRET_KEY: string
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
