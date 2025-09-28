import { Hono } from 'hono'
import { industryPresets, generalHashtags } from '../lib/presets'
import { normalizeHashtag, randomChoices, randomChoice } from '../lib/utils'

export const hashtagRoutes = new Hono()

interface HashtagRequest {
  industry: 'creator' | 'salon' | 'ec' | 'local' | 'other'
  topic: string
}

hashtagRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json<HashtagRequest>()
    const { industry, topic } = body

    // バリデーション
    if (!topic || topic.length > 100) {
      return c.json({ message: 'トピックは1-100文字で入力してください' }, 400)
    }

    // ハッシュタグ生成
    const hashtags = generateHashtags(industry, topic)

    return c.json({
      hashtags,
      meta: {
        industry,
        topic: topic.substring(0, 50) + (topic.length > 50 ? '...' : ''),
        distribution: {
          general: 2,
          category: 2,
          niche: 2
        }
      }
    })

  } catch (error) {
    console.error('Hashtag generation error:', error)
    return c.json({ 
      message: 'ハッシュタグ生成中にエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

function generateHashtags(industry: string, topic: string): string[] {
  const preset = industryPresets[industry as keyof typeof industryPresets]
  
  // 汎用ハッシュタグ（2個）
  const generalTags = randomChoices(generalHashtags, 2).map(normalizeHashtag)
  
  // カテゴリハッシュタグ（2個）- 業種固有
  const categoryTags = randomChoices(preset.commonHashtags, 2).map(normalizeHashtag)
  
  // ニッチハッシュタグ（2個）- トピック関連
  const nicheTags = generateNicheTags(topic, industry, 2)
  
  // 配合: 汎用2 + カテゴリ2 + ニッチ2 = 6個
  const allTags = [...generalTags, ...categoryTags, ...nicheTags]
  
  // 重複除去
  const uniqueTags = Array.from(new Set(allTags))
  
  // 6個に調整
  while (uniqueTags.length < 6) {
    const additionalTag = generateAdditionalTag(industry, topic, uniqueTags)
    if (!uniqueTags.includes(additionalTag)) {
      uniqueTags.push(additionalTag)
    }
  }
  
  return uniqueTags.slice(0, 6)
}

function generateNicheTags(topic: string, industry: string, count: number): string[] {
  const tags: string[] = []
  
  // トピックから直接生成
  const topicTag = normalizeHashtag(topic.substring(0, 10)) // 長すぎるタグを防ぐ
  tags.push(topicTag)
  
  // トピック関連タグ生成
  const topicRelated = generateTopicRelatedTags(topic, industry)
  tags.push(...randomChoices(topicRelated, count - 1))
  
  return tags.slice(0, count).map(normalizeHashtag)
}

function generateTopicRelatedTags(topic: string, industry: string): string[] {
  const tags: string[] = []
  
  // 業種別のトピック関連タグ
  const industryRelatedTags: { [key: string]: string[] } = {
    creator: [
      '#作品', '#制作中', '#創作活動', '#アーティスト', '#デザイナー', 
      '#イラスト', '#絵描き', '#ハンドメイド', '#オリジナル', '#作品紹介'
    ],
    salon: [
      '#美容室', '#ヘアサロン', '#ネイルサロン', '#エステ', '#マッサージ',
      '#リラックス', '#美容', '#ケア', '#施術', '#癒し空間'
    ],
    ec: [
      '#オンラインショップ', '#ネットショップ', '#商品', '#販売',
      '#購入', '#注文', '#配送', '#新商品', '#セール', '#限定'
    ],
    local: [
      '#地域', '#ローカル', '#街', '#お店', '#グルメ',
      '#観光', '#イベント', '#地元', '#おすすめ', '#発見'
    ],
    other: [
      '#情報', '#お知らせ', '#更新', '#報告', '#シェア',
      '#拡散', '#話題', '#注目', '#必見', '#チェック'
    ]
  }
  
  // 業種関連タグを追加
  const industryTags = industryRelatedTags[industry] || industryRelatedTags.other
  tags.push(...industryTags)
  
  // トピックキーワードベースの生成
  const keywords = extractKeywords(topic)
  for (const keyword of keywords) {
    tags.push(`#${keyword}`)
    tags.push(`#${keyword}情報`)
    tags.push(`#${keyword}好き`)
  }
  
  // 季節・時期関連
  const seasonal = generateSeasonalTags()
  tags.push(...seasonal)
  
  return tags
}

function extractKeywords(topic: string): string[] {
  // 簡易的なキーワード抽出
  const keywords: string[] = []
  
  // 一般的なキーワードパターン
  const keywordPatterns = [
    /(\w+)サロン/, /(\w+)ショップ/, /(\w+)カフェ/, /(\w+)レッスン/,
    /(\w+)教室/, /(\w+)セミナー/, /(\w+)イベント/, /(\w+)キャンペーン/,
    /(\w+)商品/, /(\w+)サービス/, /(\w+)体験/, /(\w+)相談/
  ]
  
  for (const pattern of keywordPatterns) {
    const match = topic.match(pattern)
    if (match && match[1]) {
      keywords.push(match[1])
    }
  }
  
  // 単語分割（簡易版）
  const words = topic.match(/[\u3040-\u309F\u30A0-\u30FFa-zA-Z0-9]+/g) || []
  keywords.push(...words.filter(word => word.length >= 2 && word.length <= 6))
  
  return keywords.slice(0, 3) // 上位3個まで
}

function generateSeasonalTags(): string[] {
  const now = new Date()
  const month = now.getMonth() + 1
  
  const seasonalTags: { [key: number]: string[] } = {
    1: ['#新年', '#正月', '#冬', '#1月'],
    2: ['#バレンタイン', '#冬', '#2月'],
    3: ['#春', '#桜', '#新生活', '#3月'],
    4: ['#春', '#新年度', '#桜', '#4月'],
    5: ['#ゴールデンウィーク', '#春', '#5月'],
    6: ['#梅雨', '#初夏', '#6月'],
    7: ['#夏', '#七夕', '#7月'],
    8: ['#夏', '#お盆', '#夏休み', '#8月'],
    9: ['#秋', '#9月'],
    10: ['#秋', '#ハロウィン', '#10月'],
    11: ['#秋', '#紅葉', '#11月'],
    12: ['#冬', '#クリスマス', '#年末', '#12月']
  }
  
  return seasonalTags[month] || ['#今日', '#最新']
}

function generateAdditionalTag(industry: string, topic: string, existingTags: string[]): string {
  const preset = industryPresets[industry as keyof typeof industryPresets]
  
  // 候補タグプール
  const candidates = [
    ...generalHashtags,
    ...preset.commonHashtags,
    ...generateTopicRelatedTags(topic, industry),
    '#今日の投稿', '#最新情報', '#注目', '#おすすめ', '#必見',
    '#シェア', '#拡散希望', '#いいね', '#フォロー', '#コメント'
  ]
  
  // 既存のタグと重複しないものを選択
  const available = candidates.filter(tag => 
    !existingTags.includes(normalizeHashtag(tag))
  )
  
  return available.length > 0 
    ? normalizeHashtag(randomChoice(available))
    : normalizeHashtag('#情報')
}