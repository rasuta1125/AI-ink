// CTA生成API - Firebase認証付き
import { authenticateRequest } from "../_lib/auth";
import { getUserUsage, incrementUsage, checkRateLimit } from "../_lib/usage";

export interface Env {
  FIREBASE_PROJECT_ID: string;
  OPENAI_API_KEY: string;
  USER_USAGE_KV: KVNamespace;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  // CORS対応
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  try {
    // Firebase IDトークン検証
    const user = await authenticateRequest(request, env.FIREBASE_PROJECT_ID);
    console.log('認証済みユーザー:', user.email);

    // KV利用状況管理（KVが設定されている場合のみ）
    if (env.USER_USAGE_KV) {
      // レート制限チェック
      const rateAllowed = await checkRateLimit(env.USER_USAGE_KV, user.sub, 'ctas');
      if (!rateAllowed) {
        return new Response(JSON.stringify({ error: 'レート制限：5秒後に再試行してください' }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // 利用上限チェック
      const userUsage = await getUserUsage(env.USER_USAGE_KV, user.sub);
      if (userUsage.remaining <= 0) {
        return new Response(JSON.stringify({ 
          error: '利用上限に達しました',
          plan: userUsage.plan,
          limit: userUsage.limit,
          used: userUsage.used
        }), {
          status: 402,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // 利用回数を増加
      await incrementUsage(env.USER_USAGE_KV, user.sub);
    }

    // リクエストボディ取得
    const body = await request.json() as {
      goal: string;
      path: string;
      deadline: string;
      topic: string;
    };

    // CTA生成ロジック（フォールバック実装）
    const ctas = generateCTAsFallback(body);

    return new Response(JSON.stringify({ ctas }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('CTAs API エラー:', error);
    
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

function generateCTAsFallback(params: {
  goal: string;
  path: string;
  deadline: string;
  topic: string;
}): string[] {
  const { goal, path, deadline, topic } = params;

  const pathActions = {
    'プロフィール': 'プロフィールをチェック',
    'リンク': 'リンクをクリック',
    'DM': 'DMでお問い合わせ',
    'フォーム': 'フォームから申込み'
  };

  const deadlineTexts = {
    'なし': '',
    '今週中': '今週中に',
    '今月中': '今月末まで'
  };

  const action = pathActions[path] || '詳細をチェック';
  const deadlineText = deadlineTexts[deadline] || '';

  return [
    `${deadlineText}${action}してください！`,
    `気になる方は${deadlineText}${action}を🎯`,
    `詳しくは${deadlineText}${action}から✨`,
    `お気軽に${deadlineText}${action}してくださいね`,
    `ぜひ${deadlineText}${action}してみて！`
  ];
}