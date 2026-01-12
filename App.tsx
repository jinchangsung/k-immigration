import React, { useState } from 'react';
import TopBar from './components/TopBar';
import Navigation from './components/Navigation';
import ImageCarousel from './components/ImageCarousel';
import NewsSection from './components/NewsSection';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';
import ConsultationModal from './components/ConsultationModal';
import AdminDashboard from './components/AdminDashboard';
import AdminLoginModal from './components/AdminLoginModal';
import ServiceDetail from './components/ServiceDetail';
import MyPageModal from './components/MyPageModal'; 
import InfoModal from './components/InfoModal';
import LocationModal from './components/LocationModal';
import OnlineApplicationModal from './components/OnlineApplicationModal'; // New Import
import { FileText, UserCheck, Plane, Shield, Globe, Users, HelpCircle, Briefcase } from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Main Menu Cards Component (Part of the Body)
const ServiceCards = ({ onServiceClick, onConsultClick }: { onServiceClick: (id: string, title: string) => void, onConsultClick: () => void }) => {
    const { t } = useLanguage();
    
    // Using IDs that match what we set in dbService/types for CMS mapping
    const services = [
        { id: 'visa', title: t.menu.visa, icon: FileText, desc: t.services.visaDesc },
        { id: 'stay', title: t.menu.stay, icon: UserCheck, desc: t.services.stayDesc },
        { id: 'immigration', title: t.menu.immigration, icon: Plane, desc: t.services.immDesc },
        { id: 'refugee', title: t.menu.refugee, icon: Shield, desc: t.services.refugeeDesc },
        { id: 'nationality', title: t.menu.nationality, icon: Globe, desc: t.services.nationDesc },
        { id: 'registration', title: t.menu.registration, icon: Users, desc: t.services.regDesc },
        { id: 'etc', title: t.menu.etc, icon: HelpCircle, desc: t.services.etcDesc },
        { id: 'expert', title: t.menu.expert, icon: Briefcase, desc: t.services.expertDesc, highlight: true, action: onConsultClick },
    ];

    return (
        <section className="py-20 -mt-10 relative z-20">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {services.map((service, index) => (
                        <div 
                            key={index}
                            onClick={() => service.action ? service.action() : onServiceClick(service.id, service.title)}
                            className={`
                                group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 cursor-pointer
                                flex flex-col items-center text-center gap-4
                                ${service.highlight 
                                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30 ring-4 ring-blue-600/20' 
                                    : 'bg-white text-slate-700 shadow-lg hover:shadow-xl border border-slate-100'
                                }
                            `}
                        >
                            <div className={`
                                w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-2 transition-transform group-hover:scale-110
                                ${service.highlight ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}
                            `}>
                                <service.icon size={28} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">{service.title}</h3>
                                <p className={`text-xs ${service.highlight ? 'text-blue-100' : 'text-slate-400'}`}>
                                    {service.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// Wrapper component to use context
const AppContent: React.FC = () => {
    const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
    const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
    const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
    const [isMyPageOpen, setIsMyPageOpen] = useState(false); 
    const [isOnlineAppOpen, setIsOnlineAppOpen] = useState(false); // New State
    
    // Page Modals
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [activePageId, setActivePageId] = useState('');
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

    // Navigation State
    const [activeService, setActiveService] = useState<{id: string, title: string} | null>(null);
    const [activeSubMenuId, setActiveSubMenuId] = useState<string | null>(null);
    const [activeServiceType, setActiveServiceType] = useState<string>(''); // For pre-filling modal
    
    const { t } = useLanguage();
    const { user } = useAuth(); // To check login status for online app

    const openConsult = (serviceType?: string) => {
        setActiveServiceType(serviceType || '');
        setIsConsultModalOpen(true);
    };

    const handleServiceClick = (id: string, title: string) => {
        setActiveService({ id, title });
        setActiveSubMenuId(null); // Reset sub-menu when clicking main card
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubMenuClick = (serviceId: string, subMenuId: string) => {
        setActiveService({ id: serviceId, title: '' }); 
        setActiveSubMenuId(subMenuId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBackToList = () => {
        setActiveService(null);
        setActiveSubMenuId(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAdminLoginSuccess = () => {
        setIsAdminDashboardOpen(true);
    };

    const handleFooterPageClick = (pageId: string) => {
        if (pageId === 'location') {
            setIsLocationModalOpen(true);
        } else {
            setActivePageId(pageId);
            setIsInfoModalOpen(true);
        }
    };

    const handleOnlineAppClick = () => {
        if (!user) {
            alert('로그인이 필요한 서비스입니다.');
            return;
        }
        setIsOnlineAppOpen(true);
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <TopBar onOpenMyPage={() => setIsMyPageOpen(true)} />
            <Navigation 
                onConsultClick={() => openConsult()} 
                onLogoClick={handleBackToList} 
                onSubMenuClick={handleSubMenuClick}
                onOnlineApplicationClick={handleOnlineAppClick} // Link
            />
            
            <main className="flex-grow">
                {activeService ? (
                    <ServiceDetail 
                        serviceId={activeService.id}
                        serviceTitle={activeService.title} // Will be updated inside ServiceDetail based on ID if empty
                        subMenuId={activeSubMenuId}
                        onApply={(title) => openConsult(title)}
                        onBack={handleBackToList}
                        onSubMenuSelect={(subMenuId) => handleSubMenuClick(activeService.id, subMenuId)}
                    />
                ) : (
                    <>
                        <ImageCarousel />
                        <ServiceCards onServiceClick={handleServiceClick} onConsultClick={() => openConsult('전문가 상담')} />
                        <NewsSection />
                        
                        {/* Additional Info Section */}
                        <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
                            <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                                <h2 className="text-3xl font-bold mb-6">{t.hero.title2}</h2>
                                <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
                                    {t.hero.desc}
                                </p>
                                <button 
                                    onClick={() => openConsult('Footer Promotion')}
                                    className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition-colors"
                                >
                                    {t.consultation.submit}
                                </button>
                            </div>
                        </section>
                    </>
                )}
            </main>

            <Footer 
                onAdminClick={() => setIsAdminLoginOpen(true)} 
                onPageClick={handleFooterPageClick}
            />
            <ChatBot />
            
            <ConsultationModal 
                isOpen={isConsultModalOpen} 
                onClose={() => setIsConsultModalOpen(false)} 
                serviceType={activeServiceType}
            />
            
            <AdminLoginModal 
                isOpen={isAdminLoginOpen}
                onClose={() => setIsAdminLoginOpen(false)}
                onLoginSuccess={handleAdminLoginSuccess}
            />

            <AdminDashboard 
                isOpen={isAdminDashboardOpen} 
                onClose={() => setIsAdminDashboardOpen(false)} 
            />

            <MyPageModal
                isOpen={isMyPageOpen}
                onClose={() => setIsMyPageOpen(false)}
            />

            <OnlineApplicationModal 
                isOpen={isOnlineAppOpen} 
                onClose={() => setIsOnlineAppOpen(false)} 
            />

            <InfoModal 
                isOpen={isInfoModalOpen}
                onClose={() => setIsInfoModalOpen(false)}
                pageId={activePageId}
            />

            <LocationModal
                isOpen={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
            />
        </div>
    );
}

const App: React.FC = () => {
  return (
    <LanguageProvider>
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    </LanguageProvider>
  );
};

export default App;