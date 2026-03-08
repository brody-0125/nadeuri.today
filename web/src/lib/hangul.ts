const CHOSUNG_LIST = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ',
  'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
] as const;

const HANGUL_START = 0xAC00;
const HANGUL_END = 0xD7A3;
const JONGSUNG_COUNT = 28;
const JUNGSUNG_COUNT = 21;

/**
 * 한글 음절인지 판별한다.
 */
function isHangulSyllable(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= HANGUL_START && code <= HANGUL_END;
}

/**
 * 문자가 초성(자음) 문자인지 판별한다.
 * 유니코드 한글 자모 영역(ㄱ=0x3131 ~ ㅎ=0x314E) 중 초성에 해당하는 문자.
 */
function isChosungChar(char: string): boolean {
  return CHOSUNG_LIST.includes(char as typeof CHOSUNG_LIST[number]);
}

/**
 * 문자열에서 각 한글 음절의 초성만 추출한다.
 * 한글이 아닌 문자는 그대로 유지한다.
 */
export function getChosung(str: string): string {
  let result = '';
  for (const char of str) {
    if (isHangulSyllable(char)) {
      const code = char.charCodeAt(0);
      const chosungIndex = Math.floor((code - HANGUL_START) / (JUNGSUNG_COUNT * JONGSUNG_COUNT));
      result += CHOSUNG_LIST[chosungIndex];
    } else {
      result += char;
    }
  }
  return result;
}

/**
 * 문자열의 모든 문자가 초성(자음)인지 판별한다.
 */
export function isChosungOnly(str: string): boolean {
  if (str.length === 0) return false;
  for (const char of str) {
    if (!isChosungChar(char)) {
      return false;
    }
  }
  return true;
}

/**
 * 초성 쿼리가 대상 문자열과 매칭되는지 판별한다.
 * query의 각 초성이 target의 초성과 순서대로 일치하면 true.
 */
export function matchChosung(query: string, target: string): boolean {
  const targetChosung = getChosung(target);
  return targetChosung === query;
}
