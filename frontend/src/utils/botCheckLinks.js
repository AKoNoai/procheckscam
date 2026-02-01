// Lưu trữ link BOT CHECK, giả lập localStorage, có thể thay bằng API thực tế
export function getBotCheckLinks() {
  // Chỉ lấy 1 link duy nhất, nếu chưa có thì trả về mảng rỗng
  const data = localStorage.getItem('botCheckLinks');
  if (data) return JSON.parse(data).slice(0, 1);
  return [];
}

export function setBotCheckLinks(links) {
  localStorage.setItem('botCheckLinks', JSON.stringify(links));
}
