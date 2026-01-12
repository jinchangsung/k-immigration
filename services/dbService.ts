import { ConsultationRequest, ServiceContent, NewsItem, ChatSession, ChatMessage, User, AdminUser, SubMenuContent, ProcessStatus, PageContent, FAQItem, Attachment } from '../types';
import { NEWS_DATA } from '../constants'; // Fallback data

const DB_CONSULT_KEY = 'kim_consultations';
const DB_CONTENT_KEY = 'kim_service_contents';
const DB_PAGES_KEY = 'kim_pages'; // New Key for static pages
const DB_FAQ_KEY = 'kim_faqs'; // New Key for FAQs
const DB_NEWS_KEY = 'kim_news';
const DB_CHAT_KEY = 'kim_chat_sessions';
const DB_USER_KEY = 'kim_users';
const DB_ADMIN_KEY = 'kim_admins';

// Helper to create empty sub-menu content
const createSubMenu = (title: string): SubMenuContent => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    title,
    description: '',
    target: '',
    documents: '',
    reference: '',
    contentBody: '',
    procedure: '신청인(대행신청) -> 대행(온라인 상담) -> 대행(대행금액통보) -> 신청인(결제) -> 대행(신청문서 작성) -> 대행(접수) -> 심사기관(심사) -> 대행(결과)'
});

// Initial Mock Data for Visa
const INITIAL_VISA_CONTENT: ServiceContent = {
  id: 'visa',
  target: '대한민국정부가 접수한 외국정부의 외교사절단이나 영사기관의 구성원, 조약 또는 국제관행에 따라 외교사절과 동등한 특권과 면제를 받는 자와 그 가족',
  documents: `- 사증발급신청서 (별지 제17호 서식)\n- 여권\n- 표준규격사진 1매\n- 파견, 재직을 증명하는 서류\n- 가족관계 입증서류`,
  documentOptions: [
    { label: '외교(A-1)', value: 'A-1', content: '- 사증발급신청서 (별지 제17호 서식)\n- 여권\n- 표준규격사진 1매\n- 파견, 재직을 증명하는 서류\n- 가족관계 입증서류' },
    { label: '공무(A-2)', value: 'A-2', content: '- 사증발급신청서\n- 관용여권\n- 공무수행 입증 서류' },
    { label: '협정(A-3)', value: 'A-3', content: '- 사증발급신청서\n- 여권\n- 협정 관련 입증 서류' }
  ],
  reference: `※ 첨부서류 안내\n① 사증발급신청서 (별지 제17호 서식), 여권, 표준규격사진 1매, 수수료\n② 파견, 재직을 증명하는 서류 또는 해당국 외교부장관의 협조공한(신분증명서의 제시 등에 대하여 해당 신분임이 확인되는 때에는 구술서로 갈음할 수 있음)\n③ 외국정부의 외교사절단이나 영사기관의 구성원의 동반가족에 경우에는 본국에서 발급한 가족관계증명서, 출생증명서 등 가족관계 입증서류`,
  procedure: '',
  subMenus: [
      { 
        ...createSubMenu('사증(VISA)발급 : 코드 A,B'), 
        description: 'A 또는 B로 시작하는 체류 자격 코드에 대한 사증(VISA)발급을 신청하실 수 있습니다.',
        target: '코드 A, B 비자 발급 대상자',
        reference: '사증 유형을 선택해주세요',
        documentOptions: [
            { label: '외교(A-1)', value: 'A-1', content: '외교(A-1) 필요 서류 목록...' },
            { label: '공무(A-2)', value: 'A-2', content: '공무(A-2) 필요 서류 목록...' },
            { label: '협정(A-3)', value: 'A-3', content: '협정(A-3) 필요 서류 목록...' },
            { label: '사증면제(B-1)', value: 'B-1', content: '사증면제(B-1) 필요 서류 목록...' },
            { label: '관광통과(B-2)', value: 'B-2', content: '관광통과(B-2) 필요 서류 목록...' }
        ],
        contentBody: `
<table>
  <thead>
    <tr>
      <th>세부 약호</th>
      <th>구분</th>
      <th>대상</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>A-1</td>
      <td>외교</td>
      <td>외교사절단 및 영사기관 구성원</td>
    </tr>
    <tr>
      <td>A-2</td>
      <td>공무</td>
      <td>대한민국 정부/국제기구 공무 수행자</td>
    </tr>
  </tbody>
</table>`
      },
      { ...createSubMenu('사증(VISA)발급 : 코드 C'), target: '코드 C 비자 발급 대상자' },
      { ...createSubMenu('사증(VISA)발급 : 코드 D') },
      { ...createSubMenu('사증(VISA)발급 : 코드 E') },
      { ...createSubMenu('사증(VISA)발급 : 코드 F') },
      { ...createSubMenu('사증(VISA)발급 : 코드 G, H') },
  ]
};

