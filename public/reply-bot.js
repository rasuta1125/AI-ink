// 返信ボット用のJavaScript（強化版）
let currentUser = null;
let userKnowledge = null;
let currentStep = 1;
let replyTexts = []; // Store reply texts for copying

// 初期化
function init() {
    const savedUser = localStorage.getItem('replyBotUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showMainApp();
        loadUserKnowledge();
    } else {
        showLoginScreen();
    }
    setupEventListeners();
}

function setupEventListeners() {
    try {
        // ログイン・新規登録
        document.getElementById('loginForm').addEventListener('submit', handleLogin);
        
        const signupBtn = document.getElementById('signupBtn');
        if (signupBtn) {
            signupBtn.addEventListener('click', showSignupScreen);
            console.log('✓ Signup button event listener added');
        } else {
            console.error('✗ Signup button not found!');
        }
        
        document.getElementById('backToLogin').addEventListener('click', showLoginScreen);
        document.getElementById('logoutBtn').addEventListener('click', handleLogout);
        
        // 新規登録フロー
        document.getElementById('signupForm').addEventListener('submit', handleSignup);
        
        // タブ切り替え
        document.getElementById('replyTab').addEventListener('click', () => showTab('reply'));
        document.getElementById('knowledgeTab').addEventListener('click', () => showTab('knowledge'));
        
        // 返信生成
        document.getElementById('inquiryText').addEventListener('input', validateGenerateBtn);
        document.getElementById('generateBtn').addEventListener('click', generateReplies);
        document.getElementById('goToKnowledge').addEventListener('click', () => showTab('knowledge'));
        
        // ナレッジフォーム
        document.getElementById('knowledgeForm').addEventListener('submit', saveKnowledge);
    } catch (error) {
        console.error('Error setting up event listeners:', error);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const user = { id: 'replybot_' + Date.now(), email, name: email.split('@')[0] };
    
    currentUser = user;
    localStorage.setItem('replyBotUser', JSON.stringify(user));
    showMainApp();
}

function handleLogout() {
    currentUser = null;
    userKnowledge = null;
    localStorage.removeItem('replyBotUser');
    localStorage.removeItem('replyBotKnowledge');
    showLoginScreen();
}

function showLoginScreen() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('signupScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('loginButtons').classList.remove('hidden');
    document.getElementById('userButtons').classList.add('hidden');
}

function showMainApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('loginButtons').classList.add('hidden');
    document.getElementById('userButtons').classList.remove('hidden');
    document.getElementById('userName').textContent = currentUser?.name || '';
    showTab('reply');
}

function showTab(tab) {
    document.querySelectorAll('[id$="Tab"]').forEach(btn => {
        btn.classList.remove('border-primary-500', 'text-primary-600');
        btn.classList.add('border-transparent', 'text-gray-500');
    });
    
    document.getElementById('replyPage').classList.add('hidden');
    document.getElementById('knowledgePage').classList.add('hidden');

    if (tab === 'reply') {
        document.getElementById('replyTab').classList.remove('border-transparent', 'text-gray-500');
        document.getElementById('replyTab').classList.add('border-primary-500', 'text-primary-600');
        document.getElementById('replyPage').classList.remove('hidden');
    } else if (tab === 'knowledge') {
        document.getElementById('knowledgeTab').classList.remove('border-transparent', 'text-gray-500');
        document.getElementById('knowledgeTab').classList.add('border-primary-500', 'text-primary-600');
        document.getElementById('knowledgePage').classList.remove('hidden');
    }
}

// 新規登録関連関数
function showSignupScreen() {
    console.log('showSignupScreen called');
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('signupScreen').classList.remove('hidden');
}

async function handleSignup(e) {
    e.preventDefault();
    
    // バリデーション
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const passwordConfirm = document.getElementById('signupPasswordConfirm').value;
    
    if (!name || !email || !password || !passwordConfirm) {
        alert('全ての項目を入力してください。');
        return;
    }
    
    if (password !== passwordConfirm) {
        alert('パスワードが一致しません。');
        return;
    }
    
    if (password.length < 8) {
        alert('パスワードは8文字以上で入力してください。');
        return;
    }
    
    // ユーザー作成（基本情報のみ）
    const userData = {
        id: 'replybot_' + Date.now(),
        name: name,
        email: email,
        createdAt: new Date().toISOString()
    };
    
    // 保存
    currentUser = userData;
    userKnowledge = null; // ナレッジは初期化
    localStorage.setItem('replyBotUser', JSON.stringify(userData));
    
    alert('アカウント作成が完了しました！\n\n「ナレッジ登録」タブで事業情報を入力して、返信機能を活用してください。');
    
    // メインアプリに遷移（ナレッジタブを開く）
    document.getElementById('signupScreen').classList.add('hidden');
    showMainApp();
    showTab('knowledge'); // ナレッジタブを開く
}

async function loadUserKnowledge() {
    const saved = localStorage.getItem('replyBotKnowledge_' + currentUser.id);
    if (saved) {
        userKnowledge = JSON.parse(saved);
        // フォームにデータを入力
        populateKnowledgeForm();
    }
}

