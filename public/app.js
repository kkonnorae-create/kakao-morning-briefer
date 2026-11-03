// Good Morning Kakao Briefer - Nationwide Route & Transport Edition

let KAKAO_API_KEY = 'f4a85c9ad10954427600e3d692e7431c';
let MOBILE_URL = window.location.origin;
let weatherData = {};
let stockData = [];

// Current selected places
let selectedOrigin = {
  name: '역삼동/강남역',
  province: '서울특별시',
  district: '강남구',
  town: '역삼동/강남역',
  lat: 37.4979,
  lng: 127.0276,
  tempOffset: 0
};

let selectedDestination = {
  name: '삼평동/판교테크노밸리',
  province: '경기도',
  district: '성남시 분당구',
  town: '삼평동/판교테크노밸리',
  lat: 37.4020,
  lng: 127.1086,
  tempOffset: -0.5
};

// Route metrics
let routeMetrics = {
  distanceKm: '16.2',
  durationMinutes: '42',
  taxiFare: '18,200',
  transitRecommend: '신분당선 급행 / 광역버스(9000, 9401)',
  weather: null
};

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
  initRegionPickerModal();
  recalculateRouteMetrics();
  initQRCode();
  updateBubbleTime();

  // Close suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#originInput') && !e.target.closest('#originSuggestions')) {
      document.getElementById('originSuggestions').classList.add('hidden');
    }
    if (!e.target.closest('#destinationInput') && !e.target.closest('#destinationSuggestions')) {
      document.getElementById('destinationSuggestions').classList.add('hidden');
    }
  });

  // Generate initial briefing
  generateBriefing(false);
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

// Load config from server
async function loadServerConfig() {
  try {
    const res = await fetch('/api/config');
    const data = await res.json();
    if (data.apiKey) KAKAO_API_KEY = data.apiKey;
    if (data.mobileUrl) {
      MOBILE_URL = data.mobileUrl;
      const mobileDisplay = document.getElementById('mobileUrlDisplay');
      if (mobileDisplay) mobileDisplay.innerText = MOBILE_URL;
    }
    if (data.stocks) {
      stockData = data.stocks;
      renderStockGrid();
    }
  } catch (err) {
    console.error('Failed to load server config:', err);
  }
}

// Autocomplete Search for Places
function handleSearchInput(type) {
  const input = document.getElementById(type === 'origin' ? 'originInput' : 'destinationInput');
  const container = document.getElementById(type === 'origin' ? 'originSuggestions' : 'destinationSuggestions');
  const query = (input.value || '').trim().toLowerCase();

  if (!query) {
    container.classList.add('hidden');
    return;
  }

  const matches = (window.KOREA_REGIONS || []).filter(item => {
    return item.town.toLowerCase().includes(query) ||
           item.district.toLowerCase().includes(query) ||
           item.province.toLowerCase().includes(query) ||
           (item.alias && item.alias.toLowerCase().includes(query));
  }).slice(0, 8);

  if (matches.length === 0) {
    container.innerHTML = `
      <div class="p-3 text-xs text-slate-400 text-center">
        일치하는 주요 거점이 없습니다.<br>
        <span class="text-amber-300 font-medium">"${query}"</span>(으)로 직접 사용됩니다.
      </div>
    `;
    container.classList.remove('hidden');
    return;
  }

  container.innerHTML = matches.map(m => `
    <div onclick="selectPlace('${type}', '${m.town}', '${m.district}', '${m.province}', ${m.lat}, ${m.lng}, ${m.tempOffset})" class="p-2.5 hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs transition">
      <div class="flex items-center gap-2">
        <i class="ph ph-map-pin text-amber-400 text-sm"></i>
        <div>
          <div class="font-bold text-slate-100">${m.town}</div>
          <div class="text-[10px] text-slate-400">${m.province} · ${m.district}</div>
        </div>
      </div>
      <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">선택</span>
    </div>
  `).join('');

  container.classList.remove('hidden');
}

