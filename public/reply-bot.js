// 返信ボット専用JavaScript
// Firebase Authentication + Firestore + OpenAI API 統合版

// グローバル状態管理
let currentUser = null;
let userKnowledge = null;

// DOM要素の取得
const elements = {
  loginScreen: null,
  signupScreen: null,
  mainApp: null,
  loginButtons: null,
  userButtons: null,
  userName: null,
  loading: null,
  // 初期化時に設定
};

// 初期化関数
function initReplyBot() {
  console.log('🤖 Reply Bot initializing...');
  
  // DOM要素を取得
  elements.loginScreen = document.getElementById('loginScreen');
  elements.signupScreen = document.getElementById('signupScreen');
  elements.mainApp = document.getElementById('mainApp');
  elements.loginButtons = document.getElementById('loginButtons');
  elements.userButtons = document.getElementById('userButtons');
  elements.userName = document.getElementById('userName');
  elements.loading = document.getElementById('loading');
  
  // Firebase認証状態の監視
  window.addEventListener('authStateChanged', handleAuthStateChange);
  
  // イベントリスナー設定
  setupEventListeners();
  
  // 初期認証状態チェック
  checkInitialAuthState();
}

// Firebase認証状態変更ハンドラー
function handleAuthStateChange(event) {
  const { user } = event.detail;
  
  if (user) {
    currentUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0]
    };
    showMainApp();
    loadUserKnowledge();
  } else {
    currentUser = null;
    userKnowledge = null;
    showLoginScreen();
  }
}

// 初期認証状態チェック
function checkInitialAuthState() {
  if (window.firebaseAuth && window.firebaseAuth.currentUser) {
    const user = window.firebaseAuth.currentUser;
    handleAuthStateChange({ detail: { user } });
  } else {
    showLoginScreen();
  }
}

// イベントリスナー設定
function setupEventListeners() {
  // ログイン関連
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }
  
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  // 画面切り替え
  const signupBtn = document.getElementById('signupBtn');
  if (signupBtn) {
    signupBtn.addEventListener('click', showSignupScreen);
  }
  
  const backToLoginBtn = document.getElementById('backToLogin');
  if (backToLoginBtn) {
    backToLoginBtn.addEventListener('click', showLoginScreen);
  }
  
  // タブ切り替え
  const replyTab = document.getElementById('replyTab');
  if (replyTab) {
    replyTab.addEventListener('click', () => showTab('reply'));
  }
  
  const knowledgeTab = document.getElementById('knowledgeTab');
  if (knowledgeTab) {
    knowledgeTab.addEventListener('click', () => showTab('knowledge'));
  }
  
  // 返信生成
  const inquiryText = document.getElementById('inquiryText');
  if (inquiryText) {
    inquiryText.addEventListener('input', validateGenerateBtn);
  }
  
  const generateBtn = document.getElementById('generateBtn');
  if (generateBtn) {
    generateBtn.addEventListener('click', generateReplies);
  }
  
  const goToKnowledge = document.getElementById('goToKnowledge');
  if (goToKnowledge) {
    goToKnowledge.addEventListener('click', () => showTab('knowledge'));
  }
  
  // ナレッジフォーム
  const knowledgeForm = document.getElementById('knowledgeForm');
  if (knowledgeForm) {
    knowledgeForm.addEventListener('submit', saveKnowledge);
  }
}

