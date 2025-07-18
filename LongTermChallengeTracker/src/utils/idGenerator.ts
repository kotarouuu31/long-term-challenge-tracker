/**
 * 安全なID生成関数
 * crypto.getRandomValues()に依存せず、タイムスタンプとランダム値を組み合わせて一意のIDを生成
 */
export const generateId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomPart}`;
};
