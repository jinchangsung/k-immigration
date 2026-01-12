import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { translateText } from '../services/geminiService';
import { ServiceContent, Language, SubMenuContent } from '../types';
import { ArrowRight, User, MessageSquare, CreditCard, FileText, ChevronDown, List, DollarSign, FileInput, Landmark, CheckSquare } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import AutoTranslatedText from './AutoTranslatedText';

interface ServiceDetailProps {
  serviceId: string;
  serviceTitle: string;
  subMenuId?: string | null; // Receive subMenu ID
  onApply: (serviceName: string) => void;
  onBack: () => void;
  onSubMenuSelect: (subMenuId: string) => void; // Callback when a submenu card is clicked
}

const ServiceDetail: React.FC<ServiceDetailProps> = ({ serviceId, serviceTitle, subMenuId, onApply, onBack, onSubMenuSelect }) => {
  const [content, setContent] = useState<ServiceContent | null>(null);
  const [activeContent, setActiveContent] = useState<ServiceContent | SubMenuContent | null>(null);
  const [selectedDocOption, setSelectedDocOption] = useState<string>('');
  const [translatedOptions, setTranslatedOptions] = useState<{label: string, value: string}[]>([]);
  const { t, language } = useLanguage();

  useEffect(() => {
    const data = dbService.getServiceContent(serviceId);
    setContent(data);
    
    // Determine which content to show: Root or SubMenu
    let targetContent: ServiceContent | SubMenuContent = data;
    if (subMenuId && data.subMenus) {
        const sub = data.subMenus.find(s => s.id === subMenuId);
        if (sub) {
            targetContent = sub;
        }
    }
    setActiveContent(targetContent);

    if (targetContent.documentOptions && targetContent.documentOptions.length > 0) {
      setSelectedDocOption(targetContent.documentOptions[0].value);
    } else {
        setSelectedDocOption('');
    }
  }, [serviceId, subMenuId]);

  // Handle translation of Document Options Labels independently
  useEffect(() => {
    const translateOptions = async () => {
      if (!activeContent?.documentOptions) {
          setTranslatedOptions([]);
          return;
      }
      
      if (language === Language.KR) {
          // No need to translate
          setTranslatedOptions(activeContent.documentOptions.map(o => ({ label: o.label, value: o.value })));
          return;
      }

      const translated = await Promise.all(activeContent.documentOptions.map(async (opt) => {
          const translatedLabel = await translateText(opt.label, language);
          return { label: translatedLabel, value: opt.value };
      }));
      setTranslatedOptions(translated);
    };

    translateOptions();
  }, [activeContent, language]);

  if (!activeContent || !content) return <div className="p-20 text-center">Loading...</div>;

  // -- LOGIC: Show Sub Menu List if: No subMenuId selected AND subMenus exist --
  const shouldShowSubMenuList = !subMenuId && content.subMenus && content.subMenus.length > 0;

  if (shouldShowSubMenuList) {
      return (
        <div className="max-w-7xl mx-auto px-4 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold text-slate-800 border-l-4 border-blue-600 pl-4">
                        {serviceTitle}
                    </h2>
                </div>
                <button 
                    onClick={onBack}
                    className="text-slate-500 hover:text-slate-800 text-sm font-medium"
                >
                    ← Back to List
                </button>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl mb-8">
                <p className="text-blue-800 font-bold flex items-center gap-2">
                    <List size={20} />
                    <AutoTranslatedText text="원하시는 세부 항목을 선택해주세요." />
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {content.subMenus.map((sub) => (
                    <button 
                        key={sub.id}
                        onClick={() => onSubMenuSelect(sub.id)}
                        className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-blue-300 hover:-translate-y-1 transition-all text-left group"
                    >
                        <div className="flex justify-between items-center mb-2">
                             <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center text-slate-500 group-hover:text-blue-600 transition-colors">
                                <FileText size={20} />
                             </div>
                             <ArrowRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                        </div>
                        <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-700 transition-colors">
                            {sub.title}
                        </h3>
                    </button>
                ))}
            </div>
        </div>
      );
  }

  // -- LOGIC: Show Detail Content --

  const currentDocContent = activeContent.documentOptions?.find(opt => opt.value === selectedDocOption)?.content || activeContent.documents;
  
  // Use sub-menu title if available, otherwise main service title
  const displayTitle = (activeContent as SubMenuContent).title || serviceTitle;
  
  // Use sub-menu description if available
  const description = (activeContent as SubMenuContent).description;

  // Visual Steps Definition (8 steps split into 2 rows conceptually)
  const procedureSteps = [
    // Row 1
    { actor: '신청인', action: '대행신청', icon: User, color: 'text-blue-500' },
    { actor: '대행', action: '온라인 상담', icon: MessageSquare, color: 'text-slate-500' },
    { actor: '대행', action: '대행금액통보', icon: DollarSign, color: 'text-slate-500' },
    { actor: '신청인', action: '결제', icon: CreditCard, color: 'text-slate-500' },
    // Row 2
    { actor: '대행', action: '신청문서 작성', icon: FileText, color: 'text-blue-500' },
    { actor: '대행', action: '접수', icon: FileInput, color: 'text-slate-500' },
    { actor: '심사기관', action: '심사', icon: Landmark, color: 'text-slate-500' },
    { actor: '대행', action: '결과', icon: CheckSquare, color: 'text-slate-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center mb-8">
             <div className="flex flex-col">
                {subMenuId && <span className="text-sm text-slate-400 mb-1">{serviceTitle}</span>}
                <div className="pl-4 border-l-4 border-blue-600">
                     <h2 className="text-3xl font-bold text-slate-800 mb-2">
                        {displayTitle}
                    </h2>
                    {description && (
                        <p className="text-lg text-slate-600 font-medium leading-relaxed">
                             <AutoTranslatedText text={description} />
                        </p>
                    )}
                </div>
             </div>
             <button 
                onClick={onBack}
                className="text-slate-500 hover:text-slate-800 text-sm font-medium"
             >
                ← Back to List
             </button>
        </div>
      
      {/* Top Action Area */}
      <div className="flex justify-end mb-6">
        <button 
            onClick={() => onApply(displayTitle)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all hover:-translate-y-1 flex items-center gap-2"
        >
            <AutoTranslatedText text="신청하기" /> <ArrowRight size={18} />
        </button>
      </div>

      <div className="space-y-10">
        {/* 1. Target (대상) */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-700">
                    <AutoTranslatedText text="대상" />
                </h3>
            </div>
            <div className="p-6 text-slate-600 whitespace-pre-wrap leading-relaxed">
                <AutoTranslatedText text={activeContent.target || '등록된 내용이 없습니다.'} />
            </div>
        </section>

        {/* 2. Documents (첨부서류) */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-700">
                    <AutoTranslatedText text="첨부서류" />
                </h3>
            </div>
            <div className="p-6 space-y-4">
                {/* Select Box logic if options exist */}
                {activeContent.documentOptions && activeContent.documentOptions.length > 0 && (
                    <div className="w-full md:w-1/3 relative">
                        <select 
                            className="w-full appearance-none bg-white border border-slate-300 text-slate-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                            value={selectedDocOption}
                            onChange={(e) => setSelectedDocOption(e.target.value)}
                        >
                            {translatedOptions.length > 0 
                                ? translatedOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))
                                : activeContent.documentOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))
                            }
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                            <ChevronDown size={16} />
                        </div>
                    </div>
                )}
                
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-slate-600 whitespace-pre-wrap leading-relaxed">
                    <AutoTranslatedText text={currentDocContent || activeContent.documents || '등록된 내용이 없습니다.'} />
                </div>
            </div>
        </section>

        {/* 3. Reference (참고 설명) */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-700">
                    <AutoTranslatedText text="참고 설명" />
                </h3>
            </div>
            <div className="p-6 text-slate-600 text-sm whitespace-pre-wrap leading-relaxed bg-slate-50/50">
                <AutoTranslatedText text={activeContent.reference || '등록된 내용이 없습니다.'} />
            </div>
        </section>

        {/* 4. Content Body (내용) */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-700">
                    <AutoTranslatedText text="내용" />
                </h3>
            </div>
            <div className="p-6 text-slate-600 text-sm whitespace-pre-wrap leading-relaxed bg-slate-50/50">
                <div className="dynamic-content" dangerouslySetInnerHTML={{ __html: activeContent.contentBody || '등록된 내용이 없습니다.' }} />
            </div>
        </section>

        {/* 5. Procedure (절차) - 8 Steps Visualization */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-700">
                    <AutoTranslatedText text="절차" />
                </h3>
            </div>
            <div className="p-8">
                {/* Row 1 */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 relative mb-8">
                    {procedureSteps.slice(0, 4).map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center relative z-10 w-full md:w-1/4">
                             <div className="w-full bg-white border border-slate-200 rounded-lg p-4 flex flex-col items-center shadow-sm">
                                <div className="text-xs text-slate-400 mb-2 font-medium">
                                    <AutoTranslatedText text={step.actor} />
                                </div>
                                <step.icon size={32} className={`mb-3 ${step.color}`} />
                                <div className="text-sm font-bold text-slate-700 text-center">
                                    <AutoTranslatedText text={step.action} />
                                </div>
                             </div>
                            
                            {/* Arrow */}
                            {idx < 3 && (
                                <div className="hidden md:block absolute top-1/2 -right-[15%] text-slate-400">
                                    <ArrowRight size={20} />
                                </div>
                            )}
                             {idx < 3 && (
                                <div className="md:hidden text-slate-400 my-2 transform rotate-90">
                                    <ArrowRight size={20} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Info Text */}
                <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600 mb-8 border border-slate-100">
                    <p>• <AutoTranslatedText text="신청 후 상담을 통하여 추가 필요 서류와 대행 금액을 알려드립니다." /></p>
                    <p>• <AutoTranslatedText text="신청 후 마이페이지를 통하여 진행 절차를 확인하실 수 있습니다." /></p>
                </div>

                {/* Row 2 */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 relative">
                    {procedureSteps.slice(4, 8).map((step, idx) => (
                        <div key={idx + 4} className="flex flex-col items-center relative z-10 w-full md:w-1/4">
                             <div className="w-full bg-white border border-slate-200 rounded-lg p-4 flex flex-col items-center shadow-sm">
                                <div className="text-xs text-slate-400 mb-2 font-medium">
                                    <AutoTranslatedText text={step.actor} />
                                </div>
                                <step.icon size={32} className={`mb-3 ${step.color}`} />
                                <div className="text-sm font-bold text-slate-700 text-center">
                                    <AutoTranslatedText text={step.action} />
                                </div>
                             </div>
                            
                            {/* Arrow */}
                            {idx < 3 && (
                                <div className="hidden md:block absolute top-1/2 -right-[15%] text-slate-400">
                                    <ArrowRight size={20} />
                                </div>
                            )}
                             {idx < 3 && (
                                <div className="md:hidden text-slate-400 my-2 transform rotate-90">
                                    <ArrowRight size={20} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            
             <div className="flex justify-center pb-8">
                <button 
                    onClick={() => onApply(displayTitle)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-lg font-bold shadow-md transition-all hover:-translate-y-1"
                >
                    <AutoTranslatedText text="신청하기" />
                </button>
            </div>
        </section>
      </div>
    </div>
  );
};

export default ServiceDetail;