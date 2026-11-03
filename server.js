const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3000;
const KAKAO_API_KEY = process.env.KAKAO_API_KEY || 'f4a85c9ad10954427600e3d692e7431c';

// Detect local IPv4 address
function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const LOCAL_IP = getLocalIp();

// MIME types for static files
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Weather mock data for regions
const WEATHER_DATA = {
  'seoul': { city: '서울 (강남/여의도)', temp: 14, min: 9, max: 18, condition: '맑음 후 차차 흐림', rainProb: 20, airQuality: '좋음 (28㎍/㎥)', outfit: '트렌치코트, 니트, 슬랙스', umbrella: false },
  'pangyo': { city: '성남/판교 테크노밸리', temp: 13, min: 8, max: 17, condition: '구름 많음', rainProb: 30, airQuality: '보통 (42㎍/㎥)', outfit: '가벼운 자켓, 셔츠, 가디건', umbrella: false },
  'busan': { city: '부산 (해운대/서면)', temp: 17, min: 12, max: 21, condition: '맑고 따뜻함', rainProb: 10, airQuality: '좋음 (18㎍/㎥)', outfit: '얇은 자켓, 롱슬리브 셔츠', umbrella: false },
  'daejeon': { city: '대전 (둔산/유성)', temp: 14, min: 8, max: 19, condition: '오후 한때 소나기', rainProb: 65, airQuality: '보통 (35㎍/㎥)', outfit: '바람막이, 우산 필수 지참', umbrella: true },
  'incheon': { city: '인천 (송도/부평)', temp: 13, min: 9, max: 17, condition: '바람 약간 강함', rainProb: 25, airQuality: '좋음 (25㎍/㎥)', outfit: '도톰한 아우터, 스카프', umbrella: false }
};

// Stock & Economy indicators
const STOCK_DATA = [
  { name: 'KOSPI', price: '2,580.45', change: '+0.62%', isUp: true },
  { name: 'KOSDAQ', price: '735.10', change: '+0.38%', isUp: true },
  { name: 'S&P 500', price: '5,864.67', change: '+0.40%', isUp: true },
  { name: 'NASDAQ', price: '18,518.61', change: '+0.80%', isUp: true },
  { name: '삼성전자', price: '58,400원', change: '+1.04%', isUp: true },
  { name: '카카오', price: '38,200원', change: '+2.14%', isUp: true },
  { name: '원/달러 환율', price: '1,378.50원', change: '-3.20원', isUp: false }
];

