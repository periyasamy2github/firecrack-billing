/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  // Shop identity for the sign-in screen, set at build time.
  readonly VITE_SHOP_NAME?: string
  readonly VITE_SHOP_TOWN?: string
  readonly VITE_SHOP_GSTIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
