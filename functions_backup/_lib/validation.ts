// リクエストバリデーション

export function validateHookRequest(body: any) {
  const required = ['goal', 'industry', 'tone', 'topic']
  
  for (const field of required) {
    if (!body[field]) {
      throw new Error(`Field '${field}' is required`)
    }
  }
  
  if (!['認知', '保存', 'CV'].includes(body.goal)) {
    throw new Error('Invalid goal value')
  }
  
  if (!['creator', 'salon', 'ec', 'local', 'other'].includes(body.industry)) {
    throw new Error('Invalid industry value')  
  }
  
  if (!['フレンドリー', '専門家', 'エモい', 'きっぱり'].includes(body.tone)) {
    throw new Error('Invalid tone value')
  }
  
  if (typeof body.topic !== 'string' || body.topic.length === 0 || body.topic.length > 100) {
    throw new Error('Topic must be 1-100 characters')
  }
  
  return body
}

export function validateCTARequest(body: any) {
  const required = ['goal', 'path', 'deadline', 'topic']
  
  for (const field of required) {
    if (!body[field]) {
      throw new Error(`Field '${field}' is required`)
    }
  }
  
  if (!['認知', '保存', 'CV'].includes(body.goal)) {
    throw new Error('Invalid goal value')
  }
  
  if (!['プロフィール', 'リンク', 'DM', 'フォーム'].includes(body.path)) {
    throw new Error('Invalid path value')
  }
  
  if (!['なし', '今週中'].includes(body.deadline) && !/^\d{4}\/\d{2}\/\d{2}$/.test(body.deadline)) {
    throw new Error('Invalid deadline format')
  }
  
  if (typeof body.topic !== 'string' || body.topic.length === 0 || body.topic.length > 100) {
    throw new Error('Topic must be 1-100 characters')
  }
  
  return body
}

export function validateHashtagRequest(body: any) {
  const required = ['industry', 'topic']
  
  for (const field of required) {
    if (!body[field]) {
      throw new Error(`Field '${field}' is required`)
    }
  }
  
  if (!['creator', 'salon', 'ec', 'local', 'other'].includes(body.industry)) {
    throw new Error('Invalid industry value')  
  }
  
  if (typeof body.topic !== 'string' || body.topic.length === 0 || body.topic.length > 100) {
    throw new Error('Topic must be 1-100 characters')
  }
  
  return body
}

export function validateCaptionRequest(body: any) {
  const required = ['goal', 'industry', 'tone', 'topic', 'length']
  
  for (const field of required) {
    if (!body[field]) {
      throw new Error(`Field '${field}' is required`)
    }
  }
  
  if (!['認知', '保存', 'CV'].includes(body.goal)) {
    throw new Error('Invalid goal value')
  }
  
  if (!['creator', 'salon', 'ec', 'local', 'other'].includes(body.industry)) {
    throw new Error('Invalid industry value')  
  }
  
  if (!['フレンドリー', '専門家', 'エモい', 'きっぱり'].includes(body.tone)) {
    throw new Error('Invalid tone value')
  }
  
  if (!['short', 'mid', 'long'].includes(body.length)) {
    throw new Error('Invalid length value')
  }
  
  if (typeof body.topic !== 'string' || body.topic.length === 0 || body.topic.length > 100) {
    throw new Error('Topic must be 1-100 characters')
  }
  
  return body
}