function selectPlace(type, town, district, province, lat, lng, tempOffset) {
  const input = document.getElementById(type === 'origin' ? 'originInput' : 'destinationInput');
  const container = document.getElementById(type === 'origin' ? 'originSuggestions' : 'destinationSuggestions');
  input.value = town;
  container.classList.add('hidden');

  const placeObj = { name: town, town, district, province, lat, lng, tempOffset };
  if (type === 'origin') {
    selectedOrigin = placeObj;
  } else {
    selectedDestination = placeObj;
  }

  recalculateRouteMetrics();
  showToast(`${type === 'origin' ? '출발지' : '도착지'}가 [${town}]으로 설정되었습니다.`);
}

// Swap Origin & Destination
function swapOriginDestination() {
  const temp = { ...selectedOrigin };
  selectedOrigin = { ...selectedDestination };
  selectedDestination = temp;

  document.getElementById('originInput').value = selectedOrigin.name;
  document.getElementById('destinationInput').value = selectedDestination.name;

  recalculateRouteMetrics();
  showToast('출발지와 도착지가 서로 교환되었습니다.');
}

// Apply Preset Route
function applyPresetRoute(originTown, destTown) {
  const originItem = (window.KOREA_REGIONS || []).find(r => r.town === originTown) || { town: originTown, lat: 37.4979, lng: 127.0276, province: '서울', district: '강남구', tempOffset: 0 };
  const destItem = (window.KOREA_REGIONS || []).find(r => r.town === destTown) || { town: destTown, lat: 37.4020, lng: 127.1086, province: '경기', district: '성남시', tempOffset: -0.5 };

  selectedOrigin = { ...originItem, name: originTown };
  selectedDestination = { ...destItem, name: destTown };

  document.getElementById('originInput').value = originTown;
  document.getElementById('destinationInput').value = destTown;

  recalculateRouteMetrics();
  showToast(`[${originTown}] ➡️ [${destTown}] 코스가 적용되었습니다.`);
}

