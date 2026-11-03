module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204).end();
    return;
  }

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
};
