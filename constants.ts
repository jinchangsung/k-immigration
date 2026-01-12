import { NewsItem, Language } from './types';

export const SUPPORTED_LANGUAGES: Language[] = [
  Language.KR,
  Language.CN,
  Language.EN,
  Language.RU,
  Language.VN
];

export const NEWS_DATA: NewsItem[] = [
  {
    id: 1,
    date: '2024-05-20',
    title: '2024년 3분기 숙련기능인력(E-7-4) 선발 계획 공고',
    content: '법무부는 산업현장의 인력난 해소를 위해 2024년도 3분기 숙련기능인력 점수제 선발을 실시합니다...'
  },
  {
    id: 2,
    date: '2024-05-15',
    title: '외국인 등록증 발급 수수료 인상 안내',
    content: '오는 6월 1일부터 외국인 등록증 발급 및 재발급 수수료가 기존 3만원에서 4만원으로 인상됩니다.'
  },
  {
    id: 3,
    date: '2024-05-10',
    title: '여름 휴가철 출입국 심사 간소화 서비스 시행',
    content: '인천국제공항 이용객 편의를 위해 자동출입국심사 등록 연령이 하향 조정됩니다.'
  }
];

export const COMPANY_INFO = {
  address: '서울시 강남구 강남대로 156길 12, 4층(신사동, 다복빌딩)',
  email: 'ai.jinpd@gmail.com',
  phone: '070-4090-7942'
};