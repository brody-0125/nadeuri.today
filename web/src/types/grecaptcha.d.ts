interface GrecaptchaInstance {
  execute(siteKey: string, options: { action: string }): Promise<string>;
  ready(callback: () => void): void;
}

declare global {
  interface Window {
    grecaptcha?: GrecaptchaInstance;
  }
}

export {};
