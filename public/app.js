// Good Morning Kakao Briefer - Client Application (Mobile & Desktop)

let KAKAO_API_KEY = 'f4a85c9ad10954427600e3d692e7431c';
let MOBILE_URL = window.location.origin;
let weatherData = {};
let stockData = [];

// Default morning schedules
let schedules = [
  { id: 1, time: '09:30', title: '팀 데일리 스탠드업 미팅', location: '온라인 구글 미트' },
  { id: 2, time: '11:00', title: 'Q4 신규 AI 기능 릴리즈 검토', location: '대회의실 A' },
  { id: 3, time: '14:00', title: '카카오 PlayMCP 연동 개발 리뷰', location: '판교 본사 4층' },
  { id: 4, time: '16:30', title: '스프린트 코드 리뷰 및 QA 체크', location: '사내 개발룸' }
];

let currentBriefing = null;
let qrcodeInstance = null;

// Initialize on document ready
document.addEventListener('DOMContentLoaded', async () => {
  initKakaoSDK();
  renderSchedules();
  await loadServerConfig();
  updateWeatherCard();
  initQRCode();
  
  // Set initial current time in bubble
  updateBubbleTime();

  // Generate initial briefing automatically for high responsiveness
  generateBriefing(false); // false = don't auto-switch tab on initial load
});

// Initialize Kakao SDK
function initKakaoSDK() {
  if (window.Kakao) {
    try {
      if (!Kakao.isInitialized()) {
        Kakao.init(KAKAO_API_KEY);
      }
      console.log('Kakao SDK Initialized with Key:', KAKAO_API_KEY);
      updateLoginButtonState();
    } catch (e) {
      console.warn('Kakao SDK init warning:', e);
    }
  }
}

// Update Bubble Time
function updateBubbleTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? '오후' : '오전';
  const displayHours = hours % 12 || 12;
  const timeElem = document.getElementById('bubbleTime');
  if (timeElem) {
    timeElem.innerText = `${ampm} ${displayHours}:${minutes}`;
  }
}

// Check Kakao Auth status
function updateLoginButtonState() {
  if (window.Kakao && Kakao.Auth) {
    const isLogged = Kakao.Auth.getAccessToken();
    const btnText = document.getElementById('loginBtnText');
    if (isLogged) {
      btnText.innerText = '연결됨';
      document.getElementById('kakaoLoginBtn').classList.replace('bg-[#FEE500]', 'bg-emerald-400');
    } else {
      btnText.innerText = '로그인';
      document.getElementById('kakaoLoginBtn').classList.replace('bg-emerald-400', 'bg-[#FEE500]');
    }
  }
}

// Load config from server
async function loadServerConfig() {
  try {
    const res = await fetch('/api/config');
    const data = await res.json();
    if (data.apiKey) {
      KAKAO_API_KEY = data.apiKey;
    }
    if (data.mobileUrl) {
      MOBILE_URL = data.mobileUrl;
      const mobileDisplay = document.getElementById('mobileUrlDisplay');
      if (mobileDisplay) mobileDisplay.innerText = MOBILE_URL;
      const domainCode = document.getElementById('kakaoMobileDomainCode');
      if (domainCode) domainCode.innerText = MOBILE_URL;
    }
    if (data.regions) {
      data.regions.forEach(r => { weatherData[r.id] = r; });
    }
    if (data.stocks) {
      stockData = data.stocks;
      renderStockGrid();
    }
  } catch (err) {
    console.error('Failed to load server config:', err);
  }
}

// Initialize QR Code for Mobile Access
function initQRCode() {
  const qrElem = document.getElementById('qrcodeCanvas');
  if (qrElem && window.QRCode) {
    qrElem.innerHTML = '';
    qrcodeInstance = new QRCode(qrElem, {
      text: MOBILE_URL,
      width: 180,
      height: 180,
      colorDark: "#0f172a",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });
  }
}