// Distance & Fare Calculator (Haversine & Taxi formula)
function recalculateRouteMetrics() {
  const lat1 = selectedOrigin.lat || 37.4979;
  const lon1 = selectedOrigin.lng || 127.0276;
  const lat2 = selectedDestination.lat || 37.4020;
  const lon2 = selectedDestination.lng || 127.1086;

  // Haversine formula
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const directDistance = R * c;
  
  // Real road multiplier ~1.35x
  const roadKm = Math.max(1.2, directDistance * 1.35);
  const roadKmStr = roadKm.toFixed(1);

  // Transit Duration
  let duration = Math.round(roadKm * 2.3 + 8);
  if (duration < 15) duration = 15;
  if (duration > 130) duration = 130;

  // Taxi Fare Estimation (2026 Korean taxi standards: base 4800 KRW up to 1.6km, +1000 KRW/km)
  let taxiFareNum = 4800;
  if (roadKm > 1.6) {
    taxiFareNum += Math.round((roadKm - 1.6) * 1050 / 100) * 100;
  }
  // Peak hour surcharge ~10%
  taxiFareNum = Math.round((taxiFareNum * 1.1) / 100) * 100;
  const taxiFareStr = taxiFareNum.toLocaleString();

  // Transit Recommendation line
  let recommend = '지하철 급행 / 간선버스 환승';
  if (selectedOrigin.name.includes('강남') && selectedDestination.name.includes('판교')) {
    recommend = '신분당선 급행 (강남역 ➡️ 판교역 14분 주파) / 광역버스(9000, 9401)';
  } else if (selectedOrigin.name.includes('홍대') && selectedDestination.name.includes('여의도')) {
    recommend = '지하철 2호선 당산역 환승 9호선 급행 / 시내버스 5714번';
  } else if (selectedOrigin.name.includes('송도') && selectedDestination.name.includes('가산')) {
    recommend = '인천 1호선 원인재역 ➡️ 수인분당선 ➡️ 1호선 급행 환승';
  } else if (selectedOrigin.name.includes('해운대') && selectedDestination.name.includes('서면')) {
    recommend = '부산 지하철 2호선 직통 (센텀 ➡️ 서면 22분) / 급행버스 1001번';
  } else if (selectedOrigin.name.includes('유성') && selectedDestination.name.includes('둔산')) {
    recommend = '대전 지하철 1호선 (유성온천역 ➡️ 시청역) / 간선 108번';
  } else if (roadKm < 6) {
    recommend = '시내 간선/지선 버스 직통 또는 자전거·도보 이동 추천';
  } else {
    recommend = `주요 간선/광역버스 및 인접 지하철 연계 환승 (${roadKmStr}km)`;
  }

  // Dynamic Weather computation for destination
  const baseTemp = 14;
  const tempOffset = selectedDestination.tempOffset !== undefined ? selectedDestination.tempOffset : 0;
  const currentTemp = Math.round((baseTemp + tempOffset) * 10) / 10;
  const isRain = selectedDestination.province.includes('대전') || selectedDestination.town.includes('둔산');

  const weather = {
    city: `${selectedDestination.province} ${selectedDestination.district || ''}`,
    temp: currentTemp,
    min: Math.round(currentTemp - 5),
    max: Math.round(currentTemp + 5),
    condition: isRain ? '오후 한때 소나기' : (currentTemp > 15 ? '맑고 온화함' : '구름 조금, 쾌적함'),
    rainProb: isRain ? 65 : 20,
    airQuality: '좋음 (26㎍/㎥)',
    outfit: currentTemp < 12 ? '도톰한 자켓, 니트, 머플러' : '가벼운 가디건, 셔츠, 슬랙스',
    umbrella: isRain
  };

  routeMetrics = {
    distanceKm: roadKmStr,
    durationMinutes: String(duration),
    taxiFare: taxiFareStr,
    transitRecommend: recommend,
    weather
  };

  // Update DOM UI elements
  document.getElementById('routeDistanceText').innerText = `약 ${roadKmStr} km`;
  document.getElementById('routeTransitDurationText').innerText = `약 ${duration}분`;
  document.getElementById('routeTaxiFareText').innerText = `약 ${taxiFareStr}원`;
  document.getElementById('routeTransitRecommendText').innerText = recommend;

  // Update Weather preview card
  renderWeatherPreviewCard(weather);
}

// Render Weather Preview Card
function renderWeatherPreviewCard(w) {
  const preview = document.getElementById('weatherPreview');
  if (!preview) return;

  preview.innerHTML = `
    <div class="flex items-center gap-2.5">
      <div class="text-2xl">${w.umbrella ? '🌧️' : '⛅'}</div>
      <div>
        <div class="font-bold text-slate-100 flex items-center gap-1 text-xs">
          <span>${w.temp}℃</span>
          <span class="text-slate-400 font-normal">(${w.condition})</span>
        </div>
        <div class="text-[10px] text-slate-400 mt-0.5 truncate max-w-[140px]">
          도착지: <span class="text-amber-300 font-medium">${w.city}</span>
        </div>
      </div>
    </div>
    <div class="text-right">
      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${w.umbrella ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}">
        ${w.umbrella ? '☔ 우산 필수' : '☂️ 우산 없음'}
      </span>
      <div class="text-[10px] text-slate-400 mt-0.5">미세먼지 ${w.airQuality.split(' ')[0]}</div>
    </div>
  `;
}

