// フル本文生成API - Firebase認証付き
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
      const rateAllowed = await checkRateLimit(env.USER_USAGE_KV, user.sub, 'captions');
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
      length: string;
    };

    // フル本文生成ロジック（フォールバック実装）
    const captions = generateCaptionsFallback(body);

    return new Response(JSON.stringify({ captions }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Captions API エラー:', error);
    
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

function generateCaptionsFallback(params: {
  goal: string;
  industry: string;
  tone: string;
  topic: string;
  length: string;
}): Array<{text: string}> {
  const { goal, industry, tone, topic, length } = params;

  // 長さ別のテンプレート
  const templates = {
    short: {
      hook: `${topic}について`,
      content: `気になる方も多いのではないでしょうか。実際に体験してみた結果をお伝えします。`,
      cta: `詳しくはプロフィールをチェック！`,
      hashtags: `#${topic} #おすすめ #情報`
    },
    mid: {
      hook: `【${industry}が教える】${topic}の真実`,
      content: `多くの方から質問をいただく${topic}について、専門的な視点からお答えします。\n\n実は、${topic}には知られていないポイントがあります。それは...\n\n詳しい内容は以下でご確認いただけます。`,
      cta: `気になる方はプロフィールリンクから詳細をご覧ください`,
      hashtags: `#${topic} #${industry} #専門家 #おすすめ #情報 #相談`
    },
    long: {
      hook: `【完全解説】${topic}で失敗しない3つのポイント`,
      content: `こんにちは！\n${industry}を専門にしている私から、${topic}について詳しくお伝えします。\n\n多くのお客様から「${topic}について教えてほしい」というご相談をいただきます。\n\n特に重要なのは以下の3点です：\n\n1. 基礎知識をしっかり身につける\n2. 自分に合った方法を選ぶ  \n3. 継続できる仕組みを作る\n\nこれらのポイントを押さえることで、${topic}で成功する確率が大幅に向上します。\n\n詳しい内容や具体的な方法については、個別にご相談いただければと思います。`,
      cta: `ご質問やご相談がございましたら、お気軽にプロフィールリンクからお問い合わせください`,
      hashtags: `#${topic} #${industry} #専門家 #相談 #アドバイス #情報`
    }
  };

  const lengthKey = length as keyof typeof templates;
  const template = templates[lengthKey] || templates.mid;

  // 3パターン生成
  const patterns = [
    {
      text: `${template.hook}\n\n${template.content}\n\n${template.cta}\n\n${template.hashtags}`
    },
    {
      text: `✨ ${template.hook} ✨\n\n${template.content}\n\n👉 ${template.cta}\n\n${template.hashtags}`  
    },
    {
      text: `${template.hook}\n\n${template.content}\n\n💡 ${template.cta}\n\n${template.hashtags}`
    }
  ];

  return patterns;
}