export function log(message: string, data?: Record<string, any>) {
  const url = new URL(window.location.origin);
  url.pathname = 'api/log';
  fetch(url, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, ...(data ? { data } : {}) }),
  });
}