// 🗺️ Transport Navigation Links (Kakao Map, Bus, Taxi, Navi)
function openKakaoMap(mode) {
  const originName = document.getElementById('originInput').value || selectedOrigin.name;
  const destName = document.getElementById('destinationInput').value || selectedDestination.name;

  let url = `https://map.kakao.com/?sName=${encodeURIComponent(originName)}&eName=${encodeURIComponent(destName)}`;
  
  if (mode === 'transit') {
    url += '&target=transit';
  } else if (mode === 'car') {
    url += '&target=car';
  }

  // Check mobile device for KakaoMap app deep linking
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile && selectedOrigin.lat && selectedDestination.lat) {
    const byType = mode === 'car' ? 'CAR' : (mode === 'transit' ? 'PUBLICTRANSIT' : 'PUBLICTRANSIT');
    const appUrl = `kakaomap://route?sp=${selectedOrigin.lat},${selectedOrigin.lng}&ep=${selectedDestination.lat},${selectedDestination.lng}&by=${byType}`;
    
    // Attempt deep link, fallback to web
    const start = Date.now();
    window.location.href = appUrl;
    setTimeout(() => {
      if (Date.now() - start < 1500) {
        window.open(url, '_blank');
      }
    }, 1000);
  } else {
    window.open(url, '_blank');
  }
}

// 🚕 Open Kakao Taxi
function openKakaoTaxi() {
  const originName = document.getElementById('originInput').value || selectedOrigin.name;
  const destName = document.getElementById('destinationInput').value || selectedDestination.name;
  
  showToast(`🚕 예상 택시비: 약 ${routeMetrics.taxiFare}원 (${routeMetrics.distanceKm}km) · 카카오 T로 연결합니다.`);
  
  // Kakao T deeplink or taxi map
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    window.location.href = 'kakaot://';
    setTimeout(() => {
      window.open(`https://map.kakao.com/?sName=${encodeURIComponent(originName)}&eName=${encodeURIComponent(destName)}&target=car`, '_blank');
    }, 800);
  } else {
    window.open(`https://map.kakao.com/?sName=${encodeURIComponent(originName)}&eName=${encodeURIComponent(destName)}&target=car`, '_blank');
  }
}

// Region Picker Modal (17 Provinces ➡️ Districts)
function initRegionPickerModal() {
  const provSelect = document.getElementById('modalProvinceSelect');
  if (!provSelect || !window.KOREA_REGIONS) return;

  const provinces = Array.from(new Set(window.KOREA_REGIONS.map(r => r.province)));
  provSelect.innerHTML = provinces.map(p => `<option value="${p}">${p}</option>`).join('');

  handleModalProvinceChange();
}

function handleModalProvinceChange() {
  const provSelect = document.getElementById('modalProvinceSelect');
  const distSelect = document.getElementById('modalDistrictSelect');
  const selectedProv = provSelect.value;

  const filtered = window.KOREA_REGIONS.filter(r => r.province === selectedProv);
  distSelect.innerHTML = filtered.map((item, idx) => `
    <option value="${item.town}" data-lat="${item.lat}" data-lng="${item.lng}" data-district="${item.district}" data-offset="${item.tempOffset}">
      ${item.district} - ${item.town}
    </option>
  `).join('');
}

function applyModalRegionSelection() {
  const target = document.querySelector('input[name="pickerTarget"]:checked').value;
  const distSelect = document.getElementById('modalDistrictSelect');
  const provSelect = document.getElementById('modalProvinceSelect');

  const selectedOption = distSelect.options[distSelect.selectedIndex];
  if (!selectedOption) return;

  const town = selectedOption.value;
  const province = provSelect.value;
  const district = selectedOption.getAttribute('data-district');
  const lat = parseFloat(selectedOption.getAttribute('data-lat'));
  const lng = parseFloat(selectedOption.getAttribute('data-lng'));
  const tempOffset = parseFloat(selectedOption.getAttribute('data-offset'));

  selectPlace(target, town, district, province, lat, lng, tempOffset);
  closeModal('regionPickerModal');
}