// Firebase Authentication: 新規登録
async function handleSignup(e) {
  e.preventDefault();
  
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const passwordConfirm = document.getElementById('signupPasswordConfirm').value;
  
  // バリデーション
  if (!name || !email || !password || !passwordConfirm) {
    showError('全ての項目を入力してください。');
    return;
  }
  
  if (password !== passwordConfirm) {
    showError('パスワードが一致しません。');
    return;
  }
  
  if (password.length < 6) {
    showError('パスワードは6文字以上で入力してください。');
    return;
  }
  
  showLoading();
  
  try {
    const result = await window.Firebase.signUp(email, password, name);
    
    if (result.success) {
      showSuccess('アカウント作成が完了しました！\\n\\n「ナレッジ登録」タブで事業情報を入力して、返信機能を活用してください。');
      // Firebase認証状態の変更により自動的にメイン画面に遷移
    } else {
      const errorMessage = window.Firebase.translateAuthError(result.error) || result.error;
      showError(errorMessage);
    }
  } catch (error) {
    console.error('Signup error:', error);
    showError('アカウント作成に失敗しました。しばらく時間をおいてから再度お試しください。');
  } finally {
    hideLoading();
  }
}

// Firebase Authentication: ログイン
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  
  if (!email || !password) {
    showError('メールアドレスとパスワードを入力してください。');
    return;
  }
  
  showLoading();
  
  try {
    const result = await window.Firebase.signIn(email, password);
    
    if (result.success) {
      showSuccess('ログインしました！');
      // Firebase認証状態の変更により自動的にメイン画面に遷移
    } else {
      const errorMessage = window.Firebase.translateAuthError(result.error) || result.error;
      showError(errorMessage);
    }
  } catch (error) {
    console.error('Login error:', error);
    showError('ログインに失敗しました。しばらく時間をおいてから再度お試しください。');
  } finally {
    hideLoading();
  }
}

// Firebase Authentication: ログアウト
async function handleLogout() {
  try {
    const result = await window.Firebase.signOut();
    if (result.success) {
      showSuccess('ログアウトしました。');
      // Firebase認証状態の変更により自動的にログイン画面に遷移
    } else {
      showError('ログアウトに失敗しました。');
    }
  } catch (error) {
    console.error('Logout error:', error);
    showError('ログアウト処理でエラーが発生しました。');
  }
}

// Firestore: ナレッジデータの読み込み
async function loadUserKnowledge() {
  if (!currentUser) return;
  
  try {
    const result = await window.Firebase.getUserKnowledge(currentUser.uid);
    
    if (result.success && result.data) {
      userKnowledge = result.data;
      populateKnowledgeForm();
      console.log('✅ User knowledge loaded');
    } else {
      console.log('ℹ️ No knowledge found for user');
    }
  } catch (error) {
    console.error('❌ Load knowledge error:', error);
  }
}

// Firestore: ナレッジデータの保存
async function saveKnowledge(e) {
  e.preventDefault();
  
  if (!currentUser) {
    showError('ログインが必要です。');
    return;
  }
  
  const knowledgeData = {
    businessType: document.getElementById('businessType').value,
    businessName: document.getElementById('businessName').value,
    websiteUrl: document.getElementById('websiteUrl').value,
    services: document.getElementById('pricing').value,
    businessHours: document.getElementById('businessHours').value,
    reservationInfo: document.getElementById('reservationInfo').value,
    features: document.getElementById('features').value,
  };
  
  // 必須項目チェック
  if (!knowledgeData.businessType || !knowledgeData.businessName || !knowledgeData.services) {
    showError('業種、事業所名、サービス・料金は必須項目です。');
    return;
  }
  
  showLoading();
  
  try {
    const result = await window.Firebase.saveUserKnowledge(currentUser.uid, knowledgeData);
    
    if (result.success) {
      userKnowledge = knowledgeData;
      showSuccess('ナレッジを保存しました！');
      showTab('reply');
    } else {
      showError('ナレッジの保存に失敗しました: ' + result.error);
    }
  } catch (error) {
    console.error('Save knowledge error:', error);
    showError('ナレッジの保存でエラーが発生しました。');
  } finally {
    hideLoading();
  }
}

// ナレッジフォームにデータを反映
function populateKnowledgeForm() {
  if (!userKnowledge) return;
  
  const fields = [
    'businessType', 'businessName', 'websiteUrl', 'pricing', 
    'businessHours', 'reservationInfo', 'features'
  ];
  
  fields.forEach(field => {
    const element = document.getElementById(field);
    const key = field === 'pricing' ? 'services' : field;
    if (element && userKnowledge[key]) {
      element.value = userKnowledge[key];
    }
  });
}