// Simulate MongoDB connection and interactions
export const dbService = {
  // --- Consultation / Application ---
  saveConsultation: async (data: Omit<ConsultationRequest, 'id' | 'createdAt' | 'processStatus' | 'attachments'>): Promise<ConsultationRequest> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newRecord: ConsultationRequest = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'pending',
      processStatus: 'REQUESTED', // Default status
      attachments: [],
      isPaid: false
    };
    const existing = dbService.getAllConsultations();
    const updated = [newRecord, ...existing];
    localStorage.setItem(DB_CONSULT_KEY, JSON.stringify(updated));
    return newRecord;
  },

  getAllConsultations: (): ConsultationRequest[] => {
    const data = localStorage.getItem(DB_CONSULT_KEY);
    return data ? JSON.parse(data) : [];
  },

  getConsultationsByEmail: (email: string): ConsultationRequest[] => {
    const all = dbService.getAllConsultations();
    // Case insensitive comparison for safer matching
    return all.filter(c => c.email.toLowerCase() === email.toLowerCase());
  },

  updateConsultationStatus: async (id: string, newStatus: ProcessStatus): Promise<void> => {
    const all = dbService.getAllConsultations();
    const updated = all.map(c => c.id === id ? { ...c, processStatus: newStatus } : c);
    localStorage.setItem(DB_CONSULT_KEY, JSON.stringify(updated));
  },

  updateConsultationDetails: async (id: string, updates: Partial<ConsultationRequest>): Promise<ConsultationRequest | null> => {
      const all = dbService.getAllConsultations();
      let updatedRecord: ConsultationRequest | null = null;
      const updatedList = all.map(c => {
          if (c.id === id) {
              updatedRecord = { ...c, ...updates };
              return updatedRecord;
          }
          return c;
      });
      
      if (updatedRecord) {
          localStorage.setItem(DB_CONSULT_KEY, JSON.stringify(updatedList));
      }
      return updatedRecord;
  },

  deleteConsultation: async (id: string): Promise<void> => {
      const all = dbService.getAllConsultations();
      const updated = all.filter(c => c.id !== id);
      localStorage.setItem(DB_CONSULT_KEY, JSON.stringify(updated));
  },

  // --- Service Content (CMS) ---
  getServiceContent: (serviceId: string): ServiceContent => {
    const data = localStorage.getItem(DB_CONTENT_KEY);
    const contents = data ? JSON.parse(data) : {};
    
    // Return saved content or default/empty structure
    if (contents[serviceId]) {
      // Data migration: Ensure subMenus is an array of objects
      if (!contents[serviceId].subMenus) {
          contents[serviceId].subMenus = [];
      } else if (contents[serviceId].subMenus.length > 0 && typeof contents[serviceId].subMenus[0] === 'string') {
          contents[serviceId].subMenus = contents[serviceId].subMenus.map((title: string) => createSubMenu(title));
      }
      return contents[serviceId];
    }
    
    // Return mock data for Visa, empty for others to start
    if (serviceId === 'visa') return INITIAL_VISA_CONTENT;

    return {
      id: serviceId,
      target: '',
      documents: '',
      reference: '',
      contentBody: '',
      procedure: '',
      subMenus: []
    };
  },

  saveServiceContent: async (content: ServiceContent): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = localStorage.getItem(DB_CONTENT_KEY);
    const contents = data ? JSON.parse(data) : {};
    
    contents[content.id] = content;
    localStorage.setItem(DB_CONTENT_KEY, JSON.stringify(contents));
    console.log(`Content saved for ${content.id}`);
    
    // Notify Navigation to update immediately
    window.dispatchEvent(new Event('kim-content-updated'));
  },

  // --- Static Pages (Terms, Privacy, etc.) ---
  getPageContent: (pageId: string): PageContent => {
    const data = localStorage.getItem(DB_PAGES_KEY);
    const pages = data ? JSON.parse(data) : {};
    
    if (pages[pageId]) {
        return pages[pageId];
    }
    
    // Default Empty Content
    return {
        id: pageId,
        title: '',
        content: '<p>내용이 등록되지 않았습니다.</p>'
    };
  },

  savePageContent: async (page: PageContent): Promise<void> => {
    const data = localStorage.getItem(DB_PAGES_KEY);
    const pages = data ? JSON.parse(data) : {};
    pages[page.id] = page;
    localStorage.setItem(DB_PAGES_KEY, JSON.stringify(pages));
  },

  // --- FAQ Management ---
  getFAQs: (): FAQItem[] => {
      const data = localStorage.getItem(DB_FAQ_KEY);
      return data ? JSON.parse(data) : [];
  },

  saveFAQs: async (faqs: FAQItem[]): Promise<void> => {
      localStorage.setItem(DB_FAQ_KEY, JSON.stringify(faqs));
  },

  // --- News Management ---
  getNews: (): NewsItem[] => {
    const data = localStorage.getItem(DB_NEWS_KEY);
    if (!data) {
        localStorage.setItem(DB_NEWS_KEY, JSON.stringify(NEWS_DATA));
        return NEWS_DATA;
    }
    return JSON.parse(data);
  },

  addNews: async (news: Omit<NewsItem, 'id'>): Promise<NewsItem> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const currentNews = dbService.getNews();
    const newId = currentNews.length > 0 ? Math.max(...currentNews.map(n => n.id)) + 1 : 1;
    
    const newNewsItem: NewsItem = {
        id: newId,
        ...news
    };
    const updatedNews = [newNewsItem, ...currentNews];
    localStorage.setItem(DB_NEWS_KEY, JSON.stringify(updatedNews));
    return newNewsItem;
  },

  deleteNews: async (id: number): Promise<void> => {
      const currentNews = dbService.getNews();
      const updatedNews = currentNews.filter(n => n.id !== id);
      localStorage.setItem(DB_NEWS_KEY, JSON.stringify(updatedNews));
  },

  // --- Chat Session Management ---
  saveChatSession: async (session: ChatSession): Promise<void> => {
      const data = localStorage.getItem(DB_CHAT_KEY);
      let sessions: ChatSession[] = data ? JSON.parse(data) : [];
      
      const existingIdx = sessions.findIndex(s => s.id === session.id);
      if (existingIdx >= 0) {
          sessions[existingIdx] = session;
      } else {
          sessions.unshift(session); // Newest first
      }
      
      localStorage.setItem(DB_CHAT_KEY, JSON.stringify(sessions));
  },

  getAllChatSessions: (): ChatSession[] => {
      const data = localStorage.getItem(DB_CHAT_KEY);
      return data ? JSON.parse(data) : [];
  },

  // --- User Management ---
  saveUser: async (user: User): Promise<void> => {
      const data = localStorage.getItem(DB_USER_KEY);
      let users: User[] = data ? JSON.parse(data) : [];
      
      // Check if user exists
      const exists = users.find(u => u.email === user.email);
      if (!exists) {
          users.push(user);
          localStorage.setItem(DB_USER_KEY, JSON.stringify(users));
      }
  },

  getAllUsers: (): User[] => {
      const data = localStorage.getItem(DB_USER_KEY);
      return data ? JSON.parse(data) : [];
  },

  // --- Admin Management ---
  initializeAdmins: () => {
      const data = localStorage.getItem(DB_ADMIN_KEY);
      let admins: AdminUser[] = data ? JSON.parse(data) : [];
      
      // Check if super admin exists
      const superAdminEmail = 'ai.jinpd@gmail.com';
      if (!admins.find(a => a.email === superAdminEmail)) {
          const superAdmin: AdminUser = {
              email: superAdminEmail,
              password: 'jinpd6969', // Hardcoded as per request
              isApproved: true,
              isSuperAdmin: true,
              createdAt: new Date().toISOString()
          };
          admins.push(superAdmin);
          localStorage.setItem(DB_ADMIN_KEY, JSON.stringify(admins));
      }
  },

  getAdmins: (): AdminUser[] => {
      dbService.initializeAdmins(); // Ensure super admin exists
      const data = localStorage.getItem(DB_ADMIN_KEY);
      return data ? JSON.parse(data) : [];
  },

  verifyAdmin: async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network
      dbService.initializeAdmins();
      
      const admins = dbService.getAdmins();
      const admin = admins.find(a => a.email === email && a.password === password);

      if (!admin) {
          return { success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' };
      }

      if (!admin.isApproved) {
          return { success: false, message: '관리자 승인 대기 중입니다. 승인 후 이용 가능합니다.' };
      }

      return { success: true, message: '로그인 성공' };
  },

  requestAdminAccess: async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      dbService.initializeAdmins();
      
      const admins = dbService.getAdmins();
      
      if (admins.find(a => a.email === email)) {
          return { success: false, message: '이미 등록된 이메일입니다.' };
      }

      const newAdmin: AdminUser = {
          email,
          password,
          isApproved: false,
          isSuperAdmin: false,
          createdAt: new Date().toISOString()
      };

      admins.push(newAdmin);
      localStorage.setItem(DB_ADMIN_KEY, JSON.stringify(admins));

      return { success: true, message: '관리자 권한 요청이 완료되었습니다. 승인을 기다려주세요.' };
  },

  approveAdmin: async (email: string): Promise<void> => {
      const admins = dbService.getAdmins();
      const updatedAdmins = admins.map(a => 
          a.email === email ? { ...a, isApproved: true } : a
      );
      localStorage.setItem(DB_ADMIN_KEY, JSON.stringify(updatedAdmins));
  },

  deleteAdmin: async (email: string): Promise<void> => {
      const admins = dbService.getAdmins();
      const adminToDelete = admins.find(a => a.email === email);
      
      if (adminToDelete?.isSuperAdmin) {
          throw new Error("슈퍼 관리자는 삭제할 수 없습니다.");
      }

      const updatedAdmins = admins.filter(a => a.email !== email);
      localStorage.setItem(DB_ADMIN_KEY, JSON.stringify(updatedAdmins));
  }
};