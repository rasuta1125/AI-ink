import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderer } from './renderer'
import { hookRoutes } from './routes/hooks'
import { ctaRoutes } from './routes/ctas'
import { hashtagRoutes } from './routes/hashtags'
import { captionRoutes } from './routes/captions'

const app = new Hono()

// CORS設定
app.use('/api/*', cors())

// レンダラー設定
app.use(renderer)

// API ルート
app.route('/api/hooks', hookRoutes)
app.route('/api/ctas', ctaRoutes)
app.route('/api/hashtags6', hashtagRoutes)
app.route('/api/captions', captionRoutes)

// メインページ
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>コピー生成AI - 今日の投稿、ここからコピペで終わり。</title>
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
          
          .btn-gradient {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            transition: all 0.3s ease;
          }
          
          .btn-gradient:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px -5px rgba(102, 126, 234, 0.4);
          }
          
          .feature-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .feature-card:hover {
            transform: translateY(-4px);
          }
          
          .input-focus:focus {
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
          
          .result-item {
            transition: all 0.2s ease;
          }
          
          .result-item:hover {
            background-color: rgba(59, 130, 246, 0.05);
            border-color: rgba(59, 130, 246, 0.2);
          }
          
          .copy-success {
            animation: bounceSoft 0.6s ease-in-out;
          }
        </style>
    </head>
    <body class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <!-- ヘッダー -->
        <header class="relative overflow-hidden">
            <div class="absolute inset-0 gradient-bg opacity-90"></div>
            <div class="relative container mx-auto px-4 py-16 text-center text-white">
                <div class="animate-fade-in">
                    <h1 class="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                        <i class="fas fa-magic mr-4 text-accent-300 animate-pulse-soft"></i>
                        コピー生成AI
                    </h1>
                    <div class="space-y-3 mb-8">
                        <p class="text-2xl md:text-3xl font-semibold text-accent-100">
                            今日の投稿、ここからコピペで終わり。
                        </p>
                        <p class="text-xl md:text-2xl text-blue-100">
                            Hook・CTA・#6。迷わない3ボタン。
                        </p>
                        <p class="text-lg text-blue-200">
                            考える前に出す。言葉のショートカット。
                        </p>
                    </div>
                    
                    <!-- 対象ユーザー表示 -->
                    <div class="flex flex-wrap justify-center gap-3 mt-8">
                        <span class="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm font-medium">
                            <i class="fas fa-palette mr-1"></i>クリエイター
                        </span>
                        <span class="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm font-medium">
                            <i class="fas fa-spa mr-1"></i>個人サロン
                        </span>
                        <span class="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm font-medium">
                            <i class="fas fa-shopping-cart mr-1"></i>個人EC
                        </span>
                        <span class="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm font-medium">
                            <i class="fas fa-map-marker-alt mr-1"></i>地域発信
                        </span>
                        <span class="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm font-medium">
                            <i class="fas fa-user mr-1"></i>フリーランス
                        </span>
                    </div>
                </div>
            </div>
        </header>

        <!-- メインコンテンツ -->
        <main class="container mx-auto px-4 py-12">
            <!-- 設定パネル -->
            <div class="glass-effect rounded-2xl shadow-soft-lg p-8 mb-12 animate-slide-up">
                <div class="flex items-center mb-8">
                    <div class="bg-primary-100 p-3 rounded-lg mr-4">
                        <i class="fas fa-cog text-primary-600 text-xl"></i>
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold text-gray-800">コンテンツ設定</h2>
                        <p class="text-gray-600">あなたの投稿に最適化されたコピーを生成します</p>
                    </div>
                </div>
                
                <form id="contentForm" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <!-- 目標 -->
                    <div class="space-y-2">
                        <label class="block text-sm font-semibold text-gray-700">
                            <i class="fas fa-target mr-2 text-primary-500"></i>目標
                        </label>
                        <select id="goal" name="goal" class="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 input-focus transition-all">
                            <option value="認知">認知拡大</option>
                            <option value="保存">保存促進</option>
                            <option value="CV">コンバージョン</option>
                        </select>
                    </div>

                    <!-- 業種 -->
                    <div class="space-y-2">
                        <label class="block text-sm font-semibold text-gray-700">
                            <i class="fas fa-briefcase mr-2 text-primary-500"></i>業種
                        </label>
                        <select id="industry" name="industry" class="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 input-focus transition-all">
                            <option value="creator">クリエイター</option>
                            <option value="salon">個人サロン</option>
                            <option value="ec">個人EC</option>
                            <option value="local">地域発信</option>
                            <option value="other">その他</option>
                        </select>
                    </div>

                    <!-- トーン -->
                    <div class="space-y-2">
                        <label class="block text-sm font-semibold text-gray-700">
                            <i class="fas fa-comment mr-2 text-primary-500"></i>トーン
                        </label>
                        <select id="tone" name="tone" class="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 input-focus transition-all">
                            <option value="フレンドリー">フレンドリー</option>
                            <option value="専門家">専門家</option>
                            <option value="エモい">エモい</option>
                            <option value="きっぱり">きっぱり</option>
                        </select>
                    </div>

                    <!-- 導線 -->
                    <div class="space-y-2">
                        <label class="block text-sm font-semibold text-gray-700">
                            <i class="fas fa-arrow-right mr-2 text-primary-500"></i>導線
                        </label>
                        <select id="path" name="path" class="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 input-focus transition-all">
                            <option value="プロフィール">プロフィール</option>
                            <option value="リンク">リンク</option>
                            <option value="DM">DM</option>
                            <option value="フォーム">フォーム</option>
                        </select>
                    </div>

                    <!-- トピック -->
                    <div class="md:col-span-2 lg:col-span-3 space-y-2">
                        <label class="block text-sm font-semibold text-gray-700">
                            <i class="fas fa-lightbulb mr-2 text-primary-500"></i>トピック
                            <span class="text-xs text-gray-500 font-normal">（100文字以内）</span>
                        </label>
                        <input type="text" id="topic" name="topic" maxlength="100" 
                               placeholder="例：空き枠案内、新サービス紹介、キャンペーン告知、新作商品発表" 
                               class="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 input-focus transition-all">
                        <div class="text-xs text-gray-500 mt-1">
                            <span id="topicCounter">0</span>/100文字
                        </div>
                    </div>

                    <!-- 期限 -->
                    <div class="space-y-2">
                        <label class="block text-sm font-semibold text-gray-700">
                            <i class="fas fa-clock mr-2 text-primary-500"></i>期限
                        </label>
                        <select id="deadline" name="deadline" class="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 input-focus transition-all">
                            <option value="なし">期限なし</option>
                            <option value="今週中">今週中</option>
                            <option value="今月中">今月中</option>
                        </select>
                    </div>
                </form>
            </div>

            <!-- 生成ボタンエリア -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <!-- Hookメーカー -->
                <div class="feature-card glass-effect rounded-2xl shadow-soft p-8 text-center">
                    <div class="bg-orange-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <i class="fas fa-fish text-3xl text-orange-600"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-3">Hook メーカー</h3>
                    <p class="text-gray-600 text-sm mb-6 leading-relaxed">
                        引きの1行を5パターン<br>
                        <span class="text-xs text-gray-500">数字・質問・逆説・ギャップ・事実</span>
                    </p>
                    <button id="generateHooks" class="btn-gradient w-full text-white font-semibold py-4 px-6 rounded-xl">
                        <i class="fas fa-magic mr-2"></i>生成する
                    </button>
                </div>

                <!-- CTAビルダー -->
                <div class="feature-card glass-effect rounded-2xl shadow-soft p-8 text-center">
                    <div class="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <i class="fas fa-bullhorn text-3xl text-green-600"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-3">CTA ビルダー</h3>
                    <p class="text-gray-600 text-sm mb-6 leading-relaxed">
                        行動喚起を5パターン<br>
                        <span class="text-xs text-gray-500">動詞＋場所＋期限で構成</span>
                    </p>
                    <button id="generateCTAs" class="btn-gradient w-full text-white font-semibold py-4 px-6 rounded-xl">
                        <i class="fas fa-bullhorn mr-2"></i>生成する
                    </button>
                </div>

                <!-- #タグ6 -->
                <div class="feature-card glass-effect rounded-2xl shadow-soft p-8 text-center">
                    <div class="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <i class="fas fa-hashtag text-3xl text-purple-600"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-3">#タグ6</h3>
                    <p class="text-gray-600 text-sm mb-6 leading-relaxed">
                        最適なハッシュタグ6個<br>
                        <span class="text-xs text-gray-500">汎用2・カテゴリ2・ニッチ2</span>
                    </p>
                    <button id="generateHashtags" class="btn-gradient w-full text-white font-semibold py-4 px-6 rounded-xl">
                        <i class="fas fa-hashtag mr-2"></i>生成する
                    </button>
                </div>

                <!-- フル本文 -->
                <div class="feature-card glass-effect rounded-2xl shadow-soft p-8 text-center">
                    <div class="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <i class="fas fa-file-alt text-3xl text-blue-600"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-3">フル本文</h3>
                    <p class="text-gray-600 text-sm mb-4 leading-relaxed">
                        完全版を3パターン<br>
                        <span class="text-xs text-gray-500">Hook→本文→CTA→#6</span>
                    </p>
                    <div class="mb-4">
                        <select id="length" class="w-full p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 input-focus">
                            <option value="short">短文 (120-180字)</option>
                            <option value="mid">中文 (200-350字)</option>
                            <option value="long">長文 (400-600字)</option>
                        </select>
                    </div>
                    <button id="generateCaptions" class="btn-gradient w-full text-white font-semibold py-4 px-6 rounded-xl">
                        <i class="fas fa-file-alt mr-2"></i>生成する
                    </button>
                </div>
            </div>

            <!-- 結果表示エリア -->
            <div id="results" class="hidden animate-slide-up">
                <div class="glass-effect rounded-2xl shadow-soft-lg p-8">
                    <div class="flex justify-between items-center mb-8">
                        <div class="flex items-center">
                            <div class="bg-primary-100 p-3 rounded-lg mr-4">
                                <i class="fas fa-clipboard-list text-primary-600 text-xl"></i>
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold text-gray-800">生成結果</h2>
                                <p class="text-gray-600">クリックするとクリップボードにコピーされます</p>
                            </div>
                        </div>
                        <button id="clearResults" class="text-red-500 hover:text-red-700 font-semibold px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
                            <i class="fas fa-times mr-2"></i>クリア
                        </button>
                    </div>
                    <div id="resultsContent"></div>
                </div>
            </div>

            <!-- API Key 設定エリア -->
            <div class="mt-12">
                <div class="glass-effect rounded-2xl shadow-soft p-6">
                    <div class="flex items-center mb-4">
                        <div class="bg-accent-100 p-2 rounded-lg mr-3">
                            <i class="fas fa-key text-accent-600"></i>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-800">OpenAI API Key 設定</h3>
                    </div>
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <div class="flex items-start">
                            <i class="fas fa-info-circle text-yellow-600 mt-1 mr-3"></i>
                            <div class="text-sm text-yellow-800">
                                <p class="font-semibold mb-2">APIキーが設定されていません</p>
                                <p>OpenAI APIキーを設定すると、よりパーソナライズされたコンテンツ生成が可能になります。</p>
                                <p class="mt-2">現在はフォールバック機能により、事前に準備されたテンプレートベースでコンテンツを生成しています。</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <!-- ローディングオーバーレイ -->
        <div id="loading" class="hidden fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div class="glass-effect rounded-2xl p-8 max-w-sm mx-4 text-center">
                <div class="animate-spin w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-6"></div>
                <h3 class="text-xl font-semibold text-gray-800 mb-2">生成中...</h3>
                <p class="text-gray-600">AI がコンテンツを作成しています</p>
                <div class="mt-4 bg-gray-200 rounded-full h-2">
                    <div class="bg-primary-500 h-2 rounded-full animate-pulse" style="width: 65%"></div>
                </div>
            </div>
        </div>

        <!-- 成功通知 -->
        <div id="successToast" class="hidden fixed top-4 right-4 z-50">
            <div class="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center">
                <i class="fas fa-check-circle mr-3 text-xl"></i>
                <span>クリップボードにコピーしました！</span>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            // グローバル状態
            let currentResults = {
                hooks: null,
                ctas: null,
                hashtags: null,
                captions: null
            };

            // DOM要素の取得
            const elements = {
                loading: document.getElementById('loading'),
                results: document.getElementById('results'),
                resultsContent: document.getElementById('resultsContent'),
                successToast: document.getElementById('successToast'),
                topicInput: document.getElementById('topic'),
                topicCounter: document.getElementById('topicCounter')
            };
            
            // 文字カウンター
            elements.topicInput.addEventListener('input', () => {
                const length = elements.topicInput.value.length;
                elements.topicCounter.textContent = length;
                elements.topicCounter.style.color = length > 90 ? '#ef4444' : length > 70 ? '#f59e0b' : '#6b7280';
            });

            // フォームデータ取得
            function getFormData() {
                return {
                    goal: document.getElementById('goal').value,
                    industry: document.getElementById('industry').value,
                    tone: document.getElementById('tone').value,
                    topic: document.getElementById('topic').value.trim(),
                    path: document.getElementById('path').value,
                    deadline: document.getElementById('deadline').value,
                    length: document.getElementById('length').value
                };
            }

            // バリデーション
            function validateForm(requiredFields = ['topic']) {
                const data = getFormData();
                for (const field of requiredFields) {
                    if (!data[field]) {
                        showError(\`\${field === 'topic' ? 'トピック' : field}を入力してください\`);
                        return false;
                    }
                }
                if (data.topic && data.topic.length > 100) {
                    showError('トピックは100文字以内で入力してください');
                    return false;
                }
                return true;
            }

            // ローディング表示/非表示
            function showLoading() {
                elements.loading.classList.remove('hidden');
            }

            function hideLoading() {
                elements.loading.classList.add('hidden');
            }

            // エラー表示
            function showError(message) {
                alert(message); // より良いエラー表示に後で改善
            }

            // 成功通知
            function showSuccess(message) {
                elements.successToast.querySelector('span').textContent = message;
                elements.successToast.classList.remove('hidden');
                setTimeout(() => {
                    elements.successToast.classList.add('hidden');
                }, 3000);
            }

            // 結果表示
            function showResults() {
                elements.results.classList.remove('hidden');
                elements.results.scrollIntoView({ behavior: 'smooth' });
            }

            function renderResults() {
                let html = '';
                
                if (currentResults.hooks) html += renderHooks(currentResults.hooks);
                if (currentResults.ctas) html += renderCTAs(currentResults.ctas);
                if (currentResults.hashtags) html += renderHashtags(currentResults.hashtags);
                if (currentResults.captions) html += renderCaptions(currentResults.captions);
                
                elements.resultsContent.innerHTML = html;
                showResults();
            }

            // Hook結果レンダリング
            function renderHooks(hooks) {
                return \`
                    <div class="mb-8">
                        <div class="flex items-center mb-6">
                            <div class="bg-orange-100 p-2 rounded-lg mr-3">
                                <i class="fas fa-fish text-orange-600"></i>
                            </div>
                            <h3 class="text-lg font-semibold text-gray-800">Hook（引きの1行）</h3>
                        </div>
                        <div class="grid gap-3">
                            \${hooks.map((hook, index) => \`
                                <div class="result-item p-4 bg-orange-50 border border-orange-200 rounded-xl cursor-pointer transition-all" 
                                     onclick="copyToClipboard('\${hook.replace(/'/g, "\\'")}')">
                                    <div class="flex justify-between items-center">
                                        <div class="flex-1">
                                            <span class="inline-block bg-orange-200 text-orange-800 text-xs px-2 py-1 rounded-full mr-3">
                                                \${index + 1}
                                            </span>
                                            <span class="text-gray-800">\${hook}</span>
                                        </div>
                                        <i class="fas fa-copy text-orange-400 ml-3"></i>
                                    </div>
                                </div>
                            \`).join('')}
                        </div>
                    </div>
                \`;
            }

            // CTA結果レンダリング
            function renderCTAs(ctas) {
                return \`
                    <div class="mb-8">
                        <div class="flex items-center mb-6">
                            <div class="bg-green-100 p-2 rounded-lg mr-3">
                                <i class="fas fa-bullhorn text-green-600"></i>
                            </div>
                            <h3 class="text-lg font-semibold text-gray-800">CTA（行動喚起）</h3>
                        </div>
                        <div class="grid gap-3">
                            \${ctas.map((cta, index) => \`
                                <div class="result-item p-4 bg-green-50 border border-green-200 rounded-xl cursor-pointer transition-all" 
                                     onclick="copyToClipboard('\${cta.replace(/'/g, "\\'")}')">
                                    <div class="flex justify-between items-center">
                                        <div class="flex-1">
                                            <span class="inline-block bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full mr-3">
                                                \${index + 1}
                                            </span>
                                            <span class="text-gray-800">\${cta}</span>
                                        </div>
                                        <i class="fas fa-copy text-green-400 ml-3"></i>
                                    </div>
                                </div>
                            \`).join('')}
                        </div>
                    </div>
                \`;
            }

            // ハッシュタグ結果レンダリング
            function renderHashtags(hashtags) {
                return \`
                    <div class="mb-8">
                        <div class="flex items-center mb-6">
                            <div class="bg-purple-100 p-2 rounded-lg mr-3">
                                <i class="fas fa-hashtag text-purple-600"></i>
                            </div>
                            <h3 class="text-lg font-semibold text-gray-800">ハッシュタグ（6個セット）</h3>
                        </div>
                        <div class="result-item p-6 bg-purple-50 border border-purple-200 rounded-xl cursor-pointer transition-all" 
                             onclick="copyToClipboard('\${hashtags.join(' ').replace(/'/g, "\\'")}')">
                            <div class="flex flex-wrap gap-3 mb-4">
                                \${hashtags.map(tag => \`
                                    <span class="bg-purple-200 text-purple-800 px-3 py-2 rounded-lg font-medium">\${tag}</span>
                                \`).join('')}
                            </div>
                            <div class="flex justify-center text-purple-600">
                                <i class="fas fa-copy mr-2"></i>
                                <span class="text-sm">クリックして全てコピー</span>
                            </div>
                        </div>
                    </div>
                \`;
            }

            // キャプション結果レンダリング
            function renderCaptions(captions) {
                return \`
                    <div class="mb-8">
                        <div class="flex items-center mb-6">
                            <div class="bg-blue-100 p-2 rounded-lg mr-3">
                                <i class="fas fa-file-alt text-blue-600"></i>
                            </div>
                            <h3 class="text-lg font-semibold text-gray-800">フル本文（3パターン）</h3>
                        </div>
                        <div class="space-y-6">
                            \${captions.map((caption, index) => \`
                                <div class="border border-blue-200 rounded-xl overflow-hidden">
                                    <div class="bg-blue-100 p-4 flex justify-between items-center">
                                        <div class="flex items-center">
                                            <span class="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-3">
                                                パターン \${index + 1}
                                            </span>
                                            <span class="text-blue-700 text-sm">\${caption.text.length}文字</span>
                                        </div>
                                        <button onclick="copyToClipboard('\${caption.text.replace(/'/g, "\\'")}'); event.stopPropagation();" 
                                                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                            <i class="fas fa-copy mr-2"></i>コピー
                                        </button>
                                    </div>
                                    <div class="p-6 bg-blue-50">
                                        <pre class="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 font-normal">\${caption.text}</pre>
                                    </div>
                                </div>
                            \`).join('')}
                        </div>
                    </div>
                \`;
            }

            // クリップボードにコピー
            async function copyToClipboard(text) {
                try {
                    await navigator.clipboard.writeText(text);
                    showSuccess('クリップボードにコピーしました！');
                } catch (err) {
                    console.error('コピーに失敗しました:', err);
                    showError('コピーに失敗しました');
                }
            }

            // API呼び出し
            async function callAPI(endpoint, data) {
                try {
                    showLoading();
                    const response = await axios.post(\`/api/\${endpoint}\`, data);
                    return response.data;
                } catch (error) {
                    console.error(\`API Error (\${endpoint}):\`, error);
                    
                    const message = error.response?.data?.message || error.message || 'エラーが発生しました';
                    showError(\`エラー: \${message}\`);
                    return null;
                } finally {
                    hideLoading();
                }
            }

            // イベントリスナー設定
            document.getElementById('generateHooks').addEventListener('click', async () => {
                if (!validateForm()) return;
                
                const data = getFormData();
                const result = await callAPI('hooks', {
                    goal: data.goal,
                    industry: data.industry,
                    tone: data.tone,
                    topic: data.topic
                });
                
                if (result) {
                    currentResults.hooks = result.hooks;
                    renderResults();
                }
            });

            document.getElementById('generateCTAs').addEventListener('click', async () => {
                if (!validateForm()) return;
                
                const data = getFormData();
                const result = await callAPI('ctas', {
                    goal: data.goal,
                    path: data.path,
                    deadline: data.deadline,
                    topic: data.topic
                });
                
                if (result) {
                    currentResults.ctas = result.ctas;
                    renderResults();
                }
            });

            document.getElementById('generateHashtags').addEventListener('click', async () => {
                if (!validateForm()) return;
                
                const data = getFormData();
                const result = await callAPI('hashtags6', {
                    industry: data.industry,
                    topic: data.topic
                });
                
                if (result) {
                    currentResults.hashtags = result.hashtags;
                    renderResults();
                }
            });

            document.getElementById('generateCaptions').addEventListener('click', async () => {
                if (!validateForm()) return;
                
                const data = getFormData();
                const result = await callAPI('captions', {
                    goal: data.goal,
                    industry: data.industry,
                    tone: data.tone,
                    topic: data.topic,
                    length: data.length
                });
                
                if (result) {
                    currentResults.captions = result.captions;
                    renderResults();
                }
            });

            document.getElementById('clearResults').addEventListener('click', () => {
                currentResults = { hooks: null, ctas: null, hashtags: null, captions: null };
                elements.results.classList.add('hidden');
            });

            // 初期化時にランダムなプレースホルダーを設定
            const placeholders = [
                "空き枠案内",
                "新サービス紹介", 
                "キャンペーン告知",
                "新作商品発表",
                "イベント告知",
                "お客様の声紹介",
                "制作実績公開",
                "今週の特別メニュー"
            ];
            
            elements.topicInput.placeholder = \`例：\${placeholders[Math.floor(Math.random() * placeholders.length)]}\`;
        </script>
    </body>
    </html>
  `)
})

export default app