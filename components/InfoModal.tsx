import React, { useEffect, useState } from 'react';
import { X, ChevronDown, HelpCircle } from 'lucide-react';
import { dbService } from '../services/dbService';
import { PageContent, FAQItem } from '../types';

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    pageId: string;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, pageId }) => {
    const [pageContent, setPageContent] = useState<PageContent | null>(null);
    const [faqList, setFaqList] = useState<FAQItem[]>([]);

    useEffect(() => {
        if (isOpen && pageId) {
            if (pageId === 'faq') {
                const faqs = dbService.getFAQs();
                setFaqList(faqs);
                setPageContent({ id: 'faq', title: '자주하는 질문', content: '' });
            } else {
                const data = dbService.getPageContent(pageId);
                setPageContent(data);
                setFaqList([]);
            }
        }
    }, [isOpen, pageId]);

    if (!isOpen || !pageContent) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-slate-900 p-6 flex justify-between items-center text-white shrink-0 rounded-t-2xl">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        {pageId === 'faq' && <HelpCircle size={24} className="text-blue-400" />}
                        {pageContent.title || '안내'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                    {pageId === 'faq' ? (
                        <div className="space-y-4">
                            {faqList.length === 0 ? (
                                <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                                    등록된 질문이 없습니다.
                                </div>
                            ) : (
                                faqList.map((faq) => (
                                    <details key={faq.id} className="group bg-white rounded-xl border border-slate-200 overflow-hidden open:ring-2 open:ring-blue-100 open:border-blue-300 transition-all">
                                        <summary className="flex items-center justify-between p-5 cursor-pointer list-none hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">Q</div>
                                                <h4 className="font-bold text-slate-800 text-lg">{faq.question}</h4>
                                            </div>
                                            <ChevronDown className="text-slate-400 group-open:rotate-180 transition-transform" />
                                        </summary>
                                        <div className="p-5 pt-0 pl-[4.5rem] text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                                            <div className="dynamic-content" dangerouslySetInnerHTML={{ __html: faq.answer }} />
                                        </div>
                                    </details>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="prose prose-sm max-w-none dynamic-content bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                             <div dangerouslySetInnerHTML={{ __html: pageContent.content }} />
                        </div>
                    )}
                </div>
                
                <div className="p-4 border-t border-slate-200 bg-white rounded-b-2xl flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InfoModal;