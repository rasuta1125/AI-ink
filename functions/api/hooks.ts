// Hook生成API - Firebase認証付き
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
      const rateAllowed = await checkRateLimit(env.USER_USAGE_KV, user.sub, 'hooks');
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
      industry: string;
      tone: string;
      topic: string;
    };

    // バリデーション
    if (!body.topic || body.topic.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'トピックは必須です' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Hook生成ロジック（フォールバック実装）
    const hooks = generateHooksFallback(body);

    return new Response(JSON.stringify({ hooks }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Hooks API エラー:', error);
    
    // 認証エラーの場合
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

// フォールバック用Hook生成関数
function generateHooksFallback(params: {
  goal: string;
  industry: string;
  tone: string;
  topic: string;
}): string[] {
  const { goal, industry, tone, topic } = params;

  // 業種別のテンプレート
  const templates = {
    creator: [
      `【数字系】作品制作に必要な3つのポイント｜${topic}`,
      `【質問系】${topic}について、こんな悩みありませんか？`,
      `【逆説系】実は${topic}の常識、間違ってるかも`,
      `【ギャップ系】見た目はシンプル、でも${topic}は奥が深い`,
      `【事実系】今日の制作現場から｜${topic}のリアル`
    ],
    salon: [
      `【数字系】美容師が教える${topic}の3つの秘密`,
      `【質問系】${topic}でお悩みの方、必見です`,
      `【逆説系】${topic}の常識、実は違います`,
      `【ギャップ系】たった5分で変わる${topic}のコツ`,
      `【事実系】サロンの現場から｜${topic}の真実`
    ],
    ec: [
      `【数字系】${topic}で売上3倍になった理由`,
      `【質問系】${topic}選び、迷っていませんか？`,
      `【逆説系】高いから良い${topic}は間違い？`,
      `【ギャップ系】まさかの${topic}活用法を発見`,
      `【事実系】今週の${topic}出荷レポート`
    ],
    local: [
      `【数字系】地域で話題の${topic}、3つの理由`,
      `【質問系】${topic}について知ってますか？`,
      `【逆説系】意外と知らない${topic}の事実`,
      `【ギャップ系】こんな${topic}があったなんて`,
      `【事実系】今日の地域情報｜${topic}をレポート`
    ],
    other: [
      `【数字系】${topic}を成功させる3つのコツ`,
      `【質問系】${topic}で困ったことはありませんか？`,
      `【逆説系】${topic}の常識を疑ってみた結果`,
      `【ギャップ系】意外な${topic}の活用方法`,
      `【事実系】実際の${topic}体験をお伝えします`
    ]
  };

  const industryKey = industry as keyof typeof templates;
  const baseHooks = templates[industryKey] || templates.other;

  // トーンに応じた調整
  return baseHooks.map(hook => {
    if (tone === 'フレンドリー') {
      return hook.replace('です', 'だよ').replace('ます', 'るよ') + '✨';
    } else if (tone === 'きっぱり') {
      return hook.replace('？', '！').replace('かも', '') + '💪';
    } else if (tone === 'エモい') {
      return hook + '😭✨';
    }
    return hook;
  });
}