// Mobile Tab Switcher (< 1024px)
function switchMobileTab(tab) {
  const secSettings = document.getElementById('sectionSettings');
  const secPreview = document.getElementById('sectionPreview');
  const btnSettings = document.getElementById('mobileTabSettings');
  const btnPreview = document.getElementById('mobileTabPreview');
  const unreadBadge = document.getElementById('mobileUnreadBadge');

  if (window.innerWidth >= 1024) {
    // Desktop: show both
    secSettings.classList.remove('hidden');
    secPreview.classList.remove('hidden');
    return;
  }

  if (tab === 'settings') {
    secSettings.classList.remove('hidden');
    secPreview.classList.add('hidden');

    btnSettings.className = 'flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 bg-amber-400 text-slate-950 shadow';
    btnPreview.className = 'flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 bg-slate-800 text-slate-300 border border-slate-700 relative';
  } else {
    secSettings.classList.add('hidden');
    secPreview.classList.remove('hidden');

    btnSettings.className = 'flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 bg-slate-800 text-slate-300 border border-slate-700';
    btnPreview.className = 'flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 bg-amber-400 text-slate-950 shadow relative';

    // Clear unread badge
    if (unreadBadge) unreadBadge.classList.add('hidden');

    // Scroll chat area
    setTimeout(() => {
      const chatArea = document.getElementById('chatScrollArea');
      if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;
    }, 50);
  }
}

// Window resize handler for mobile responsiveness
window.addEventListener('resize', () => {
  if (window.innerWidth >= 1024) {
    document.getElementById('sectionSettings').classList.remove('hidden');
    document.getElementById('sectionPreview').classList.remove('hidden');
  } else {
    // maintain mobile current view
    const isSettingsHidden = document.getElementById('sectionSettings').classList.contains('hidden');
    switchMobileTab(isSettingsHidden ? 'preview' : 'settings');
  }
});

// Render Weather Mini Preview
function updateWeatherCard() {
  const region = document.getElementById('regionSelect').value;
  const w = weatherData[region] || {
    city: '성남/판교 테크노밸리', temp: 13, min: 8, max: 17, condition: '구름 많음',
    rainProb: 30, airQuality: '보통', outfit: '가벼운 자켓, 셔츠, 가디건', umbrella: false
  };

  const preview = document.getElementById('weatherPreview');
  preview.innerHTML = `
    <div class="flex items-center gap-3">
      <div class="text-3xl">${w.umbrella ? '🌧️' : (w.rainProb > 40 ? '⛅' : '☀️')}</div>
      <div>
        <div class="font-bold text-slate-100 flex items-center gap-1.5 text-xs sm:text-sm">
          <span>${w.temp}℃</span>
          <span class="text-slate-400 font-normal">(${w.condition})</span>
          <span class="text-[10px] text-slate-400">최저 ${w.min}℃ / 최고 ${w.max}℃</span>
        </div>
        <div class="text-[11px] text-slate-400 mt-0.5">
          추천: <span class="text-amber-300 font-medium">${w.outfit}</span>
        </div>
      </div>
    </div>
    <div class="text-right flex-shrink-0">
      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${w.umbrella ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}">
        ${w.umbrella ? '☔ 우산 필수' : '☂️ 우산 없음'}
      </span>
      <div class="text-[10px] text-slate-400 mt-1">미세먼지 ${w.airQuality}</div>
    </div>
  `;
}

// Render Stocks
function renderStockGrid() {
  const container = document.getElementById('stockGrid');
  container.innerHTML = stockData.map(s => `
    <div class="p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-slate-700/60 flex flex-col justify-between">
      <div class="text-slate-400 text-[10px] font-medium truncate">${s.name}</div>
      <div class="font-bold text-slate-100 text-[11px] sm:text-xs mt-0.5">${s.price}</div>
      <div class="text-[10px] font-semibold ${s.isUp ? 'text-rose-400' : 'text-blue-400'} mt-0.5">
        ${s.change}
      </div>
    </div>
  `).join('');
}

// Render Schedules
function renderSchedules() {
  const container = document.getElementById('scheduleList');
  if (schedules.length === 0) {
    container.innerHTML = `<div class="text-slate-400 text-xs p-3 text-center">등록된 일정이 없습니다.</div>`;
    return;
  }

  container.innerHTML = schedules.map(s => `
    <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-700/60 text-xs hover:border-slate-600 transition">
      <div class="flex items-center gap-2.5 min-w-0">
        <span class="px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 font-mono font-bold text-[11px] border border-amber-400/20 flex-shrink-0">
          ${s.time}
        </span>
        <div class="truncate">
          <div class="font-semibold text-slate-200 truncate">${s.title}</div>
          <div class="text-[10px] text-slate-400 truncate">${s.location}</div>
        </div>
      </div>
      <button onclick="deleteScheduleItem(${s.id})" class="text-slate-500 hover:text-rose-400 transition p-1.5 flex-shrink-0" title="일정 삭제">
        <i class="ph ph-trash text-sm"></i>
      </button>
    </div>
  `).join('');
}

