import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { hookRoutes } from './routes/hooks'
import { ctaRoutes } from './routes/ctas'
import { hashtagRoutes } from './routes/hashtags'
import { captionRoutes } from './routes/captions'

const app = new Hono()

// CORS設定
app.use('/api/*', cors())

// API ルート
app.route('/api/hooks', hookRoutes)
app.route('/api/ctas', ctaRoutes)
app.route('/api/hashtags', hashtagRoutes)
app.route('/api/captions', captionRoutes)

// メインページ
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AIコピー生成ink - 今日の投稿、ここからコピペで終わり。</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script>
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e'
                  },
                  accent: {
                    50: '#fefce8',
                    100: '#fef9c3',
                    200: '#fef08a',
                    300: '#fde047',
                    400: '#facc15',
                    500: '#eab308',
                    600: '#ca8a04',
                    700: '#a16207',
                    800: '#854d0e',
                    900: '#713f12'
                  }
                },
                animation: {
                  'fade-in': 'fadeIn 0.5s ease-in-out',
                  'slide-up': 'slideUp 0.3s ease-out',
                  'bounce-soft': 'bounceSoft 0.6s ease-in-out',
                  'pulse-soft': 'pulseSoft 2s infinite'
                },
                keyframes: {
                  fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' }
                  },
                  slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' }
                  },
                  bounceSoft: {
                    '0%, 20%, 53%, 80%, 100%': { transform: 'translateY(0)' },
                    '40%, 43%': { transform: 'translateY(-8px)' },
                    '70%': { transform: 'translateY(-4px)' },
                    '90%': { transform: 'translateY(-2px)' }
                  },
                  pulseSoft: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.8' }
                  }
                },
                boxShadow: {
                  'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
                  'soft-lg': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
                }
              }
            }
          }
        </script>
        <style>
          .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .glass-effect {
            backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
        </style>
    </head>
    <body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <!-- ヘッダー -->
        <header class="bg-white shadow-soft">
            <div class="container mx-auto px-4 py-6">
                <div class="text-center">
                    <h1 class="text-4xl font-bold gradient-text mb-2">
                        <i class="fas fa-magic mr-3 text-primary-500"></i>
                        AIコピー生成ink
                    </h1>
                    <p class="text-gray-600 text-lg">今日の投稿、ここからコピペで終わり。</p>
                </div>
            </div>
        </header>

        <!-- メインコンテンツ -->
        <main class="container mx-auto px-4 py-8">
            <div class="max-w-6xl mx-auto">
                <!-- 機能選択タブ -->
                <div class="bg-white rounded-2xl shadow-soft-lg mb-8 overflow-hidden">
                    <div class="border-b border-gray-200">
                        <nav class="flex">
                            <button onclick="showTab('hooks')" id="hooksTab" class="flex-1 py-4 px-6 text-center font-medium border-b-2 border-primary-500 text-primary-600 bg-primary-50">
                                <i class="fas fa-fish-fins mr-2"></i>フック
                            </button>
                            <button onclick="showTab('ctas')" id="ctasTab" class="flex-1 py-4 px-6 text-center font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50">
                                <i class="fas fa-bullhorn mr-2"></i>CTA
                            </button>
                            <button onclick="showTab('hashtags')" id="hashtagsTab" class="flex-1 py-4 px-6 text-center font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50">
                                <i class="fas fa-hashtag mr-2"></i>ハッシュタグ
                            </button>
                            <button onclick="showTab('captions')" id="captionsTab" class="flex-1 py-4 px-6 text-center font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50">
                                <i class="fas fa-quote-right mr-2"></i>キャプション
                            </button>
                        </nav>
                    </div>

                    <!-- フックタブ -->
                    <div id="hooksContent" class="p-8">
                        <div class="mb-6">
                            <h2 class="text-2xl font-bold text-gray-800 mb-3">
                                <i class="fas fa-fish-fins text-primary-500 mr-3"></i>
                                フック生成
                            </h2>
                            <p class="text-gray-600">読者の注意を引く魅力的なフックを生成します</p>
                        </div>
                        
                        <div class="space-y-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-3">
                                    <i class="fas fa-lightbulb mr-2"></i>トピック
                                </label>
                                <input id="hooksTopicInput" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="例：新商品のローンチ">
                            </div>
                            
                            <div class="text-center">
                                <button onclick="generateHooks()" class="bg-primary-500 hover:bg-primary-600 text-white font-medium px-8 py-3 rounded-lg transition-colors">
                                    <i class="fas fa-magic mr-2"></i>
                                    フックを生成
                                </button>
                            </div>
                        </div>
                        
                        <div id="hooksResults" class="mt-8 hidden">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">
                                <i class="fas fa-list mr-2 text-primary-500"></i>
                                生成されたフック
                            </h3>
                            <div id="hooksContainer" class="space-y-3"></div>
                        </div>
                    </div>

                    <!-- CTAタブ -->
                    <div id="ctasContent" class="p-8 hidden">
                        <div class="mb-6">
                            <h2 class="text-2xl font-bold text-gray-800 mb-3">
                                <i class="fas fa-bullhorn text-primary-500 mr-3"></i>
                                CTA生成
                            </h2>
                            <p class="text-gray-600">行動を促す効果的なCall to Actionを生成します</p>
                        </div>
                        
                        <div class="space-y-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-3">
                                    <i class="fas fa-lightbulb mr-2"></i>トピック
                                </label>
                                <input id="ctasTopicInput" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="例：メルマガ登録を促す">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-3">
                                    <i class="fas fa-palette mr-2"></i>トーン
                                </label>
                                <select id="ctasToneSelect" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                    <option value="urgent">緊急性</option>
                                    <option value="friendly">フレンドリー</option>
                                    <option value="professional">プロフェッショナル</option>
                                    <option value="emotional">感情的</option>
                                    <option value="casual">カジュアル</option>
                                </select>
                            </div>
                            
                            <div class="text-center">
                                <button onclick="generateCTAs()" class="bg-primary-500 hover:bg-primary-600 text-white font-medium px-8 py-3 rounded-lg transition-colors">
                                    <i class="fas fa-magic mr-2"></i>
                                    CTAを生成
                                </button>
                            </div>
                        </div>
                        
                        <div id="ctasResults" class="mt-8 hidden">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">
                                <i class="fas fa-list mr-2 text-primary-500"></i>
                                生成されたCTA
                            </h3>
                            <div id="ctasContainer" class="space-y-3"></div>
                        </div>
                    </div>

                    <!-- ハッシュタグタブ -->
                    <div id="hashtagsContent" class="p-8 hidden">
                        <div class="mb-6">
                            <h2 class="text-2xl font-bold text-gray-800 mb-3">
                                <i class="fas fa-hashtag text-primary-500 mr-3"></i>
                                ハッシュタグ生成
                            </h2>
                            <p class="text-gray-600">SNSで効果的なハッシュタグを生成します</p>
                        </div>
                        
                        <div class="space-y-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-3">
                                    <i class="fas fa-lightbulb mr-2"></i>トピック
                                </label>
                                <input id="hashtagsTopicInput" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="例：カフェの新メニュー">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-3">
                                    <i class="fas fa-mobile-alt mr-2"></i>プラットフォーム
                                </label>
                                <select id="hashtagsPlatformSelect" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                    <option value="instagram">Instagram</option>
                                    <option value="twitter">Twitter</option>
                                    <option value="tiktok">TikTok</option>
                                    <option value="linkedin">LinkedIn</option>
                                </select>
                            </div>
                            
                            <div class="text-center">
                                <button onclick="generateHashtags()" class="bg-primary-500 hover:bg-primary-600 text-white font-medium px-8 py-3 rounded-lg transition-colors">
                                    <i class="fas fa-magic mr-2"></i>
                                    ハッシュタグを生成
                                </button>
                            </div>
                        </div>
                        
                        <div id="hashtagsResults" class="mt-8 hidden">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">
                                <i class="fas fa-list mr-2 text-primary-500"></i>
                                生成されたハッシュタグ
                            </h3>
                            <div id="hashtagsContainer" class="grid grid-cols-2 md:grid-cols-4 gap-3"></div>
                        </div>
                    </div>

                    <!-- キャプションタブ -->
                    <div id="captionsContent" class="p-8 hidden">
                        <div class="mb-6">
                            <h2 class="text-2xl font-bold text-gray-800 mb-3">
                                <i class="fas fa-quote-right text-primary-500 mr-3"></i>
                                キャプション生成
                            </h2>
                            <p class="text-gray-600">SNS投稿用の魅力的なキャプションを生成します</p>
                        </div>
                        
                        <div class="space-y-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-3">
                                    <i class="fas fa-lightbulb mr-2"></i>トピック
                                </label>
                                <input id="captionsTopicInput" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="例：夏の新作アクセサリー">
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-3">
                                        <i class="fas fa-palette mr-2"></i>トーン
                                    </label>
                                    <select id="captionsToneSelect" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                        <option value="casual">カジュアル</option>
                                        <option value="professional">プロフェッショナル</option>
                                        <option value="fun">楽しい</option>
                                        <option value="inspirational">インスピレーショナル</option>
                                        <option value="informative">情報的</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-3">
                                        <i class="fas fa-text-width mr-2"></i>文字数
                                    </label>
                                    <select id="captionsLengthSelect" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                        <option value="short">短文 (50文字程度)</option>
                                        <option value="medium">中文 (150文字程度)</option>
                                        <option value="long">長文 (300文字程度)</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="text-center">
                                <button onclick="generateCaptions()" class="bg-primary-500 hover:bg-primary-600 text-white font-medium px-8 py-3 rounded-lg transition-colors">
                                    <i class="fas fa-magic mr-2"></i>
                                    キャプションを生成
                                </button>
                            </div>
                        </div>
                        
                        <div id="captionsResults" class="mt-8 hidden">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">
                                <i class="fas fa-list mr-2 text-primary-500"></i>
                                生成されたキャプション
                            </h3>
                            <div id="captionsContainer" class="space-y-4"></div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <!-- ローディング -->
        <div id="loading" class="hidden fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div class="glass-effect rounded-2xl p-8 text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
                <p class="text-gray-700 font-medium">AI生成中...</p>
            </div>
        </div>

        <!-- 成功通知 -->
        <div id="copySuccess" class="hidden fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            <i class="fas fa-check-circle mr-2"></i>
            <span>クリップボードにコピーしました！</span>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            // タブ切り替え
            function showTab(tabName) {
                // すべてのタブとコンテンツを非アクティブにする
                document.querySelectorAll('[id$="Tab"]').forEach(tab => {
                    tab.classList.remove('border-primary-500', 'text-primary-600', 'bg-primary-50');
                    tab.classList.add('border-transparent', 'text-gray-500');
                });
                
                document.querySelectorAll('[id$="Content"]').forEach(content => {
                    content.classList.add('hidden');
                });

                // 選択されたタブをアクティブにする
                const activeTab = document.getElementById(tabName + 'Tab');
                const activeContent = document.getElementById(tabName + 'Content');
                
                if (activeTab && activeContent) {
                    activeTab.classList.remove('border-transparent', 'text-gray-500');
                    activeTab.classList.add('border-primary-500', 'text-primary-600', 'bg-primary-50');
                    activeContent.classList.remove('hidden');
                }
            }

            // API呼び出し
            async function callAPI(endpoint, data) {
                try {
                    showLoading();
                    
                    const response = await axios.post(endpoint, data, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.data.success) {
                        return response.data;
                    } else {
                        throw new Error(response.data.error || 'API呼び出しエラー');
                    }
                } catch (error) {
                    console.error('API Error:', error);
                    alert('エラーが発生しました: ' + (error.response?.data?.error || error.message));
                    return null;
                } finally {
                    hideLoading();
                }
            }

            // フック生成
            async function generateHooks() {
                const topic = document.getElementById('hooksTopicInput').value.trim();
                if (!topic) {
                    alert('トピックを入力してください。');
                    return;
                }

                const result = await callAPI('/api/hooks', { topic });
                if (result && result.hooks) {
                    displayResults('hooks', result.hooks, (hook, index) => \`
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <div class="flex justify-between items-start">
                                <div class="flex-1">
                                    <h4 class="font-medium text-gray-800 mb-2">フック \${index + 1}</h4>
                                    <p class="text-gray-700">\${hook}</p>
                                </div>
                                <button onclick="copyToClipboard('\${hook.replace(/'/g, "\\'")}', this)" class="ml-4 bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 rounded text-sm">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                        </div>
                    \`);
                }
            }

            // CTA生成
            async function generateCTAs() {
                const topic = document.getElementById('ctasTopicInput').value.trim();
                const tone = document.getElementById('ctasToneSelect').value;
                if (!topic) {
                    alert('トピックを入力してください。');
                    return;
                }

                const result = await callAPI('/api/ctas', { topic, tone });
                if (result && result.ctas) {
                    displayResults('ctas', result.ctas, (cta, index) => \`
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <div class="flex justify-between items-start">
                                <div class="flex-1">
                                    <h4 class="font-medium text-gray-800 mb-2">CTA \${index + 1}</h4>
                                    <p class="text-gray-700">\${cta}</p>
                                </div>
                                <button onclick="copyToClipboard('\${cta.replace(/'/g, "\\'")}', this)" class="ml-4 bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 rounded text-sm">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                        </div>
                    \`);
                }
            }

            // ハッシュタグ生成
            async function generateHashtags() {
                const topic = document.getElementById('hashtagsTopicInput').value.trim();
                const platform = document.getElementById('hashtagsPlatformSelect').value;
                if (!topic) {
                    alert('トピックを入力してください。');
                    return;
                }

                const result = await callAPI('/api/hashtags6', { topic, platform });
                if (result && result.hashtags) {
                    displayResults('hashtags', result.hashtags, (hashtag) => \`
                        <div class="bg-gray-50 p-3 rounded-lg text-center">
                            <div class="flex justify-between items-center">
                                <span class="text-gray-700 font-medium">\${hashtag}</span>
                                <button onclick="copyToClipboard('\${hashtag}', this)" class="ml-2 text-primary-500 hover:text-primary-600">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                        </div>
                    \`);
                }
            }

            // キャプション生成
            async function generateCaptions() {
                const topic = document.getElementById('captionsTopicInput').value.trim();
                const tone = document.getElementById('captionsToneSelect').value;
                const length = document.getElementById('captionsLengthSelect').value;
                if (!topic) {
                    alert('トピックを入力してください。');
                    return;
                }

                const result = await callAPI('/api/captions', { topic, tone, length });
                if (result && result.captions) {
                    displayResults('captions', result.captions, (caption, index) => \`
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <div class="flex justify-between items-start">
                                <div class="flex-1">
                                    <h4 class="font-medium text-gray-800 mb-2">キャプション \${index + 1}</h4>
                                    <p class="text-gray-700 whitespace-pre-wrap">\${caption}</p>
                                </div>
                                <button onclick="copyToClipboard('\${caption.replace(/'/g, "\\'")}', this)" class="ml-4 bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 rounded text-sm">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                        </div>
                    \`);
                }
            }

            // 結果表示
            function displayResults(type, items, templateFn) {
                const container = document.getElementById(type + 'Container');
                const results = document.getElementById(type + 'Results');
                
                if (container && results) {
                    container.innerHTML = items.map(templateFn).join('');
                    results.classList.remove('hidden');
                }
            }

            // クリップボードにコピー
            function copyToClipboard(text, button) {
                navigator.clipboard.writeText(text).then(() => {
                    // ボタンのフィードバック
                    const originalHtml = button.innerHTML;
                    button.innerHTML = '<i class="fas fa-check"></i>';
                    button.classList.add('bg-green-500');
                    
                    // 成功通知を表示
                    const notification = document.getElementById('copySuccess');
                    notification.classList.remove('hidden');
                    
                    setTimeout(() => {
                        button.innerHTML = originalHtml;
                        button.classList.remove('bg-green-500');
                        notification.classList.add('hidden');
                    }, 2000);
                }).catch(err => {
                    console.error('Copy failed:', err);
                    alert('コピーに失敗しました');
                });
            }

            // ローディング表示/非表示
            function showLoading() {
                document.getElementById('loading').classList.remove('hidden');
            }

            function hideLoading() {
                document.getElementById('loading').classList.add('hidden');
            }
        </script>
    </body>
    </html>`)
})

export default app