import { Hono } from 'hono'
import { industryPresets, tonePresets, hookTemplates } from '../lib/presets'
import { randomChoice, randomChoices, checkLength, checkSameSuffix, calculateQualityScore } from '../lib/utils'

export const hookRoutes = new Hono()

interface HookRequest {
  goal: '認知' | '保存' | 'CV'
  industry: 'creator' | 'salon' | 'ec' | 'local' | 'other'
  tone: 'フレンドリー' | '専門家' | 'エモい' | 'きっぱり'
  topic: string
}

hookRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json<HookRequest>()
    const { goal, industry, tone, topic } = body

    // バリデーション
    if (!topic || topic.length > 100) {
      return c.json({ message: 'トピックは1-100文字で入力してください' }, 400)
    }

    // Hook生成
    const hooks = generateHooks(goal, industry, tone, topic)
    
    // 品質チェック
    const qualityChecked = hooks.filter(hook => 
      checkLength(hook, 24, 48) && 
      calculateQualityScore(hook, 'hook') >= 70
    )

    // 不足分を補完
    while (qualityChecked.length < 5) {
      const newHook = generateSingleHook(industry, tone, topic)
      if (!qualityChecked.includes(newHook)) {
        qualityChecked.push(newHook)
      }
    }

    // 5つに制限
    const finalHooks = qualityChecked.slice(0, 5)

    return c.json({
      hooks: finalHooks,
      meta: {
        goal,
        industry,
        tone,
        topic: topic.substring(0, 50) + (topic.length > 50 ? '...' : ''),
        quality_scores: finalHooks.map(hook => calculateQualityScore(hook, 'hook'))
      }
    })

  } catch (error) {
    console.error('Hook generation error:', error)
    return c.json({ 
      message: 'Hook生成中にエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

function generateHooks(
  goal: string, 
  industry: string, 
  tone: string, 
  topic: string
): string[] {
  const preset = industryPresets[industry as keyof typeof industryPresets]
  const toneInfo = tonePresets[tone as keyof typeof tonePresets]
  const keywords = [...preset.keywords, topic]

  const hooks: string[] = []
  const systems = ['数字', '質問', '逆説', 'ギャップ', '事実'] as const

  // 各系統から1つずつ生成
  for (const system of systems) {
    const templates = hookTemplates[system]
    let hook = generateHookBySystem(system, templates, keywords, topic, toneInfo)
    
    // 長さ調整
    if (hook.length < 24) {
      hook = adjustHookLength(hook, 'extend', toneInfo)
    } else if (hook.length > 48) {
      hook = adjustHookLength(hook, 'shorten', toneInfo)
    }
    
    hooks.push(hook)
  }

  // 同語尾連続チェック
  if (!checkSameSuffix(hooks)) {
    // 語尾を調整
    for (let i = 1; i < hooks.length; i++) {
      if (hooks[i].slice(-1) === hooks[i-1].slice(-1)) {
        hooks[i] = adjustSuffix(hooks[i], toneInfo)
      }
    }
  }

  return hooks
}

function generateHookBySystem(
  system: keyof typeof hookTemplates,
  templates: string[],
  keywords: string[],
  topic: string,
  toneInfo: any
): string {
  const template = randomChoice(templates)
  let hook = template

  // テンプレート置換
  hook = hook.replace('{キーワード}', topic)
  hook = hook.replace('{数字}', String(Math.floor(Math.random() * 9) + 1))

  // 系統別の特殊処理
  switch (system) {
    case '数字':
      // 数字を使った具体的な表現
      const numbers = ['3', '5', '10', '24時間', '1週間']
      hook = hook.replace('{数字}', randomChoice(numbers))
      break
      
    case '質問':
      // 疑問文の調整
      if (!hook.endsWith('？') && !hook.endsWith('?')) {
        hook += '？'
      }
      break
      
    case '逆説':
      // 逆説的な表現を強化
      const contrasts = ['実は', 'なんと', 'ところが', 'しかし']
      if (!contrasts.some(word => hook.includes(word))) {
        hook = randomChoice(contrasts) + hook
      }
      break
      
    case 'ギャップ':
      // ギャップ表現を追加
      const gaps = ['まさかの', '予想外の', '意外な', '驚きの']
      hook = randomChoice(gaps) + hook
      break
      
    case '事実':
      // 事実性を強調
      const facts = ['今日の', 'リアルな', '実際の', '現在の']
      if (!facts.some(word => hook.includes(word))) {
        hook = randomChoice(facts) + hook
      }
      break
  }

  // トーンに応じた調整
  if (toneInfo.emoji && Math.random() < 0.3) {
    const emojis = ['✨', '💡', '🔥', '👀', '❗']
    hook += randomChoice(emojis)
  }

  return hook
}

function generateSingleHook(industry: string, tone: string, topic: string): string {
  const preset = industryPresets[industry as keyof typeof industryPresets]
  const toneInfo = tonePresets[tone as keyof typeof tonePresets]
  
  const templates = [
    `${topic}の秘密`,
    `今すぐ${topic}`,
    `${topic}って知ってる？`,
    `驚きの${topic}`,
    `${topic}の真実`,
    `必見！${topic}`,
    `${topic}を大公開`,
    `${topic}の裏側`
  ]
  
  let hook = randomChoice(templates)
  
  if (toneInfo.emoji && Math.random() < 0.4) {
    const emojis = ['✨', '💡', '🔥', '👀']
    hook += randomChoice(emojis)
  }
  
  return hook
}

function adjustHookLength(hook: string, direction: 'extend' | 'shorten', toneInfo: any): string {
  if (direction === 'extend') {
    // 短すぎる場合の拡張
    const extensions = ['をチェック', 'について', 'のお話', 'を紹介']
    return hook + randomChoice(extensions)
  } else {
    // 長すぎる場合の短縮
    // 不要な語句を削除
    hook = hook.replace(/について|のお話|を紹介|をチェック/g, '')
    hook = hook.replace(/\s+/g, '')
    return hook
  }
}

function adjustSuffix(hook: string, toneInfo: any): string {
  // 最後の文字を変更
  const suffixes = toneInfo.suffix || ['です', 'ます', '！']
  const lastChar = hook.slice(-1)
  const newSuffix = suffixes.find(s => s !== lastChar) || suffixes[0]
  
  // 既存の語尾を削除して新しい語尾を追加
  return hook.slice(0, -1) + newSuffix
}