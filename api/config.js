const WEATHER_DATA = {
  'seoul': { city: '서울 (강남/여의도)', temp: 14, min: 9, max: 18, condition: '맑음 후 차차 흐림', rainProb: 20, airQuality: '좋음 (28㎍/㎥)', outfit: '트렌치코트, 니트, 슬랙스', umbrella: false },
  'pangyo': { city: '성남/판교 테크노밸리', temp: 13, min: 8, max: 17, condition: '구름 많음', rainProb: 30, airQuality: '보통 (42㎍/㎥)', outfit: '가벼운 자켓, 셔츠, 가디건', umbrella: false },
  'busan': { city: '부산 (해운대/서면)', temp: 17, min: 12, max: 21, condition: '맑고 따뜻함', rainProb: 10, airQuality: '좋음 (18㎍/㎥)', outfit: '얇은 자켓, 롱슬리브 셔츠', umbrella: false },
  'daejeon': { city: '대전 (둔산/유성)', temp: 14, min: 8, max: 19, condition: '오후 한때 소나기', rainProb: 65, airQuality: '보통 (35㎍/㎥)', outfit: '바람막이, 우산 필수 지참', umbrella: true },
  'incheon': { city: '인천 (송도/부평)', temp: 13, min: 9, max: 17, condition: '바람 약간 강함', rainProb: 25, airQuality: '좋음 (25㎍/㎥)', outfit: '도톰한 아우터, 스카프', umbrella: false }
};

const STOCK_DATA = [
  { name: 'KOSPI', price: '2,580.45', change: '+0.62%', isUp: true },
  { name: 'KOSDAQ', price: '735.10', change: '+0.38%', isUp: true },
  { name: 'S&P 500', price: '5,864.67', change: '+0.40%', isUp: true },
  { name: 'NASDAQ', price: '18,518.61', change: '+0.80%', isUp: true },
  { name: '삼성전자', price: '58,400원', change: '+1.04%', isUp: true },
  { name: '카카오', price: '38,200원', change: '+2.14%', isUp: true },
  { name: '원/달러 환율', price: '1,378.50원', change: '-3.20원', isUp: false }
];

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204).end();
    return;
  }

  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const currentUrl = `${proto}://${host}`;

  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({
    apiKey: process.env.KAKAO_API_KEY || 'f4a85c9ad10954427600e3d692e7431c',
    mobileUrl: currentUrl,
    regions: Object.keys(WEATHER_DATA).map(key => ({ id: key, ...WEATHER_DATA[key] })),
    stocks: STOCK_DATA
  }));
};