// OpenAI API: 返信生成（サーバーサイドAPI呼び出し）
async function generateReplies() {
  if (!currentUser) {
    showError('ログインが必要です。');
    return;
  }
  
  if (!userKnowledge || !userKnowledge.businessType || !userKnowledge.services) {
    document.getElementById('noKnowledgeWarning').classList.remove('hidden');
    return;
  }
  
  const inquiryText = document.getElementById('inquiryText').value.trim();
  if (!inquiryText) {
    showError('問い合わせ内容を入力してください。');
    return;
  }
  
  const tone = document.querySelector('input[name="tone"]:checked').value;
  
  document.getElementById('noKnowledgeWarning').classList.add('hidden');
  showLoading();
  
  try {
    const response = await fetch('/api/replies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await window.firebaseAuth.currentUser.getIdToken()}`
      },
      body: JSON.stringify({
        inquiry: inquiryText,
        tone: tone,
        userKnowledge: userKnowledge
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      displayReplies(data.replies);
    } else {
      showError('返信生成に失敗しました: ' + data.message);
      // フォールバック: デモデータを表示
      displayDemoReplies(inquiryText, tone);
    }
  } catch (error) {
    console.error('Generate replies error:', error);
    showError('返信生成でエラーが発生しました。デモデータを表示します。');
    // フォールバック: デモデータを表示
    displayDemoReplies(inquiryText, tone);
  } finally {
    hideLoading();
  }
}

// デモ用返信生成（フォールバック）
function displayDemoReplies(inquiry, tone) {
  const toneMap = {
    'polite': '丁寧',
    'casual': 'カジュアル', 
    'firm': 'きっぱり'
  };
  
  const replies = [
    {
      style: `${toneMap[tone]}（パターン1）`,
      text: `お問い合わせいただきありがとうございます。\\n\\n${inquiry}についてのご質問ですね。\\n\\n${userKnowledge?.services || 'サービス詳細'}をご案内させていただきます。\\n\\n詳細につきましては、お気軽にお問い合わせください。\\n\\nよろしくお願いいたします。`
    },
    {
      style: `${toneMap[tone]}（パターン2）`,
      text: `ありがとうございます。\\n\\n${inquiry}についてのお問い合わせですね。\\n\\n${userKnowledge?.businessName || '当店'}では、${userKnowledge?.services || 'さまざまなサービス'}をご提供しております。\\n\\nお気軽にご相談ください。`
    },
    {
      style: `${toneMap[tone]}（パターン3）`,
      text: `お問い合わせありがとうございます。\\n\\n${userKnowledge?.services || 'サービス情報'}をご案内いたします。\\n\\n${userKnowledge?.reservationInfo || 'お電話またはオンラインでご予約'}いただけます。\\n\\nお待ちしております。`
    }
  ];
  
  displayReplies(replies);
}

// 返信結果の表示
function displayReplies(replies) {
  const container = document.getElementById('repliesContainer');
  if (!container) return;
  
  container.innerHTML = '';
  
  replies.forEach((reply, index) => {
    const div = document.createElement('div');
    div.className = 'bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow';
    div.innerHTML = `
      <div class="flex justify-between items-center mb-4">
        <h4 class="font-semibold text-gray-800">
          <i class="fas fa-comment mr-2 text-primary-500"></i>
          ${reply.style}
        </h4>
        <button onclick="copyToClipboard('${reply.text.replace(/'/g, "\\'")}', this)" 
                class="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
          <i class="fas fa-copy mr-1"></i>コピー
        </button>
      </div>
      <div class="bg-gray-50 p-4 rounded-lg">
        <pre class="whitespace-pre-wrap text-sm text-gray-800 font-normal">${reply.text}</pre>
      </div>
    `;
    container.appendChild(div);
  });
  
  document.getElementById('resultsArea').classList.remove('hidden');
}

// UI制御関数
function showLoginScreen() {
  if (!elements.loginScreen) return;
  elements.loginScreen.classList.remove('hidden');
  if (elements.signupScreen) elements.signupScreen.classList.add('hidden');
  if (elements.mainApp) elements.mainApp.classList.add('hidden');
  if (elements.loginButtons) elements.loginButtons.classList.remove('hidden');
  if (elements.userButtons) elements.userButtons.classList.add('hidden');
}

function showSignupScreen() {
  if (!elements.signupScreen) return;
  if (elements.loginScreen) elements.loginScreen.classList.add('hidden');
  elements.signupScreen.classList.remove('hidden');
  if (elements.mainApp) elements.mainApp.classList.add('hidden');
}

function showMainApp() {
  if (!elements.mainApp) return;
  if (elements.loginScreen) elements.loginScreen.classList.add('hidden');
  if (elements.signupScreen) elements.signupScreen.classList.add('hidden');
  elements.mainApp.classList.remove('hidden');
  if (elements.loginButtons) elements.loginButtons.classList.add('hidden');
  if (elements.userButtons) elements.userButtons.classList.remove('hidden');
  if (elements.userName && currentUser) {
    elements.userName.textContent = currentUser.displayName;
  }
  showTab('reply');
}

function showTab(tab) {
  document.querySelectorAll('[id$="Tab"]').forEach(btn => {
    btn.classList.remove('border-primary-500', 'text-primary-600');
    btn.classList.add('border-transparent', 'text-gray-500');
  });
  
  const replyPage = document.getElementById('replyPage');
  const knowledgePage = document.getElementById('knowledgePage');
  
  if (replyPage) replyPage.classList.add('hidden');
  if (knowledgePage) knowledgePage.classList.add('hidden');

  if (tab === 'reply') {
    const replyTab = document.getElementById('replyTab');
    if (replyTab) {
      replyTab.classList.remove('border-transparent', 'text-gray-500');
      replyTab.classList.add('border-primary-500', 'text-primary-600');
    }
    if (replyPage) replyPage.classList.remove('hidden');
  } else if (tab === 'knowledge') {
    const knowledgeTab = document.getElementById('knowledgeTab');
    if (knowledgeTab) {
      knowledgeTab.classList.remove('border-transparent', 'text-gray-500');
      knowledgeTab.classList.add('border-primary-500', 'text-primary-600');
    }
    if (knowledgePage) knowledgePage.classList.remove('hidden');
  }
}

function validateGenerateBtn() {
  const inquiryText = document.getElementById('inquiryText');
  const generateBtn = document.getElementById('generateBtn');
  if (inquiryText && generateBtn) {
    const hasText = inquiryText.value.trim().length > 0;
    generateBtn.disabled = !hasText;
  }
}

// ユーティリティ関数
function showLoading() {
  if (elements.loading) {
    elements.loading.classList.remove('hidden');
  }
}

function hideLoading() {
  if (elements.loading) {
    elements.loading.classList.add('hidden');
  }
}

function showError(message) {
  alert('❌ エラー: ' + message);
}

function showSuccess(message) {
  alert('✅ ' + message);
}

function copyToClipboard(text, button) {
  navigator.clipboard.writeText(text).then(() => {
    const originalContent = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check mr-1"></i>コピー済み';
    button.classList.add('bg-green-500');
    button.classList.remove('bg-primary-500');
    
    setTimeout(() => {
      button.innerHTML = originalContent;
      button.classList.remove('bg-green-500');
      button.classList.add('bg-primary-500');
    }, 2000);
  }).catch(err => {
    console.error('Copy failed:', err);
    showError('コピーに失敗しました');
  });
}

// DOMContentLoaded後に初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initReplyBot);
} else {
  initReplyBot();
}