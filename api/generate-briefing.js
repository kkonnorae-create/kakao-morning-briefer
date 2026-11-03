const WEATHER_DATA = {
  'seoul': { city: '서울 (강남/여의도)', temp: 14, min: 9, max: 18, condition: '맑음 후 차차 흐림', rainProb: 20, airQuality: '좋음 (28㎍/㎥)', outfit: '트렌치코트, 니트, 슬랙스', umbrella: false },
  'pangyo': { city: '성남/판교 테크노밸리', temp: 13, min: 8, max: 17, condition: '구름 많음', rainProb: 30, airQuality: '보통 (42㎍/㎥)', outfit: '가벼운 자켓, 셔츠, 가디건', umbrella: false },
  'busan': { city: '부산 (해운대/서면)', temp: 17, min: 12, max: 21, condition: '맑고 따뜻함', rainProb: 10, airQuality: '좋음 (18㎍/㎥)', outfit: '얇은 자켓, 롱슬리브 셔츠', umbrella: false },
  'daejeon': { city: '대전 (둔산/유성)', temp: 14, min: 8, max: 19, condition: '오후 한때 소나기', rainProb: 65, airQuality: '보통 (35㎍/㎥)', outfit: '바람막이, 우산 필수 지참', umbrella: true },
  'incheon': { city: '인천 (송도/부평)', temp: 13, min: 9, max: 17, condition: '바람 약간 강함', rainProb: 25, airQuality: '좋음 (25㎍/㎥)', outfit: '도톰한 아우터, 스카프', umbrella: false }
};

function generateBriefingContent({ region, origin, destination, commuteDuration, schedules, persona, customNotes }) {
  const weather = WEATHER_DATA[region] || WEATHER_DATA['seoul'];
  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 (${['일', '월', '화', '수', '목', '금', '토'][today.getDay()]})`;
  
  let greeting = '';
  let closing = '';
  let styleEmoji = '';

  switch (persona) {
    case 'gentle':
      styleEmoji = '🌸';
      greeting = `좋은 아침이에요! 상쾌한 시작을 응원하는 모닝 비서입니다 ☕\n오늘 하루도 몸과 마음 모두 편안하게 보내실 수 있도록 아침 소식을 전해드려요.`;
      closing = `바쁜 일상 속에서도 따뜻한 물 한잔 챙겨 드시고, 깊은 심호흡으로 하루를 시작해 보세요. 오늘도 당신을 온 마음으로 응원합니다! ✨`;
      break;
    case 'tsundere':
      styleEmoji = '😼';
      greeting = `어이, 벌써 아침이야. 아직 졸고 있는 건 아니겠지? ⏰\n오늘 할 일 많으니까 딴청 피우지 말고 핵심만 딱 브리핑할게. 집중해.`;
      closing = `일정 밀려서 야근하지 말고 집중해서 끝내. 그리고 밥 거르지 마, 챙겨주는 건 이번뿐이니까! 😤`;
      break;
    case 'passionate':
      styleEmoji = '🔥';
      greeting = `굿모닝 챔피언! 활기찬 아침입니다! ☀️🚀\n오늘 하루도 꿈을 향해 거침없이 질주할 준비 되셨나요? 오늘의 파이팅 넘치는 브리핑 나갑니다!`;
      closing = `우리는 할 수 있습니다! 오늘 만나는 모든 기회를 완벽하게 내 것으로 만들어버립시다! 아자아자 파이팅! 💥`;
      break;
    case 'professional':
    default:
      styleEmoji = '👔';
      greeting = `안녕하십니까. 대표님의 하루를 서포트하는 굿모닝 AI 비서입니다.\n${dateStr} 출근길 주요 현황 및 일정을 보고드립니다.`;
      closing = `이상으로 금일 모닝 브리핑을 마칩니다. 차질 없는 하루가 되시길 지원하겠습니다.`;
      break;
  }

  let scheduleText = '';
  if (schedules && schedules.length > 0) {
    scheduleText = schedules.map((s, idx) => `  ${idx + 1}. [${s.time}] ${s.title} (${s.location || '사내'})`).join('\n');
  } else {
    scheduleText = '  - 등록된 주요 미팅 일정이 없습니다. 집중 업무 시간으로 활용해 보세요.';
  }

  const umbrellaNotice = weather.umbrella 
    ? '⚠️ 우산 필수! 오후 비 예보가 있습니다.' 
    : '☀️ 우산은 필요 없습니다. 쾌적한 출근길이 예상됩니다.';

  const fullText = 
`${styleEmoji} [굿모닝 카톡 브리퍼] ${dateStr}
----------------------------------------
${greeting}

📍 [출근길 교통 & 동선]
• 경로: ${origin} ➡️ ${destination}
• 예상 소요 시간: 약 ${commuteDuration || '45'}분
• 이동 팁: 출근 피크 시간대(08:20~08:50) 대중교통 환승 구간 혼잡 예상

🌦️ [오늘의 날씨 & 옷차림]
• 현재: ${weather.temp}℃ (${weather.condition})
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
    summary: `${weather.condition}, ${weather.temp}℃ / ${schedules ? schedules.length : 0}건의 일정 / 출근 약 ${commuteDuration || '45'}분`,
    umbrellaNotice
  };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  let payload = req.body;
  if (!payload || typeof payload !== 'object') {
    let body = '';
    for await (const chunk of req) {
      body += chunk;
    }
    try {
      payload = JSON.parse(body || '{}');
    } catch (e) {
      payload = {};
    }
  }

  try {
    const briefing = generateBriefingContent(payload);
    const result = { success: true, briefing };

    if (res.json) {
      res.status(200).json(result);
    } else {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.statusCode = 200;
      res.end(JSON.stringify(result));
    }
  } catch (err) {
    const errorResult = { success: false, error: err.message };
    if (res.json) {
      res.status(400).json(errorResult);
    } else {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.statusCode = 400;
      res.end(JSON.stringify(errorResult));
    }
  }
};
