// KOREC Research Proxy - Cloudflare Worker
// Anthropic API への中継。KOREC社のAPI keyをサーバー側で保持し、
// メンバーはGitHub Pages経由で直接APIを叩かずに利用できる。
//
// セキュリティ:
// - Origin チェックで KOREC のGitHub Pagesからのリクエストのみ許可
// - CORS は明示許可ドメインのみ
// 環境変数 (Cloudflare Workers のSecretsで設定):
// - ANTHROPIC_API_KEY: KOREC のAnthropic APIキー

const ALLOWED_ORIGINS = [
  'https://yisao402-cell.github.io',
  // ローカルテスト用
  'http://localhost:8000',
  'http://localhost:8765',
  'http://127.0.0.1:8000',
  'http://127.0.0.1:8765',
];

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const headers = corsHeaders(origin);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    if (request.method === 'GET') {
      return new Response('KOREC Research Proxy is running.', {
        status: 200,
        headers: { ...headers, 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers });
    }

    // Origin 制限（KOREC GitHub Pages 以外からはブロック）
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return new Response(JSON.stringify({
        error: { message: `Origin ${origin || '(none)'} not allowed` }
      }), {
        status: 403,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }

    if (!env.ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({
        error: { message: 'Server misconfigured: ANTHROPIC_API_KEY not set' }
      }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: { message: 'Invalid JSON body' } }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }

    if (!body.prompt) {
      return new Response(JSON.stringify({ error: { message: 'prompt is required' } }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }

    const model = body.model || 'claude-sonnet-4-6';

    try {
      const anthResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model,
          max_tokens: 4096,
          tools: [{
            type: 'web_search_20250305',
            name: 'web_search',
            max_uses: 5,
          }],
          messages: [{ role: 'user', content: body.prompt }],
        }),
      });

      const text = await anthResponse.text();
      return new Response(text, {
        status: anthResponse.status,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    } catch (e) {
      return new Response(JSON.stringify({
        error: { message: `Upstream error: ${e.message}` }
      }), {
        status: 502,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }
  }
};
