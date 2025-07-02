/// <reference types="vite/client" />

export {};

declare global {
  interface Window {
    ethereum?: any;
  }

  interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    // add other VITE_ variables as needed
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
