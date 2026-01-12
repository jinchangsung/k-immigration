import React from 'react';
import { COMPANY_INFO } from '../constants';
import { Mail, MapPin, Phone, Globe, Lock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface FooterProps {
    onAdminClick: () => void;
    onPageClick: (pageId: string) => void; // New prop
}

const Footer: React.FC<FooterProps> = ({ onAdminClick, onPageClick }) => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4 text-white">
                <Globe className="text-blue-500" />
                <span className="text-xl font-bold">{t.siteTitle}</span>
            </div>
            <p className="text-sm text-slate-400 mb-6 max-w-sm">
                {t.footer.desc}
            </p>
          </div>
          
          <div>
            <h5 className="text-white font-bold mb-4">{t.footer.contact}</h5>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <button onClick={() => onPageClick('location')} className="flex items-start gap-3 hover:text-white text-left">
                     <MapPin size={18} className="text-blue-500 shrink-0 mt-0.5" />
                     <span>{COMPANY_INFO.address} (오시는 길)</span>
                </button>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-blue-500 shrink-0" />
                <span>{COMPANY_INFO.phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-blue-500 shrink-0" />
                <span>{COMPANY_INFO.email}</span>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold mb-4">{t.footer.links}</h5>
            <ul className="space-y-2 text-sm">
                <li><button onClick={() => onPageClick('terms')} className="hover:text-white transition-colors">{t.footer.terms}</button></li>
                <li><button onClick={() => onPageClick('privacy')} className="hover:text-white transition-colors">{t.footer.privacy}</button></li>
                <li><button onClick={() => onPageClick('intro')} className="hover:text-white transition-colors">법인소개</button></li>
                <li><button onClick={() => onPageClick('fees')} className="hover:text-white transition-colors">요금단가표</button></li>
                <li><button onClick={() => onPageClick('refund')} className="hover:text-white transition-colors">환불규정</button></li>
                <li><button onClick={() => onPageClick('faq')} className="hover:text-white transition-colors">자주하는 질문</button></li>
                <li className="pt-2">
                    <button onClick={onAdminClick} className="flex items-center gap-1 text-slate-600 hover:text-slate-400 text-xs">
                        <Lock size={10} /> Admin
                    </button>
                </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-8 text-center text-xs text-slate-500">
            &copy; {new Date().getFullYear()} {t.siteTitle} {t.subTitle}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;