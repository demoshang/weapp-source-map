export {};

declare global {
  interface Window {
    DOMAIN: string;
  }

  const DOMAIN: string;

  interface Document {
    webkitHidden: boolean;
  }
}
