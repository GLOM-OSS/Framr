export function getRandomID() {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 36; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}