function populateKnowledgeForm() {
    if (!userKnowledge) return;
    
    if (userKnowledge.businessType) document.getElementById('businessType').value = userKnowledge.businessType;
    if (userKnowledge.businessName) document.getElementById('businessName').value = userKnowledge.businessName;
    if (userKnowledge.websiteUrl) document.getElementById('websiteUrl').value = userKnowledge.websiteUrl;
    if (userKnowledge.services || userKnowledge.pricing) {
        document.getElementById('pricing').value = userKnowledge.services || userKnowledge.pricing;
    }
    if (userKnowledge.businessHours) document.getElementById('businessHours').value = userKnowledge.businessHours;
    if (userKnowledge.reservationInfo) document.getElementById('reservationInfo').value = userKnowledge.reservationInfo;
    if (userKnowledge.features) document.getElementById('features').value = userKnowledge.features;
}

async function saveKnowledge(e) {
    e.preventDefault();
    
    const knowledge = {
        businessType: document.getElementById('businessType').value,
        businessName: document.getElementById('businessName').value,
        websiteUrl: document.getElementById('websiteUrl').value,
        services: document.getElementById('pricing').value,
        businessHours: document.getElementById('businessHours').value,
        reservationInfo: document.getElementById('reservationInfo').value,
        features: document.getElementById('features').value,
        updatedAt: new Date().toISOString()
    };
    
    userKnowledge = knowledge;
    localStorage.setItem('replyBotKnowledge_' + currentUser.id, JSON.stringify(knowledge));
    
    // 成功メッセージを表示
    const btn = e.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check mr-3"></i>保存完了！';
    btn.classList.add('bg-green-500');
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.remove('bg-green-500');
    }, 2000);
    
    showTab('reply');
}

function validateGenerateBtn() {
    const hasText = document.getElementById('inquiryText').value.trim().length > 0;
    document.getElementById('generateBtn').disabled = !hasText;
}

async function generateReplies() {
    if (!userKnowledge || !userKnowledge.businessType) {
        document.getElementById('noKnowledgeWarning').classList.remove('hidden');
        return;
    }

    document.getElementById('noKnowledgeWarning').classList.add('hidden');
    document.getElementById('loading').classList.remove('hidden');
    
    // 簡易デモ実装
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const replies = [
        {
            style: "丁寧",
            text: "お問い合わせいただきありがとうございます。\n\nサービスについてのご質問ですね。\n料金につきましては、詳細をお伝えいたします。\n\nお気軽にお問い合わせください。\n\nよろしくお願いいたします。",
            needs: [],
            refs: []
        },
        {
            style: "カジュアル", 
            text: "ありがとうございます！\n\nサービスのお問い合わせですね。\n料金について詳しくお答えします。\n\nお気軽にお問い合わせくださいね。",
            needs: [],
            refs: []
        },
        {
            style: "短文",
            text: "ありがとうございます。\n料金についてご案内いたします。\nお電話でお問い合わせください。",
            needs: [],
            refs: []
        }
    ];
    
    displayReplies(replies);
    document.getElementById('loading').classList.add('hidden');
}

function displayReplies(replies) {
    const container = document.getElementById('repliesContainer');
    container.innerHTML = '';
    replyTexts = replies.map(reply => reply.text); // Store texts for copying
    
    replies.forEach((reply, index) => {
        const div = document.createElement('div');
        div.className = 'bg-white border border-gray-200 rounded-lg p-6';
        div.innerHTML = 
            '<div class="flex justify-between items-center mb-4">' +
                '<h4 class="font-semibold text-gray-800">' +
                    '<i class="fas fa-comment mr-2 text-primary-500"></i>' +
                    reply.style +
                '</h4>' +
                '<button onclick="copyReplyToClipboard(' + index + ')" class="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded text-sm font-medium">' +
                    '<i class="fas fa-copy mr-1"></i>コピー' +
                '</button>' +
            '</div>' +
            '<div class="bg-gray-50 p-4 rounded-lg">' +
                '<pre class="whitespace-pre-wrap text-sm text-gray-800">' + reply.text + '</pre>' +
            '</div>';
        container.appendChild(div);
    });
    
    document.getElementById('resultsArea').classList.remove('hidden');
}

function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        button.innerHTML = '<i class="fas fa-check mr-1"></i>コピー済み';
        button.classList.add('bg-green-500');
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-copy mr-1"></i>コピー';
            button.classList.remove('bg-green-500');
        }, 2000);
    });
}

function copyReplyToClipboard(index) {
    if (replyTexts[index]) {
        navigator.clipboard.writeText(replyTexts[index]).then(() => {
            const button = event.target.closest('button');
            if (button) {
                const originalHTML = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check mr-1"></i>コピー済み';
                button.classList.add('bg-green-500');
                setTimeout(() => {
                    button.innerHTML = originalHTML;
                    button.classList.remove('bg-green-500');
                }, 2000);
            }
        });
    }
}

// 初期化実行 (DOMが完全に読み込まれた後)
document.addEventListener('DOMContentLoaded', init);