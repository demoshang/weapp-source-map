import { Errors } from './error';

type Request =
  | {
      method: 'GET';
      path: string;
      qs: Record<string, any>;
      body?: Record<string, any>;
    }
  | {
      method: 'POST';
      path: string;
      qs?: Record<string, any>;
      body?: Record<string, any>;
    };

async function request({ method = 'POST', path, qs, body }: Request) {
  const url = new URL(DOMAIN + path);
  url.search = new URLSearchParams(qs).toString();

  const res = await fetch(url.href, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: '',
    },
    body: JSON.stringify(body),
  });

  if (res.status !== 200) {
    throw new Errors.ResponseCodeInvalid({ status: res.status });
  }

  const result = await res.json();

  if (`${result.code}` !== '1') {
    throw new Errors.ResponseCodeInvalid(result);
  }

  return result.content;
}

export { request };
