export {};

declare global {
  interface Window {
    // SimpleAnalytics custom-event hook used by the bills share/question UI.
    sa_event?: (event: string) => void;
  }
}
