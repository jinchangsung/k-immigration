import React from 'react';
import { Phone, User as UserIcon, Globe, LogOut, LayoutDashboard } from 'lucide-react';
import { SUPPORTED_LANGUAGES, COMPANY_INFO } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../types';
import { useAuth } from '../contexts/AuthContext';

// Add prop for opening MyPage
interface TopBarProps {
    onOpenMyPage?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onOpenMyPage }) => {
  const { language, setLanguage, t } = useLanguage();
  const { user, loginWithGoogle, logout, loading } = useAuth();

  const getLangName = (lang: Language) => {
    switch(lang) {
      case Language.KR: return '한국어';
      case Language.CN: return '中文';
      case Language.EN: return 'English';
      case Language.RU: return 'Русский';
      case Language.VN: return 'Tiếng Việt';
      default: return lang;
    }
  };

  return (
    <div className="bg-slate-900 text-white py-2 text-xs md:text-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-4">
          
          {loading ? (
             <span className="flex items-center gap-1 text-slate-400">Loading...</span>
          ) : user ? (
            <div className="flex items-center gap-3">
                 <div className="flex items-center gap-1 text-blue-300 font-bold">
                    <UserIcon size={14} />
                    {user.displayName}님
                 </div>
                 
                 {onOpenMyPage && (
                    <button 
                        onClick={onOpenMyPage}
                        className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-[10px] text-white transition-colors border border-slate-700"
                    >
                        <LayoutDashboard size={10} />
                        My Page
                    </button>
                 )}

                 <span className="w-px h-3 bg-slate-700 mx-1"></span>

                 <button 
                    onClick={logout}
                    className="flex items-center gap-1 hover:text-red-300 transition-colors cursor-pointer"
                 >
                    <LogOut size={14} />
                    Logout
                 </button>
            </div>
          ) : (
            <button 
                onClick={loginWithGoogle}
                className="flex items-center gap-1 hover:text-blue-300 transition-colors cursor-pointer"
            >
                <UserIcon size={14} />
                {t.login}
            </button>
          )}

          <span className="hidden md:flex w-px h-3 bg-slate-700 mx-2"></span>

          <span className="flex items-center gap-1 text-slate-400">
            <Phone size={14} />
            {t.customerCenter}: {COMPANY_INFO.phone}
          </span>
        </div>
        
        <div className="flex items-center gap-2 relative group">
          <Globe size={14} className="text-blue-400" />
          <div className="flex gap-3">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`${
                  language === lang ? 'text-blue-400 font-bold' : 'text-slate-400'
                } hover:text-white transition-colors`}
              >
                {getLangName(lang)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;