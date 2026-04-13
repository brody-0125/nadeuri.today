import koMessages from '../../messages/ko.json';
import enMessages from '../../messages/en.json';
import jaMessages from '../../messages/ja.json';
import zhMessages from '../../messages/zh.json';

export type Messages = typeof koMessages;

export const messagesMap: Record<string, Messages> = {
  ko: koMessages,
  en: enMessages,
  ja: jaMessages,
  zh: zhMessages,
};

export function getMessages(locale: string): Messages {
  return messagesMap[locale] ?? koMessages;
}