// Persona briefings generator
function generateBriefingContent({ region, origin, destination, commuteDuration, schedules, persona, customNotes, distanceKm, taxiFare, transitRecommend, weatherCustom }) {
  const weather = weatherCustom || WEATHER_DATA[region] || WEATHER_DATA['seoul'];
  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 (${['일', '월', '화', '수', '목', '금', '토'][today.getDay()]})`;
  
  let greeting = '';
  let closing = '';
  let styleEmoji = '';

  switch (persona) {
    case 'gentle': // 다정한 웰니스 코치
      styleEmoji = '🌸';
      greeting = `좋은 아침이에요! 상쾌한 시작을 응원하는 모닝 비서입니다 ☕\n오늘 하루도 몸과 마음 모두 편안하게 보내실 수 있도록 아침 소식을 전해드려요.`;
      closing = `바쁜 일상 속에서도 따뜻한 물 한잔 챙겨 드시고, 깊은 심호흡으로 하루를 시작해 보세요. 오늘도 당신을 온 마음으로 응원합니다! ✨`;
      break;
    case 'tsundere': // 츤데레 효율주의자
      styleEmoji = '😼';
      greeting = `어이, 벌써 아침이야. 아직 졸고 있는 건 아니겠지? ⏰\n오늘 할 일 많으니까 딴청 피우지 말고 핵심만 딱 브리핑할게. 집중해.`;
      closing = `일정 밀려서 야근하지 말고 집중해서 끝내. 그리고 밥 거르지 마, 챙겨주는 건 이번뿐이니까! 😤`;
      break;
    case 'passionate': // 열정 만수르
      styleEmoji = '🔥';
      greeting = `굿모닝 챔피언! 활기찬 아침입니다! ☀️🚀\n오늘 하루도 꿈을 향해 거침없이 질주할 준비 되셨나요? 오늘의 파이팅 넘치는 브리핑 나갑니다!`;
      closing = `우리는 할 수 있습니다! 오늘 만나는 모든 기회를 완벽하게 내 것으로 만들어버립시다! 아자아자 파이팅! 💥`;
      break;
    case 'professional': // 전문 수석비서
    default:
      styleEmoji = '👔';
      greeting = `안녕하십니까. 대표님의 하루를 서포트하는 굿모닝 AI 비서입니다.\n${dateStr} 출근길 주요 현황 및 일정을 보고드립니다.`;
      closing = `이상으로 금일 모닝 브리핑을 마칩니다. 차질 없는 하루가 되시길 지원하겠습니다.`;
      break;
  }

  // Format schedules
  let scheduleText = '';
  if (schedules && schedules.length > 0) {
    scheduleText = schedules.map((s, idx) => `  ${idx + 1}. [${s.time}] ${s.title} (${s.location || '사내'})`).join('\n');
  } else {
    scheduleText = '  - 등록된 주요 미팅 일정이 없습니다. 집중 업무 시간으로 활용해 보세요.';
  }

  // Umbrella check
  const umbrellaNotice = weather.umbrella 
    ? '⚠️ 우산 필수! 오후 비 예보가 있습니다.' 
    : '☀️ 우산은 필요 없습니다. 쾌적한 출근길이 예상됩니다.';

  const fullText = 
`${styleEmoji} [굿모닝 카톡 브리퍼] ${dateStr}
----------------------------------------
${greeting}

📍 [출근길 교통 & 대중교통 동선]
• 경로: ${origin} ➡️ ${destination}
• 거리 및 소요: 약 ${distanceKm || '16'}km (대중교통 약 ${commuteDuration || '42'}분)
• 추천 노선: ${transitRecommend || '지하철 급행 / 광역버스 연계 환승'}
• 택시 이용 시: 예상 요금 약 ${taxiFare || '18,500'}원 (교통상황 반영)
• 이동 팁: 출근 피크 시간대(08:20~08:50) 혼잡 구간 사전 체크 권장

🌦️ [오늘의 날씨 & 옷차림]
• 지역: ${weather.city || '선택 지역'}
• 현재 기온: ${weather.temp}℃ (${weather.condition})
• 기온 범위: 최저 ${weather.min}℃ / 최고 ${weather.max}℃
• 미세먼지: ${weather.airQuality}
• 추천 옷차림: ${weather.outfit}
• 알림: ${umbrellaNotice}

📅 [오늘의 톡캘린더 일정]
${scheduleText}

📈 [모닝 금융 & 경제 지표]
• 코스피: 2,580.45 (+0.62%)
• 나스닥: 18,518.61 (+0.80%)
• 환율: 1,378.50원 (-3.20원)

${customNotes ? `💡 [오늘의 메모]: ${customNotes}\n\n` : ''}----------------------------------------
${closing}`;

  return {
    date: dateStr,
    weather,
    fullText,
    summary: `${weather.city} · ${weather.condition} ${weather.temp}℃ / ${origin}➡️${destination} (${commuteDuration || '42'}분)`,
    umbrellaNotice,
    distanceKm: distanceKm || '16',
    taxiFare: taxiFare || '18,500',
    transitRecommend: transitRecommend || '지하철/버스 연계'
  };
}

// Request Handler
const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Endpoints
  if (pathname === '/api/config' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      apiKey: KAKAO_API_KEY,
      localIp: LOCAL_IP,
      mobileUrl: `http://${LOCAL_IP}:${PORT}`,
      regions: Object.keys(WEATHER_DATA).map(key => ({ id: key, ...WEATHER_DATA[key] })),
      stocks: STOCK_DATA
    }));
    return;
  }

  if (pathname === '/api/generate-briefing' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const briefing = generateBriefingContent(payload);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, briefing }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  if (pathname === '/api/playmcp-config' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      playMcpUrl: 'https://playmcp.kakao.com',
      tools: [
        { name: '톡캘린더', desc: '오늘의 캘린더 일정 조회 및 등록' },
        { name: '카카오톡 나와의 채팅', desc: 'AI가 작성한 최종 모닝 브리핑을 나에게 즉시 발송' },
        { name: '카카오맵 / 길찾기', desc: '출발지와 목적지 간 최적 경로 및 실시간 소요 시간 조회' },
        { name: '날씨 & 기상정보', desc: '오늘 출근길 기온, 강수 확률, 미세먼지 수치 조회' }
      ],
      samplePrompt: `매일 아침 7시 30분, 내 톡캘린더에서 오늘의 일정을 조회하고 카카오맵으로 집(역삼역)에서 회사(판교테크노밸리)까지의 실시간 소요 시간을 확인해줘. 그리고 오늘의 날씨와 우산 필요 여부, 추천 옷차림을 정리해서 카카오톡 나와의 채팅방으로 '굿모닝 브리핑' 메시지를 보내줘.`
    }));
    return;
  }

  // Static File Serving
  let filePath = path.join(__dirname, 'public', pathname === '/' ? 'index.html' : pathname);
  
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(__dirname, 'public', 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Server Internal Error');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================================`);
  console.log(`☀️ 굿모닝 카톡 브리퍼 (Good Morning Kakao Briefer)`);
  console.log(`💻 Local:   http://localhost:${PORT}`);
  console.log(`📱 Mobile:  http://${LOCAL_IP}:${PORT}`);
  console.log(`🔑 Kakao Key: ${KAKAO_API_KEY}`);
  console.log(`=================================================`);
});