function addScheduleItem() {
  const time = prompt('일정 시간을 입력하세요 (예: 15:00)', '15:00');
  if (!time) return;
  const title = prompt('일정 제목을 입력하세요', '신규 프로젝트 킥오프');
  if (!title) return;
  const location = prompt('장소를 입력하세요 (선택)', '회의실 B') || '사내';

  schedules.push({
    id: Date.now(),
    time,
    title,
    location
  });
  renderSchedules();
  showToast('새 일정이 추가되었습니다.');
}

function deleteScheduleItem(id) {
  schedules = schedules.filter(s => s.id !== id);
  renderSchedules();
  showToast('일정이 삭제되었습니다.');
}

// Generate AI Morning Briefing
async function generateBriefing(autoSwitchToPreview = true) {
  const btn = document.getElementById('generateBtn');
  btn.disabled = true;
  btn.classList.add('opacity-75');
  btn.innerHTML = `<i class="ph ph-spinner animate-spin text-xl"></i><span>AI 브리핑 작성 중...</span>`;

  const region = document.getElementById('regionSelect').value;
  const origin = document.getElementById('originInput').value || '역삼역';
  const destination = document.getElementById('destinationInput').value || '판교 테크노밸리';
  const persona = document.querySelector('input[name="persona"]:checked').value;
  const customNotes = document.getElementById('customNotes').value;

  try {
    const res = await fetch('/api/generate-briefing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        region,
        origin,
        destination,
        commuteDuration: '42',
        schedules,
        persona,
        customNotes
      })
    });

    const data = await res.json();
    if (data.success && data.briefing) {
      currentBriefing = data.briefing;
      updateChatSimulator(currentBriefing);
      updateBubbleTime();

      // Show unread indicator on mobile tab
      const unreadBadge = document.getElementById('mobileUnreadBadge');
      if (unreadBadge) unreadBadge.classList.remove('hidden');

      // Auto switch to preview on mobile screen if requested
      if (autoSwitchToPreview && window.innerWidth < 1024) {
        switchMobileTab('preview');
      }
      showToast('✨ 오늘의 모닝 브리핑이 생성되었습니다!');
    }
  } catch (err) {
    console.error('Generate briefing error:', err);
    showToast('브리핑 생성 중 오류가 발생했습니다.');
  } finally {
    btn.disabled = false;
    btn.classList.remove('opacity-75');
    btn.innerHTML = `<i class="ph ph-sparkle text-xl"></i><span>AI 모닝 브리핑 생성하기</span>`;
  }
}

// Update KakaoTalk Mobile Simulator
function updateChatSimulator(briefing) {
  document.getElementById('chatDateDivider').innerText = briefing.date;
  document.getElementById('bubbleContent').innerText = briefing.fullText;
  document.getElementById('bubbleSummaryText').innerText = briefing.summary;

  const persona = document.querySelector('input[name="persona"]:checked').value;
  const titles = {
    professional: '👔 [수석비서] 모닝 데일리 브리핑',
    gentle: '🌸 [힐링 코치] 힘나는 아침 브리핑',
    tsundere: '😼 [팩트폭격] 출근길 핵심 브리핑',
    passionate: '🔥 [열정충전] 굿모닝 파이팅 브리핑'
  };
  document.getElementById('bubbleHeaderTitle').innerText = titles[persona] || '☀️ 굿모닝 모닝 브리핑';

  // Scroll to bottom
  const chatArea = document.getElementById('chatScrollArea');
  if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;
}

