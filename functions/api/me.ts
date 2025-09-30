// ユーザー情報API - Firebase認証付き
import { authenticateRequest } from "../_lib/auth";
import { getUserUsage } from "../_lib/usage";

export interface Env {
  FIREBASE_PROJECT_ID: string;
  USER_USAGE_KV: KVNamespace;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  // CORS対応
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  try {
    // Firebase IDトークン検証
    const user = await authenticateRequest(request, env.FIREBASE_PROJECT_ID);
    console.log('認証済みユーザー情報取得:', user.email);

    // KVが設定されていない場合のフォールバック
    if (!env.USER_USAGE_KV) {
      console.warn('USER_USAGE_KV not configured, returning default values');
      return new Response(JSON.stringify({
        plan: 'free',
        limit: 20,
        used: 0,
        remaining: 20,
        period: new Date().toISOString().slice(0, 7) // YYYY-MM
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // ユーザーの利用状況取得
    const userUsage = await getUserUsage(env.USER_USAGE_KV, user.sub);

    return new Response(JSON.stringify(userUsage), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Me API エラー:', error);
    
    if (error.message.includes('token') || error.message.includes('authorization')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};