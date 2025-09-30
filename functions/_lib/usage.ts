// ユーザー利用状況管理ライブラリ
export interface UserUsage {
  plan: 'free' | 'light' | 'premium';
  limit: number;
  used: number;
  remaining: number;
  period: string; // YYYY-MM format
  resetDate: string; // ISO date string
}

export interface Plan {
  name: 'free' | 'light' | 'premium';
  limit: number;
  price: number;
}

// プラン定義
export const PLANS: Record<string, Plan> = {
  free: { name: 'free', limit: 20, price: 0 },
  light: { name: 'light', limit: 100, price: 980 },
  premium: { name: 'premium', limit: 500, price: 2980 }
};

/**
 * 現在の月の期間文字列を取得
 */
export function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * 月末日時を取得
 */
export function getEndOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
}

/**
 * KVからユーザーの利用状況を取得
 */
export async function getUserUsage(kv: KVNamespace, userId: string): Promise<UserUsage> {
  const currentPeriod = getCurrentPeriod();
  const usageKey = `usage:${userId}:${currentPeriod}`;
  const planKey = `plan:${userId}`;
  
  // プラン情報取得（デフォルトは free）
  const planData = await kv.get(planKey);
  const userPlan = planData ? JSON.parse(planData) : PLANS.free;
  
  // 利用状況取得
  const usageData = await kv.get(usageKey);
  const usage = usageData ? JSON.parse(usageData) : { used: 0 };
  
  const limit = userPlan.limit;
  const used = usage.used || 0;
  const remaining = Math.max(0, limit - used);
  
  return {
    plan: userPlan.name,
    limit,
    used,
    remaining,
    period: currentPeriod,
    resetDate: getEndOfMonth().toISOString()
  };
}

/**
 * ユーザーの利用回数を増加
 */
export async function incrementUsage(kv: KVNamespace, userId: string): Promise<boolean> {
  const currentPeriod = getCurrentPeriod();
  const usageKey = `usage:${userId}:${currentPeriod}`;
  
  // 現在の利用状況確認
  const userUsage = await getUserUsage(kv, userId);
  
  // 上限チェック
  if (userUsage.remaining <= 0) {
    return false; // 上限超過
  }
  
  // 利用回数を増加
  const newUsage = {
    used: userUsage.used + 1,
    lastUsed: new Date().toISOString()
  };
  
  // KVに保存（月末まで有効）
  const expirationTtl = Math.floor((getEndOfMonth().getTime() - Date.now()) / 1000);
  await kv.put(usageKey, JSON.stringify(newUsage), { expirationTtl });
  
  return true;
}

/**
 * ユーザーのプランを更新
 */
export async function updateUserPlan(kv: KVNamespace, userId: string, planName: 'free' | 'light' | 'premium'): Promise<void> {
  const planKey = `plan:${userId}`;
  const plan = PLANS[planName];
  
  if (!plan) {
    throw new Error(`Invalid plan: ${planName}`);
  }
  
  await kv.put(planKey, JSON.stringify(plan));
}

/**
 * レート制限チェック（5秒間隔）
 */
export async function checkRateLimit(kv: KVNamespace, userId: string, endpoint: string): Promise<boolean> {
  const rateLimitKey = `rate:${userId}:${endpoint}`;
  const lastRequest = await kv.get(rateLimitKey);
  
  if (lastRequest) {
    const lastTime = parseInt(lastRequest);
    const now = Date.now();
    const timeDiff = now - lastTime;
    
    // 5秒未満の場合はレート制限
    if (timeDiff < 5000) {
      return false;
    }
  }
  
  // 現在時刻を記録（10秒後に自動削除）
  await kv.put(rateLimitKey, Date.now().toString(), { expirationTtl: 10 });
  return true;
}