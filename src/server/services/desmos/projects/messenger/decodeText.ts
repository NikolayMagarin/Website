/**
 * Рашифорвывает сообщение в текст. Каждый байт = 1 символ
 */
export function decodeText(encoded: string) {
  const bytes = encoded.match(/(.{1,8})/g) || [];
  let result = '';
  bytes.forEach((byte) => {
    result += String.fromCharCode(parseInt(byte, 2));
  });

  return result;
}
