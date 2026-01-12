import React from 'react';

export enum Language {
  KR = 'KR',
  CN = 'CN',
  EN = 'EN',
  RU = 'RU',
  VN = 'VN'
}

export interface NewsItem {
  id: number;
  date: string;
  title: string;
  content: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  startTime: string;
  lastMessage: string;
  messages: ChatMessage[];
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  provider: 'google';
  createdAt: string;
}

// 8 steps status
export type ProcessStatus = 
  | 'REQUESTED'       // 신청인: 대행신청
  | 'CONSULTING'      // 대행: 온라인 상담
  | 'FEE_NOTICE'      // 대행: 대행금액통보
  | 'PAYMENT'         // 신청인: 결제
  | 'DOC_PREP'        // 대행: 신청문서 작성
  | 'SUBMITTED'       // 대행: 접수
  | 'UNDER_REVIEW'    // 심사기관: 심사
  | 'COMPLETED';      // 대행: 결과

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  data: string; // Base64 string for demo purposes
  uploadedBy: 'user' | 'admin';
  createdAt: string;
}

export interface ConsultationRequest {
  id: string;
  serviceType?: string; // e.g., 'Visa', 'Stay'
  name: string;
  email: string;
  phone: string;
  passportNo: string;
  content: string; // User Inquiry
  createdAt: string;
  status?: 'pending' | 'completed'; // Legacy simple status
  processStatus: ProcessStatus; // New detailed status
  
  // Enhanced features
  attachments: Attachment[]; // Files uploaded by user or admin
  adminReply?: string; // Admin's answer
  paymentAmount?: number; // Set by admin
  paymentMethod?: 'BankTransfer' | 'VirtualAccount' | 'CreditCard' | 'PayPal';
  isPaid?: boolean;
}

// New Interface for Detailed Sub-menu Content
export interface SubMenuContent {
  id: string; // Unique ID for the submenu
  title: string; // The display name in the menu
  description?: string; // Short description displayed below title
  target: string;
  documents: string;
  documentOptions?: { label: string; value: string; content: string }[];
  reference: string;
  contentBody?: string; // New: Main content area (supports HTML tables)
  procedure: string;
}

export interface ServiceContent {
  id: string; // e.g., 'visa', 'stay'
  target: string;
  documents: string; // HTML or Markdown content
  documentOptions?: { label: string; value: string; content: string }[]; // For the select box logic
  reference: string;
  contentBody?: string; // New: Main content area for root service
  procedure: string;
  subMenus: SubMenuContent[]; // Now holds full objects, not just strings
}

// New: Static Page Content (Terms, Privacy, etc.)
export interface PageContent {
    id: string; // e.g., 'terms', 'privacy', 'intro', 'fees', 'refund', 'faq'
    title: string;
    content: string; // HTML content
}

// New: FAQ Item Structure
export interface FAQItem {
    id: string;
    question: string;
    answer: string; // HTML Content
}

export interface AdminUser {
  email: string;
  password: string; // In a real app, this should be hashed
  isApproved: boolean;
  isSuperAdmin: boolean;
  createdAt: string;
}