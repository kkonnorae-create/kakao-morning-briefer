// Comprehensive Korean administrative districts and landmark hubs
const KOREA_REGIONS = [
  // 서울특별시
  { province: '서울특별시', district: '강남구', town: '역삼동/강남역', alias: '강남역 역삼 테헤란로', tempOffset: 0, lat: 37.4979, lng: 127.0276 },
  { province: '서울특별시', district: '강남구', town: '삼성동/코엑스', alias: '코엑스 삼성 봉은사로', tempOffset: 0, lat: 37.5088, lng: 127.0631 },
  { province: '서울특별시', district: '서초구', town: '서초동/양재역', alias: '양재역 서초 교대', tempOffset: 0, lat: 37.4842, lng: 127.0347 },
  { province: '서울특별시', district: '영등포구', town: '여의도동/여의도역', alias: '여의도 금융가 국회의사당', tempOffset: 0, lat: 37.5216, lng: 126.9242 },
  { province: '서울특별시', district: '구로구', town: '구로동/신도림역', alias: '신도림 구로디지털단지 G밸리', tempOffset: 0, lat: 37.5089, lng: 126.8912 },
  { province: '서울특별시', district: '금천구', town: '가산동/가산디지털단지', alias: '가디 가산디지털단지역 마리오아울렛', tempOffset: 0, lat: 37.4815, lng: 126.8826 },
  { province: '서울특별시', district: '마포구', town: '상암동/DMC', alias: '상암 DMC 디지털미디어시티 방송국', tempOffset: 0, lat: 37.5772, lng: 126.8916 },
  { province: '서울특별시', district: '마포구', town: '서교동/홍대입구역', alias: '홍대 연남 합정 망원', tempOffset: 0, lat: 37.5568, lng: 126.9238 },
  { province: '서울특별시', district: '종로구', town: '광화문/종로1가', alias: '광화문 시청 종각 종로 경복궁', tempOffset: -0.5, lat: 37.5704, lng: 126.9790 },
  { province: '서울특별시', district: '중구', town: '명동/을지로입구', alias: '을지로 힙지로 명동 충무로', tempOffset: 0, lat: 37.5660, lng: 126.9827 },
  { province: '서울특별시', district: '성동구', town: '성수동/성수역', alias: '성수 뚝섬 서울숲 팝업스토어', tempOffset: 0, lat: 37.5445, lng: 127.0560 },
  { province: '서울특별시', district: '송파구', town: '잠실동/잠실역', alias: '잠실 롯데타워 롯데월드 송리단길', tempOffset: 0, lat: 37.5133, lng: 127.1001 },
  { province: '서울특별시', district: '송파구', town: '문정동/법조타운', alias: '문정 법조타운 가든파이브', tempOffset: 0, lat: 37.4859, lng: 127.1224 },
  { province: '서울특별시', district: '용산구', town: '이태원/용산역', alias: '용산 한남동 이태원 신용산', tempOffset: 0, lat: 37.5298, lng: 126.9648 },
  { province: '서울특별시', district: '광진구', town: '화양동/건대입구', alias: '건대 구의 자양 뚝섬유원지', tempOffset: 0, lat: 37.5404, lng: 127.0692 },
  { province: '서울특별시', district: '강동구', town: '천호동/천호역', alias: '천호 강동 고덕 명일', tempOffset: 0, lat: 37.5386, lng: 127.1234 },
  { province: '서울특별시', district: '노원구', town: '상계동/노원역', alias: '노원 상계 중계 하계', tempOffset: -1.0, lat: 37.6542, lng: 127.0607 },
  { province: '서울특별시', district: '강서구', town: '마곡동/마곡나루역', alias: '마곡 발산 LG사이언스파크 김포공항', tempOffset: 0, lat: 37.5668, lng: 126.8273 },
  { province: '서울특별시', district: '동작구', town: '노량진/사당역', alias: '사당 이수 흑석 중앙대 노량진', tempOffset: 0, lat: 37.4765, lng: 126.9816 },

  // 경기도
  { province: '경기도', district: '성남시 분당구', town: '삼평동/판교테크노밸리', alias: '판교 알파돔 유스페이스 카카오 엔씨소프트', tempOffset: -0.5, lat: 37.4020, lng: 127.1086 },
  { province: '경기도', district: '성남시 분당구', town: '정자동/정자역', alias: '정자 미금 서현 수내 분당네이버', tempOffset: -0.5, lat: 37.3667, lng: 127.1083 },
  { province: '경기도', district: '성남시 중원구/수정구', town: '성남동/모란역', alias: '모란 야탑 성남시청', tempOffset: -0.5, lat: 37.4323, lng: 127.1292 },
  { province: '경기도', district: '수원시 영통구', town: '이의동/광교중앙역', alias: '광교 호수공원 경기도청 갤러리아', tempOffset: -0.5, lat: 37.2888, lng: 127.0519 },
  { province: '경기도', district: '수원시 영통구', town: '매탄동/삼성전자본사', alias: '삼성디지털시티 매탄 망포 영통역', tempOffset: -0.5, lat: 37.2587, lng: 127.0560 },
  { province: '경기도', district: '수원시 팔달구', town: '매산로/수원역', alias: '수원역 인계동 행궁동 화서', tempOffset: -0.5, lat: 37.2660, lng: 127.0003 },
  { province: '경기도', district: '용인시 수지구', town: '풍덕천동/수지구청역', alias: '수지 동천 죽전 신분당선', tempOffset: -0.5, lat: 37.3223, lng: 127.0975 },
  { province: '경기도', district: '용인시 기흥구', town: '구갈동/기흥역', alias: '기흥 동백 신갈 삼성반도체', tempOffset: -0.5, lat: 37.2755, lng: 127.1160 },
  { province: '경기도', district: '화성시', town: '반송동/동탄역', alias: '동탄 동탄신도시 롯데백화점 SRT', tempOffset: -0.5, lat: 37.2002, lng: 127.0976 },
  { province: '경기도', district: '고양시 일산동구', town: '장항동/정발산역', alias: '일산 호수공원 킨텍스 라페스타', tempOffset: -1.0, lat: 37.6584, lng: 126.7732 },
  { province: '경기도', district: '고양시 덕양구', town: '화정동/원흥/삼송', alias: '화정 삼송 스타필드 고양', tempOffset: -1.0, lat: 37.6347, lng: 126.8326 },
  { province: '경기도', district: '안양시 동안구', town: '범계동/평촌역', alias: '평촌 범계 안양 인덕원스마트스퀘어', tempOffset: -0.5, lat: 37.3912, lng: 126.9534 },
  { province: '경기도', district: '부천시', town: '중동/신중동역', alias: '부천 상동 중동 부천역 현대백화점', tempOffset: 0, lat: 37.5030, lng: 126.7660 },
  { province: '경기도', district: '광명시', town: '일직동/광명역', alias: 'KTX광명역 이케아 철산 하안', tempOffset: 0, lat: 37.4162, lng: 126.8848 },
  { province: '경기도', district: '하남시', town: '망월동/미사역', alias: '미사 미사강변 스타필드하남 풍산', tempOffset: -0.5, lat: 37.5645, lng: 127.1926 },
  { province: '경기도', district: '남양주시', town: '다산동/별내역', alias: '다산신도시 별내 평내호평', tempOffset: -1.0, lat: 37.6186, lng: 127.1610 },
  { province: '경기도', district: '파주시', town: '와동동/운정역', alias: '운정신도시 야당 출판도시 헤이리', tempOffset: -1.5, lat: 37.7258, lng: 126.7674 },
  { province: '경기도', district: '평택시', town: '고덕동/지제역', alias: '평택 지제역 삼성전자고덕캠퍼스 서정리', tempOffset: 0, lat: 37.0189, lng: 127.0863 },
  { province: '경기도', district: '김포시', town: '구래동/사우동', alias: '김포 한강신도시 장기 풍무', tempOffset: -0.5, lat: 37.6433, lng: 126.6268 },
  { province: '경기도', district: '과천시', town: '중앙동/정부과천청사', alias: '과천 대공원 경마공원 지식정보타운', tempOffset: -0.5, lat: 37.4293, lng: 126.9877 },

  // 인천광역시
  { province: '인천광역시', district: '연수구', town: '송도동/송도센트럴파크', alias: '송도 바이오단지 현대아울렛 트리플스트리트', tempOffset: -0.5, lat: 37.3926, lng: 126.6393 },
  { province: '인천광역시', district: '서구', town: '청라동/청라국제도시', alias: '청라 호수공원 루원시티 검단', tempOffset: -0.5, lat: 37.5385, lng: 126.6543 },
  { province: '인천광역시', district: '부평구', town: '부평동/부평역', alias: '부평 지하상가 부평구청 산곡', tempOffset: 0, lat: 37.4895, lng: 126.7248 },
  { province: '인천광역시', district: '남동구', town: '구월동/인천터미널', alias: '구월 로데오 인천시청 논현동', tempOffset: 0, lat: 37.4419, lng: 126.7018 },
  { province: '인천광역시', district: '중구', town: '운서동/인천국제공항', alias: '영종도 인천공항 차이나타운 월미도', tempOffset: 0, lat: 37.4602, lng: 126.4407 },

  // 부산광역시
  { province: '부산광역시', district: '해운대구', town: '우동/마린시티/센텀시티', alias: '센텀 벡스코 마린시티 해운대해수욕장 롯백', tempOffset: 2.0, lat: 35.1631, lng: 129.1636 },
  { province: '부산광역시', district: '부산진구', town: '부전동/서면역', alias: '서면 롯데백화점 전포카페거리 부산진', tempOffset: 2.0, lat: 35.1578, lng: 129.0593 },
  { province: '부산광역시', district: '수영구', town: '광안동/광안리해변', alias: '광안리 광안대교 민락수변공원 남천동', tempOffset: 2.0, lat: 35.1532, lng: 129.1189 },
  { province: '부산광역시', district: '동구', town: '초량동/부산역', alias: '부산역 KTX 중앙동 남포동 자갈치', tempOffset: 2.0, lat: 35.1152, lng: 129.0422 },
  { province: '부산광역시', district: '강서구', town: '명지동/국제신도시', alias: '명지 녹산공단 에코델타시티', tempOffset: 2.0, lat: 35.0991, lng: 128.9192 },

  // 대구광역시
  { province: '대구광역시', district: '수성구', town: '범어동/범어역', alias: '범어 수성못 만촌 수성구청 법원', tempOffset: 1.0, lat: 35.8584, lng: 128.6253 },
  { province: '대구광역시', district: '중구', town: '동성로/반월당역', alias: '동성로 반월당 중앙로 현대백화점대구', tempOffset: 1.0, lat: 35.8655, lng: 128.5934 },
  { province: '대구광역시', district: '동구', town: '신암동/동대구역', alias: '동대구역 신세계백화점 대구공항', tempOffset: 1.0, lat: 35.8797, lng: 128.6285 },
  { province: '대구광역시', district: '달서구', town: '두류동/이월드/상인역', alias: '두류 성서 상인 월성', tempOffset: 1.0, lat: 35.8528, lng: 128.5574 },

  // 대전광역시
  { province: '대전광역시', district: '유성구', town: '도룡동/신세계/카이스트', alias: '카이스트 대전신세계 테크노밸리 궁동 봉명동', tempOffset: 0.5, lat: 36.3748, lng: 127.3872 },
  { province: '대전광역시', district: '서구', town: '둔산동/정부대전청사', alias: '둔산 정부청사 시청 탄방동 갤러리아타임월드', tempOffset: 0.5, lat: 36.3551, lng: 127.3837 },
  { province: '대전광역시', district: '동구', town: '정동/대전역', alias: '대전역 성심당 중앙시장 대동', tempOffset: 0.5, lat: 36.3315, lng: 127.4330 },

  // 광주광역시
  { province: '광주광역시', district: '서구', town: '치평동/상무지구', alias: '상무지구 광주시청 김대중컨벤션센터', tempOffset: 1.5, lat: 35.1528, lng: 126.8523 },
  { province: '광주광역시', district: '광산구', town: '수완동/첨단지구', alias: '수완지구 첨단지구 하남산단 광주송정역', tempOffset: 1.5, lat: 35.1915, lng: 126.8228 },
  { province: '광주광역시', district: '동구', town: '금남로/충장로', alias: '충장로 국립아시아문화전당 조선대', tempOffset: 1.5, lat: 35.1485, lng: 126.9189 },

  // 울산광역시
  { province: '울산광역시', district: '남구', town: '삼산동/달동', alias: '삼산 현대백화점 롯데백화점 울산시청', tempOffset: 1.5, lat: 35.5384, lng: 129.3364 },
  { province: '울산광역시', district: '동구/북구', town: '전하동/현대자동차/중공업', alias: '현대차 울산공장 현대중공업 일산지', tempOffset: 1.5, lat: 35.5218, lng: 129.4316 },

  // 세종특별자치시
  { province: '세종특별자치시', district: '세종시', town: '어진동/정부세종청사', alias: '정부청사 나성동 보람동 세종호수공원 조치원', tempOffset: 0, lat: 36.5042, lng: 127.2657 },

  // 강원특별자치도
  { province: '강원특별자치도', district: '춘천시', town: '온의동/춘천역/남춘천', alias: '춘천 소양강 레고랜드 강원대', tempOffset: -2.0, lat: 37.8813, lng: 127.7298 },
  { province: '강원특별자치도', district: '원주시', town: '무실동/원주혁신도시', alias: '원주 혁신도시 단계동 남원주', tempOffset: -1.5, lat: 37.3422, lng: 127.9202 },
  { province: '강원특별자치도', district: '강릉시', town: '교동/안목해변/경포', alias: '강릉 안목 커피거리 KTX강릉역 경포대', tempOffset: 0.5, lat: 37.7519, lng: 128.8761 },

  // 충청북도 / 충청남도
  { province: '충청북도', district: '청주시 흥덕구', town: '복대동/오송생명과학단지', alias: '오송역 지웰시티 하복대 청주산단', tempOffset: 0, lat: 36.6358, lng: 127.4293 },
  { province: '충청남도', district: '천안시 서북구', town: '불당동/천안아산역', alias: '신불당 천안아산 KTX 불당 두정', tempOffset: 0, lat: 36.8153, lng: 127.1065 },
  { province: '충청남도', district: '아산시', town: '탕정면/디스플레이시티', alias: '탕정 삼성디스플레이 온양온천', tempOffset: 0, lat: 36.8048, lng: 127.0601 },

  // 전북특별자치도 / 전라남도
  { province: '전북특별자치도', district: '전주시 완산구', town: '효자동/전북도청/한옥마을', alias: '전주 신시가지 전주한옥마을 서신동', tempOffset: 1.0, lat: 35.8166, lng: 127.1130 },
  { province: '전라남도', district: '순천시', town: '왕지동/신대지구', alias: '순천만 신대 조례동 순천역', tempOffset: 1.5, lat: 34.9606, lng: 127.5255 },
  { province: '전라남도', district: '여수시', town: '학동/여수산단/해양공원', alias: '여수 엑스포 산단 웅천 낭만포차', tempOffset: 2.0, lat: 34.7604, lng: 127.6622 },

  // 경상북도 / 경상남도
  { province: '경상북도', district: '포항시 남구', town: '효자동/포스코/지곡', alias: '포항 포스코 포항공대 영일대', tempOffset: 1.5, lat: 36.0089, lng: 129.3323 },
  { province: '경상북도', district: '구미시', town: '송정동/국가산업단지', alias: '구미 인동 옥계 산단 삼전', tempOffset: 1.0, lat: 36.1195, lng: 128.3444 },
  { province: '경상남도', district: '창원시 성산구', town: '상남동/중앙동', alias: '창원 상남동 창원국가산단 마산 진해', tempOffset: 2.0, lat: 35.2215, lng: 128.6826 },
  { province: '경상남도', district: '김해시', town: '내외동/율하지구', alias: '김해 율하 장유 내외동 경전철', tempOffset: 2.0, lat: 35.2335, lng: 128.8722 },

  // 제주특별자치도
  { province: '제주특별자치도', district: '제주시', town: '연동/노형동/제주공항', alias: '제주공항 노형 드림타워 신제주 아라동', tempOffset: 3.5, lat: 33.4890, lng: 126.4983 },
  { province: '제주특별자치도', district: '서귀포시', town: '서호동/혁신도시/중문', alias: '서귀포 중문 혁신도시 신시가지', tempOffset: 4.0, lat: 33.2541, lng: 126.5601 }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { KOREA_REGIONS };
}