// Kakao Login Handler
function handleKakaoLogin() {
  if (!window.Kakao) {
    showToast('카카오 SDK를 불러오는 중입니다.');
    return;
  }

  if (Kakao.Auth.getAccessToken()) {
    Kakao.Auth.logout(() => {
      showToast('카카오 계정 연결이 해제되었습니다.');
      updateLoginButtonState();
    });
    return;
  }

  try {
    Kakao.Auth.login({
      scope: 'talk_message',
      success: function(authObj) {
        console.log('Login success:', authObj);
        showToast('카카오 로그인 성공! 나와의 채팅 전송이 가능합니다.');
        updateLoginButtonState();
      },
      fail: function(err) {
        console.error('Login fail:', err);
        openModal('kakaoConsoleModal');
      }
    });
  } catch (e) {
    console.error(e);
    openModal('kakaoConsoleModal');
  }
}

// Send to KakaoTalk 나와의 채팅 (나에게 보내기)
function sendToKakaoMemo() {
  if (!currentBriefing) {
    showToast('먼저 AI 모닝 브리핑을 생성해 주세요.');
    return;
  }

  if (!window.Kakao) {
    showToast('카카오 SDK가 준비되지 않았습니다.');
    return;
  }

  // Check if logged in with talk_message scope
  if (!Kakao.Auth.getAccessToken()) {
    Kakao.Auth.login({
      scope: 'talk_message',
      success: function() {
        updateLoginButtonState();
        executeMemoSend();
      },
      fail: function(err) {
        console.warn('Login required for direct Memo API:', err);
        // Fallback option: share or copy
        if (confirm('카카오 도메인 등록이 필요할 수 있습니다. 카카오톡 공유하기로 전송하시겠습니까?')) {
          shareKakaoTalk();
        } else {
          openModal('kakaoConsoleModal');
        }
      }
    });
    return;
  }

  executeMemoSend();
}

function executeMemoSend() {
  const fullText = currentBriefing.fullText.slice(0, 950);

  Kakao.API.request({
    url: '/v2/api/talk/memo/default/send',
    data: {
      template_object: {
        object_type: 'text',
        text: fullText,
        link: {
          web_url: MOBILE_URL,
          mobile_web_url: MOBILE_URL
        },
        button_title: '굿모닝 브리퍼 열기'
      }
    },
    success: function(res) {
      console.log('Kakao memo sent:', res);
      showToast('🎉 카카오톡 나와의 채팅방으로 전송되었습니다!');
    },
    fail: function(err) {
      console.error('Kakao memo fail:', err);
      shareKakaoTalk();
    }
  });
}

// Share via KakaoTalk (Native App Deeplink on Mobile)
function shareKakaoTalk() {
  if (!currentBriefing) {
    showToast('먼저 AI 모닝 브리핑을 생성해 주세요.');
    return;
  }

  if (!window.Kakao || !Kakao.Share) {
    copyBriefingText();
    return;
  }

  try {
    Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: '☀️ [굿모닝 카톡 브리퍼] 오늘의 출근길 AI 브리핑',
        description: currentBriefing.summary,
        imageUrl: 'https://t1.daumcdn.net/kakaomapweb/place/common/img/kakaomap_logo.png',
        link: {
          mobileWebUrl: MOBILE_URL,
          webUrl: MOBILE_URL
        }
      },
      buttons: [
        {
          title: '출근길 브리핑 확인하기',
          link: {
            mobileWebUrl: MOBILE_URL,
            webUrl: MOBILE_URL
          }
        }
      ]
    });
    showToast('카카오톡 앱으로 연결 중입니다...');
  } catch (err) {
    console.error('Kakao share error:', err);
    copyBriefingText();
  }
}

// Copy briefing text to clipboard
function copyBriefingText() {
  if (!currentBriefing) {
    showToast('먼저 AI 모닝 브리핑을 생성해 주세요.');
    return;
  }

  copyToClipboard(currentBriefing.fullText);
  showToast('📋 브리핑이 복사되었습니다! 카카오톡에 붙여넣어 보세요.');
}

function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
}

// Modal controls
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('hidden');
    if (id === 'mobileQrModal') {
      initQRCode();
    }
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('hidden');
}

// Toast notification
function showToast(message) {
  const existing = document.getElementById('toastNotification');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'toastNotification';
  toast.className = 'fixed bottom-20 lg:bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 border border-amber-400/60 text-amber-300 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl z-50 flex items-center gap-2 transition-all max-w-[90vw] truncate';
  toast.innerHTML = `<i class="ph ph-bell text-base text-amber-400 flex-shrink-0"></i><span class="truncate">${message}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
