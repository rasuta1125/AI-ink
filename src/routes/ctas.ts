import { Hono } from 'hono'
import { ctaVerbs } from '../lib/presets'
import { randomChoice, checkLength, checkCTAStructure, calculateQualityScore } from '../lib/utils'

export const ctaRoutes = new Hono()

interface CTARequest {
  goal: '認知' | '保存' | 'CV'
  path: 'プロフィール' | 'リンク' | 'DM' | 'フォーム'
  deadline: 'なし' | '今週中' | '今月中' | string
  topic: string
}

ctaRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json<CTARequest>()
    const { goal, path, deadline, topic } = body

    // バリデーション
    if (!topic || topic.length > 100) {
      return c.json({ message: 'トピックは1-100文字で入力してください' }, 400)
    }

    // CTA生成
    const ctas = generateCTAs(goal, path, deadline, topic)
    
    // 品質チェック
    const qualityChecked = ctas.filter(cta => 
      checkLength(cta, 35, 70) && 
      checkCTAStructure(cta) &&
      calculateQualityScore(cta, 'cta') >= 70
    )

    // 不足分を補完
    while (qualityChecked.length < 5) {
      const newCTA = generateSingleCTA(goal, path, deadline, topic)
      if (!qualityChecked.includes(newCTA)) {
        qualityChecked.push(newCTA)
      }
    }

    // 5つに制限
    const finalCTAs = qualityChecked.slice(0, 5)

    return c.json({
      ctas: finalCTAs,
      meta: {
        goal,
        path,
        deadline,
        topic: topic.substring(0, 50) + (topic.length > 50 ? '...' : ''),
        quality_scores: finalCTAs.map(cta => calculateQualityScore(cta, 'cta'))
      }
    })

  } catch (error) {
    console.error('CTA generation error:', error)
    return c.json({ 
      message: 'CTA生成中にエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

function generateCTAs(
  goal: string,
  path: string,
  deadline: string,
  topic: string
): string[] {
  const ctas: string[] = []

  // 5つのパターンで生成
  for (let i = 0; i < 5; i++) {
    const cta = generateSingleCTA(goal, path, deadline, topic, i)
    ctas.push(cta)
  }

  return ctas
}

function generateSingleCTA(
  goal: string,
  path: string,
  deadline: string,
  topic: string,
  pattern: number = 0
): string {
  // 動詞選択（goal に応じて）
  let verbs: string[]
  switch (goal) {
    case '認知':
      verbs = ['チェック', '確認', '見てみて', '覗いてみて', 'アクセス']
      break
    case '保存':
      verbs = ['保存', 'チェック', '確認', '見てみて', 'ブックマーク']
      break
    case 'CV':
      verbs = ['予約', '申し込み', '登録', '購入', '注文', '相談', '問い合わせ']
      break
    default:
      verbs = ctaVerbs
  }

  // パス別の表現
  const pathExpressions: { [key: string]: string[] } = {
    'プロフィール': ['プロフィールから', 'プロフまで', 'プロフィールへ', 'プロフのリンクから'],
    'リンク': ['リンクから', 'URLから', 'リンク先で', 'リンクをタップして'],
    'DM': ['DMで', 'DMから', 'ダイレクトメッセージで', 'メッセージで'],
    'フォーム': ['フォームから', 'お申込みフォームで', '専用フォームから', 'フォームにて']
  }

  // 期限表現
  const deadlineExpressions: { [key: string]: string[] } = {
    'なし': ['', 'お気軽に', 'いつでも', 'ぜひ'],
    '今週中': ['今週中に', '週内に', 'お早めに', '今週限定'],
    '今月中': ['今月中に', '月内に', 'お早めに', '今月限定']
  }

  const verb = randomChoice(verbs)
  const pathExp = randomChoice(pathExpressions[path] || [''])
  const deadlineExp = randomChoice(deadlineExpressions[deadline] || [''])

  // パターン別の構築
  let cta: string
  switch (pattern % 5) {
    case 0:
      // 基本形：動詞 + 期限 + 場所
      cta = `${deadlineExp}${verb}してね！${pathExp}`
      break
    case 1:
      // 丁寧形：動詞 + 場所 + 期限
      cta = `${pathExp}${verb}してください。${deadlineExp}`
      break
    case 2:
      // 緊急感：期限 + 動詞 + 場所
      cta = `${deadlineExp}${verb}はこちら→${pathExp}`
      break
    case 3:
      // トピック組み込み：トピック + 動詞 + 場所 + 期限
      cta = `${topic}について${verb}したい方は${pathExp}${deadlineExp}`
      break
    case 4:
      // 呼びかけ形：動詞 + 場所 + お得感
      cta = `今すぐ${verb}！${pathExp}${deadlineExp}特典あり`
      break
    default:
      cta = `${verb}してね！${pathExp}${deadlineExp}`
  }

  // 長さ調整
  if (cta.length < 35) {
    cta = extendCTA(cta, goal, topic)
  } else if (cta.length > 70) {
    cta = shortenCTA(cta)
  }

  // 不要な文字の整理
  cta = cta.replace(/\s+/g, '')
  cta = cta.replace(/。+/g, '。')
  cta = cta.replace(/！+/g, '！')

  return cta
}

function extendCTA(cta: string, goal: string, topic: string): string {
  const extensions = [
    '詳細はこちら',
    'お待ちしています',
    'よろしくお願いします',
    '気軽にどうぞ',
    'ぜひご利用ください'
  ]

  if (goal === 'CV') {
    const cvExtensions = [
      'お得な特典付き',
      '限定価格で提供中',
      '無料相談実施中',
      'キャンペーン実施中'
    ]
    return cta + randomChoice(cvExtensions)
  }

  return cta + randomChoice(extensions)
}

function shortenCTA(cta: string): string {
  // 不要な語句を削除
  const unnecessaryPhrases = [
    'してください',
    'よろしくお願いします',
    'お待ちしています',
    'ぜひ',
    'お気軽に',
    'について'
  ]

  for (const phrase of unnecessaryPhrases) {
    cta = cta.replace(phrase, '')
  }

  // 重複する句読点を整理
  cta = cta.replace(/。+/g, '。')
  cta = cta.replace(/！+/g, '！')

  return cta.trim()
}