// Render Stocks
function renderStockGrid() {
  const container = document.getElementById('stockGrid');
  if (!container || !stockData) return;
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
  if (!container) return;
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

  schedules.push({ id: Date.now(), time, title, location });
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

  const origin = document.getElementById('originInput').value || selectedOrigin.name;
  const destination = document.getElementById('destinationInput').value || selectedDestination.name;
  const persona = document.querySelector('input[name="persona"]:checked').value;
  const customNotes = document.getElementById('customNotes').value;

  try {
    const res = await fetch('/api/generate-briefing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin,
        destination,
        commuteDuration: routeMetrics.durationMinutes,
        distanceKm: routeMetrics.distanceKm,
        taxiFare: routeMetrics.taxiFare,
        transitRecommend: routeMetrics.transitRecommend,
        weatherCustom: routeMetrics.weather,
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

      const unreadBadge = document.getElementById('mobileUnreadBadge');
      if (unreadBadge) unreadBadge.classList.remove('hidden');

      if (autoSwitchToPreview && window.innerWidth < 1024) {
        switchMobileTab('preview');
      }
      showToast('✨ 전국 길찾기 기반 모닝 브리핑이 생성되었습니다!');
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

  const chatArea = document.getElementById('chatScrollArea');
  if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;
}

// Mobile Tab Switcher
function switchMobileTab(tab) {
  const secSettings = document.getElementById('sectionSettings');
  const secPreview = document.getElementById('sectionPreview');
  const btnSettings = document.getElementById('mobileTabSettings');
  const btnPreview = document.getElementById('mobileTabPreview');
  const unreadBadge = document.getElementById('mobileUnreadBadge');

  if (window.innerWidth >= 1024) {
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
    if (unreadBadge) unreadBadge.classList.add('hidden');
  }
}

// Window resize
window.addEventListener('resize', () => {
  if (window.innerWidth >= 1024) {
    document.getElementById('sectionSettings').classList.remove('hidden');
    document.getElementById('sectionPreview').classList.remove('hidden');
  }
});

// Kakao Login & Memo
function handleKakaoLogin() {
  if (!window.Kakao) return;
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
      success: function() {
        showToast('카카오 로그인 성공! 나와의 채팅 전송이 가능합니다.');
        updateLoginButtonState();
      },
      fail: function() {
        openModal('kakaoConsoleModal');
      }
    });
  } catch (e) {
    openModal('kakaoConsoleModal');
  }
}

function sendToKakaoMemo() {
  if (!currentBriefing) {
    showToast('먼저 AI 모닝 브리핑을 생성해 주세요.');
    return;
  }
  if (!window.Kakao) return;

  if (!Kakao.Auth.getAccessToken()) {
    Kakao.Auth.login({
      scope: 'talk_message',
      success: function() {
        updateLoginButtonState();
        executeMemoSend();
      },
      fail: function() {
        if (confirm('카카오 도메인 설정이 필요할 수 있습니다. 카카오톡 공유하기로 전송하시겠습니까?')) {
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
        button_title: '출근길 지도 & 브리퍼 열기'
      }
    },
    success: function() {
      showToast('🎉 카카오톡 나와의 채팅방으로 전송되었습니다!');
    },
    fail: function() {
      shareKakaoTalk();
    }
  });
}

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
        title: `☀️ [굿모닝 카톡 브리퍼] ${selectedOrigin.name} ➡️ ${selectedDestination.name}`,
        description: currentBriefing.summary,
        imageUrl: 'https://t1.daumcdn.net/kakaomapweb/place/common/img/kakaomap_logo.png',
        link: {
          mobileWebUrl: MOBILE_URL,
          webUrl: MOBILE_URL
        }
      },
      buttons: [
        {
          title: '카카오맵 길찾기 & 브리핑 보기',
          link: {
            mobileWebUrl: MOBILE_URL,
            webUrl: MOBILE_URL
          }
        }
      ]
    });
    showToast('카카오톡 앱으로 연결 중입니다...');
  } catch (err) {
    copyBriefingText();
  }
}

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

// QR Code
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

// Modals
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('hidden');
    if (id === 'mobileQrModal') initQRCode();
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('hidden');
}

// Toast
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
