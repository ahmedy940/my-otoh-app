/// <reference types="vite/client" />
/// <reference types="@remix-run/node" />

declare namespace NodeJS {
  interface ProcessEnv {
    OPENAI_API_KEY: string;
    SHOPIFY_API_KEY: string;
    SHOPIFY_API_SECRET: string;
    SCOPES: string;
    SHOP_APP_URL: string;
    SHOP_CUSTOM_DOMAIN: string;
    OPENAI_ORGANIZATION_ID: string;
    HTTPS: string;
  }
}
