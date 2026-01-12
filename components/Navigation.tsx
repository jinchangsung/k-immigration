import React, { useState, useEffect } from 'react';
import { Menu, X, Plane, FileText, Users, Globe, UserCheck, Shield, HelpCircle, Briefcase, ChevronDown, LayoutDashboard } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { dbService } from '../services/dbService';
import { SubMenuContent } from '../types';

interface NavigationProps {
  onConsultClick: () => void;
  onLogoClick?: () => void;
  onSubMenuClick?: (serviceId: string, subMenuId: string) => void;
  onOnlineApplicationClick?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onConsultClick, onLogoClick, onSubMenuClick, onOnlineApplicationClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [serviceSubMenus, setServiceSubMenus] = useState<Record<string, SubMenuContent[]>>({});
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    const loadSubMenus = () => {
        const ids = ['visa', 'stay', 'immigration', 'refugee', 'nationality', 'registration', 'etc'];
        const subMenuMap: Record<string, SubMenuContent[]> = {};
        
        ids.forEach(id => {
            const content = dbService.getServiceContent(id);
            if (content.subMenus && content.subMenus.length > 0) {
                subMenuMap[id] = content.subMenus;
            }
        });
        setServiceSubMenus(subMenuMap);
    };
    
    loadSubMenus();
    window.addEventListener('kim-content-updated', loadSubMenus);

    return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('kim-content-updated', loadSubMenus);
    };
  }, []);

  const menuItems = [
    { id: 'visa', label: t.menu.visa, icon: FileText, href: '#visa' },
    { id: 'stay', label: t.menu.stay, icon: UserCheck, href: '#stay' },
    { id: 'immigration', label: t.menu.immigration, icon: Plane, href: '#immigration' },
    { id: 'refugee', label: t.menu.refugee, icon: Shield, href: '#refugee' },
    { id: 'nationality', label: t.menu.nationality, icon: Globe, href: '#nationality' },
    { id: 'registration', label: t.menu.registration, icon: Users, href: '#registration' },
    { id: 'etc', label: t.menu.etc, icon: HelpCircle, href: '#etc' },
    { id: 'expert', label: t.menu.expert, icon: Briefcase, href: '#expert', highlight: true, action: onConsultClick },
  ];

  return (
    <header className={`sticky top-0 z-40 w-full transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-lg py-2' : 'bg-white py-4 shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        {/* Left Side: Logo & Online Application Button */}
        <div className="flex items-center gap-4 lg:gap-8">
            {/* Logo */}
            <div 
                className="flex items-center gap-2 cursor-pointer group" 
                onClick={() => {
                    if (onLogoClick) onLogoClick();
                    window.scrollTo({top: 0, behavior: 'smooth'});
                }}
            >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-lg shadow-lg flex items-center justify-center transform group-hover:rotate-6 transition-transform">
                    <Globe className="text-white" size={24} />
                </div>
                <div className="hidden sm:block">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-900 tracking-tight">{t.siteTitle}</h1>
                    <p className="text-[10px] text-slate-500 font-medium tracking-widest">{t.subTitle}</p>
                </div>
            </div>

            {/* Online Application Button (Desktop/Tablet) */}
            <button
                onClick={onOnlineApplicationClick}
                className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-full hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
                <LayoutDashboard size={18} />
                온라인 진행업무
            </button>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden lg:flex items-center gap-2">
          {menuItems.map((item, idx) => {
             const hasSubMenus = serviceSubMenus[item.id] && serviceSubMenus[item.id].length > 0;
             
             return (
                <div 
                    key={idx} 
                    className="relative group"
                    onMouseEnter={() => hasSubMenus && setActiveDropdown(item.id)}
                    onMouseLeave={() => setActiveDropdown(null)}
                >
                    <a
                        href={item.action ? '#' : item.href}
                        onClick={(e) => {
                            if (item.action) {
                                e.preventDefault();
                                item.action();
                            }
                        }}
                        className={`text-sm font-medium transition-all px-3 py-2 rounded-lg flex items-center gap-1 ${
                            item.highlight 
                            ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg' 
                            : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                    >
                        {item.label}
                        {!item.highlight && hasSubMenus && <ChevronDown size={14} className="opacity-50" />}
                    </a>

                    {/* Desktop Dropdown */}
                    {!item.highlight && hasSubMenus && (
                        <div className={`absolute left-0 top-full pt-2 w-64 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50`}>
                            <div className="bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden py-2">
                                {serviceSubMenus[item.id].map((subItem, subIdx) => (
                                    <button 
                                        key={subIdx} 
                                        onClick={() => {
                                            if (onSubMenuClick) onSubMenuClick(item.id, subItem.id);
                                        }}
                                        className="w-full text-left block px-4 py-2 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors truncate"
                                    >
                                        {subItem.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
          })}
        </nav>

        {/* Mobile Menu Button */}
        <button 
            className="lg:hidden text-slate-700 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-slate-100 py-4 px-4 flex flex-col gap-2 animate-in slide-in-from-top-2 max-h-[85vh] overflow-y-auto">
            {/* Mobile Online Application Button */}
            <button
                onClick={() => {
                    if(onOnlineApplicationClick) onOnlineApplicationClick();
                    setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl mb-4 shadow-md"
            >
                <LayoutDashboard size={20} /> 온라인 진행업무 (신청/조회)
            </button>

            {menuItems.map((item, idx) => {
                const hasSubMenus = serviceSubMenus[item.id] && serviceSubMenus[item.id].length > 0;
                const isExpanded = activeDropdown === item.id;

                return (
                    <div key={idx} className="border-b border-slate-50 last:border-none pb-2 last:pb-0">
                        <div className="flex items-center justify-between">
                            <a
                                href={item.action ? '#' : item.href}
                                className={`flex items-center gap-3 p-3 rounded-lg flex-1 ${item.highlight ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-700 font-medium'}`}
                                onClick={(e) => {
                                    if (item.action) {
                                        e.preventDefault();
                                        item.action();
                                        setMobileMenuOpen(false);
                                    } else if (!hasSubMenus) {
                                        setMobileMenuOpen(false);
                                    }
                                }}
                            >
                                <item.icon size={20} className={item.highlight ? "text-blue-600" : "text-slate-400"} />
                                {item.label}
                            </a>
                            {hasSubMenus && (
                                <button 
                                    onClick={() => setActiveDropdown(isExpanded ? null : item.id)}
                                    className="p-3 text-slate-400"
                                >
                                    <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>
                            )}
                        </div>

                        {/* Mobile Submenu Accordion */}
                        {hasSubMenus && isExpanded && (
                            <div className="bg-slate-50 rounded-lg ml-10 mb-2 p-2 space-y-1">
                                {serviceSubMenus[item.id].map((subItem, subIdx) => (
                                    <button 
                                        key={subIdx}
                                        onClick={() => {
                                            if (onSubMenuClick) onSubMenuClick(item.id, subItem.id);
                                            setMobileMenuOpen(false);
                                        }}
                                        className="block w-full text-left px-3 py-2.5 text-sm text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                                    >
                                        • {subItem.title}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
      )}
    </header>
  );
};

export default Navigation;