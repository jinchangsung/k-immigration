import React, { useEffect, useState } from 'react';
import { X, Upload, FileText, CheckCircle, Clock, CreditCard, Send, RefreshCw, Paperclip, AlertCircle, DollarSign, Download, Trash2, Plus, ChevronRight, LayoutDashboard, Search, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/dbService';
import { ConsultationRequest, ProcessStatus, Attachment } from '../types';

interface OnlineApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const STATUS_ORDER: ProcessStatus[] = [
    'REQUESTED', 'CONSULTING', 'FEE_NOTICE', 'PAYMENT',
    'DOC_PREP', 'SUBMITTED', 'UNDER_REVIEW', 'COMPLETED'
];

const SERVICE_CATEGORIES = [
    { id: 'visa', label: '비자 (Visa)' },
    { id: 'stay', label: '체류 (Stay)' },
    { id: 'immigration', label: '이민 (Immigration)' },
    { id: 'refugee', label: '난민 (Refugee)' },
    { id: 'nationality', label: '국적 (Nationality)' },
    { id: 'registration', label: '외국인등록' },
    { id: 'etc', label: '기타 민원' },
];

const OnlineApplicationModal: React.FC<OnlineApplicationModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [applications, setApplications] = useState<ConsultationRequest[]>([]);
    const [selectedApp, setSelectedApp] = useState<ConsultationRequest | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    
    // Create Form State
    const [newAppServiceId, setNewAppServiceId] = useState('visa');
    const [newAppProduct, setNewAppProduct] = useState('');
    const [newAppContent, setNewAppContent] = useState('');
    const [newAppSubMenus, setNewAppSubMenus] = useState<{id: string, title: string}[]>([]);
    // New: State for the 3rd Select Box (Document Options / Detailed Types)
    const [newAppDetailOption, setNewAppDetailOption] = useState('');
    const [availableDetailOptions, setAvailableDetailOptions] = useState<{label: string, value: string}[]>([]);

    const [uploading, setUploading] = useState(false);
    
    // Status visual steps
    const procedureSteps = ['대행신청', '상담', '금액통보', '결제', '문서작성', '접수', '심사', '결과'];

    useEffect(() => {
        if (isOpen && user) {
            loadApplications();
            // Reset state when opening modal to ensure List View is shown first on mobile
            if (window.innerWidth < 768) {
                setSelectedApp(null);
                setIsCreating(false);
            }
        }
    }, [isOpen, user]);

    // Effect: Load SubMenus when Category changes
    useEffect(() => {
        if (isCreating) {
            const content = dbService.getServiceContent(newAppServiceId);
            if (content && content.subMenus) {
                setNewAppSubMenus(content.subMenus.map(s => ({ id: s.id, title: s.title })));
                if (content.subMenus.length > 0) {
                    setNewAppProduct(content.subMenus[0].title);
                } else {
                    setNewAppProduct(SERVICE_CATEGORIES.find(c => c.id === newAppServiceId)?.label || '');
                }
            } else {
                setNewAppSubMenus([]);
                setNewAppProduct(SERVICE_CATEGORIES.find(c => c.id === newAppServiceId)?.label || '');
            }
        }
    }, [newAppServiceId, isCreating]);

    // Effect: Load Detail Options (3rd Step) when Product (2nd Step) changes
    useEffect(() => {
        if (isCreating && newAppProduct) {
            const content = dbService.getServiceContent(newAppServiceId);
            const selectedSubMenu = content.subMenus?.find(s => s.title === newAppProduct);
            
            if (selectedSubMenu && selectedSubMenu.documentOptions && selectedSubMenu.documentOptions.length > 0) {
                setAvailableDetailOptions(selectedSubMenu.documentOptions.map(opt => ({
                    label: opt.label,
                    value: opt.label // Use label for display value in creation
                })));
                setNewAppDetailOption(selectedSubMenu.documentOptions[0].label);
            } else {
                setAvailableDetailOptions([]);
                setNewAppDetailOption('');
            }
        }
    }, [newAppProduct, newAppServiceId, isCreating]);

    const loadApplications = () => {
        if (!user) return;
        const myApps = dbService.getConsultationsByEmail(user.email);
        setApplications(myApps);
        
        // Update selected app if it exists (for refreshes)
        if (selectedApp) {
            const fresh = myApps.find(a => a.id === selectedApp.id);
            if (fresh) setSelectedApp(fresh);
        }
    };

    const handleCreateApplication = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        // Combine Product + Detail Option if available
        const fullServiceType = newAppDetailOption 
            ? `${newAppProduct} (${newAppDetailOption})`
            : newAppProduct;

        const newRequest = await dbService.saveConsultation({
            serviceType: fullServiceType,
            name: user.displayName,
            email: user.email,
            phone: '', // Optional
            passportNo: '', // Optional
            content: newAppContent
        });

        alert('신청이 완료되었습니다. 상세 페이지에서 서류를 업로드해주세요.');
        setIsCreating(false);
        setNewAppContent('');
        loadApplications();
        setSelectedApp(newRequest); // Switch to the new app view
    };

    const handleDeleteApplication = async (appId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent clicking the card itself
        if (!confirm('정말 삭제하시겠습니까? 삭제된 내역은 복구할 수 없습니다.')) return;

        await dbService.deleteConsultation(appId);
        
        // Refresh List
        const myApps = dbService.getConsultationsByEmail(user!.email);
        setApplications(myApps);
        
        // If deleted app was selected, clear selection or select first
        if (selectedApp?.id === appId) {
            setSelectedApp(myApps.length > 0 ? myApps[0] : null);
            if (myApps.length === 0) setIsCreating(true);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedApp || !e.target.files || e.target.files.length === 0) return;
        
        const files: File[] = Array.from(e.target.files);
        const currentCount = selectedApp.attachments?.length || 0;
        
        if (currentCount + files.length > 10) {
            alert('파일은 최대 10개까지만 업로드 가능합니다.');
            return;
        }

        setUploading(true);
        
        // Convert to Base64 (Simulation for LocalStorage)
        const newAttachments: Attachment[] = [];
        
        for (const file of files) {
            if (file.size > 5 * 1024 * 1024) { // Limit 5MB
                alert(`파일 '${file.name}'이 너무 큽니다. (5MB 제한)`);
                continue;
            }

            const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });

            newAttachments.push({
                id: Date.now().toString() + Math.random().toString(),
                name: file.name,
                size: file.size,
                type: file.type,
                data: base64,
                uploadedBy: 'user',
                createdAt: new Date().toISOString()
            });
        }

        const updatedAttachments = [...(selectedApp.attachments || []), ...newAttachments];
        await dbService.updateConsultationDetails(selectedApp.id, { attachments: updatedAttachments });
        loadApplications();
        setUploading(false);
    };

    const handleDeleteFile = async (fileId: string) => {
        if(!selectedApp || !window.confirm('파일을 삭제하시겠습니까?')) return;
        const updatedAttachments = selectedApp.attachments.filter(a => a.id !== fileId);
        await dbService.updateConsultationDetails(selectedApp.id, { attachments: updatedAttachments });
        loadApplications();
    };

    const handlePayment = async (method: 'BankTransfer' | 'VirtualAccount' | 'CreditCard' | 'PayPal') => {
        if (!selectedApp) return;
        if (!confirm(`${method}로 결제를 진행하시겠습니까? (데모: 즉시 결제완료 처리됩니다)`)) return;

        await new Promise(resolve => setTimeout(resolve, 1000));
        
        let nextStatus = selectedApp.processStatus;
        if (selectedApp.processStatus === 'FEE_NOTICE' || selectedApp.processStatus === 'PAYMENT') {
            nextStatus = 'DOC_PREP'; 
        }

        await dbService.updateConsultationDetails(selectedApp.id, {
            paymentMethod: method,
            isPaid: true,
            processStatus: nextStatus
        });
        
        alert('결제가 완료되었습니다.');
        loadApplications();
    };

    const getStatusIndex = (status: ProcessStatus) => STATUS_ORDER.indexOf(status);

    if (!isOpen) return null;

    // View State Logic
    const isMobileDetailView = !!(selectedApp || isCreating);

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-0 md:p-4 bg-black/70 backdrop-blur-sm">
            {/* Modal Container: h-[100dvh] for mobile full height, rounded-none on mobile */}
            <div className="bg-white md:rounded-2xl w-full md:max-w-6xl h-[100dvh] md:h-[90vh] flex overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                
                {/* Left Sidebar: Application List */}
                {/* Mobile: Hidden if Detail Active. Desktop: Always Flex. */}
                <div className={`w-full md:w-80 bg-slate-50 border-r border-slate-200 shrink-0 ${isMobileDetailView ? 'hidden md:flex md:flex-col' : 'flex flex-col'}`}>
                    <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-white sticky top-0 z-10">
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            <LayoutDashboard className="text-indigo-600" />
                            업무 목록
                        </h3>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => { setIsCreating(true); setSelectedApp(null); }}
                                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-1 text-xs font-bold"
                                title="새 업무 신청"
                            >
                                <Plus size={14} /> 신청
                            </button>
                            <button onClick={onClose} className="md:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {applications.length === 0 ? (
                            <div className="text-center py-10 text-slate-400 text-sm flex flex-col items-center gap-2">
                                <Search size={24} className="opacity-20" />
                                <p>진행중인 내역이 없습니다.<br/>우측 상단 <b>[+ 신청]</b> 버튼을 눌러<br/>새로운 업무를 시작하세요.</p>
                            </div>
                        ) : (
                            applications.map(app => (
                                <button
                                    key={app.id}
                                    onClick={() => { setSelectedApp(app); setIsCreating(false); }}
                                    className={`w-full text-left p-4 rounded-xl border transition-all relative group ${
                                        selectedApp?.id === app.id && !isCreating
                                        ? 'bg-white border-indigo-500 shadow-md ring-1 ring-indigo-500 z-10' 
                                        : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-slate-800 text-sm truncate max-w-[180px] md:max-w-[120px]">{app.serviceType || '일반상담'}</span>
                                        {/* Delete Button */}
                                        <div 
                                            onClick={(e) => handleDeleteApplication(app.id, e)}
                                            className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition-all z-20"
                                            title="삭제"
                                        >
                                            <Trash2 size={14} />
                                        </div>
                                    </div>
                                    <div className="mb-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                            app.processStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {procedureSteps[getStatusIndex(app.processStatus)]}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate mb-2">{app.content}</p>
                                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                                        <div className="flex items-center gap-1">
                                            <Clock size={10} /> {new Date(app.createdAt).toLocaleDateString()}
                                        </div>
                                        {app.attachments.length > 0 && <div className="flex items-center gap-1"><Paperclip size={10}/> {app.attachments.length}</div>}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                {/* Mobile: Hidden if List Active (Detail Inactive). Desktop: Always Flex. */}
                <div className={`w-full md:flex-1 bg-white overflow-hidden ${isMobileDetailView ? 'flex flex-col' : 'hidden md:flex md:flex-col'}`}>
                    <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2">
                            {/* Mobile Back Button */}
                            <button 
                                onClick={() => { setSelectedApp(null); setIsCreating(false); }}
                                className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-full"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <h2 className="font-bold text-lg md:text-xl text-slate-800 flex items-center gap-2 truncate">
                                {isCreating ? <><Plus size={24} className="text-indigo-600 hidden md:block"/> 새로운 업무 신청</> : selectedApp ? <><FileText size={24} className="text-indigo-600 hidden md:block"/> 상세 내역 조회</> : '업무를 선택해주세요'}
                            </h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X size={24} className="text-slate-500" />
                        </button>
                    </div>

                    {isCreating ? (
                        /* CREATE NEW APPLICATION FORM */
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center bg-slate-50">
                            <div className="w-full max-w-2xl space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                <div className="text-center mb-4 md:mb-8">
                                    <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">어떤 업무를 도와드릴까요?</h3>
                                    <p className="text-sm md:text-base text-slate-500">원하시는 상품을 선택하고 문의 내용을 입력해주세요.</p>
                                </div>

                                <form onSubmit={handleCreateApplication} className="space-y-6">
                                    <div className="space-y-6 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
                                        {/* Step 1: Category */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">1. 카테고리 선택</label>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                {SERVICE_CATEGORIES.map(cat => (
                                                    <button
                                                        key={cat.id}
                                                        type="button"
                                                        onClick={() => setNewAppServiceId(cat.id)}
                                                        className={`p-3 rounded-xl text-xs md:text-sm font-bold border transition-all ${
                                                            newAppServiceId === cat.id 
                                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                                                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-white'
                                                        }`}
                                                    >
                                                        {cat.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Step 2: Sub Product */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">2. 세부 상품 선택</label>
                                            <div className="relative">
                                                <select 
                                                    value={newAppProduct}
                                                    onChange={(e) => setNewAppProduct(e.target.value)}
                                                    className="w-full p-4 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none text-sm md:text-base"
                                                >
                                                    {newAppSubMenus.length > 0 ? (
                                                        newAppSubMenus.map(sub => (
                                                            <option key={sub.id} value={sub.title}>{sub.title}</option>
                                                        ))
                                                    ) : (
                                                        <option value={SERVICE_CATEGORIES.find(c => c.id === newAppServiceId)?.label}>
                                                            {SERVICE_CATEGORIES.find(c => c.id === newAppServiceId)?.label}
                                                        </option>
                                                    )}
                                                </select>
                                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* Step 3: Detail Option (Conditional) */}
                                        {availableDetailOptions.length > 0 && (
                                            <div className="animate-in fade-in slide-in-from-top-2">
                                                <label className="block text-sm font-bold text-slate-700 mb-2">3. 상세 유형 선택</label>
                                                <div className="relative">
                                                    <select 
                                                        value={newAppDetailOption}
                                                        onChange={(e) => setNewAppDetailOption(e.target.value)}
                                                        className="w-full p-4 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none text-sm md:text-base"
                                                    >
                                                        {availableDetailOptions.map((opt, idx) => (
                                                            <option key={idx} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 4: Content */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                                {availableDetailOptions.length > 0 ? '4. 문의 내용' : '3. 문의 내용'}
                                            </label>
                                            <textarea 
                                                required
                                                value={newAppContent}
                                                onChange={(e) => setNewAppContent(e.target.value)}
                                                rows={5}
                                                placeholder="상담받고 싶은 내용을 자유롭게 적어주세요."
                                                className="w-full p-4 rounded-xl border border-slate-300 bg-white resize-none focus:ring-2 focus:ring-indigo-500 outline-none text-sm md:text-base"
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button 
                                            type="button" 
                                            onClick={() => setIsCreating(false)}
                                            className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                                        >
                                            취소
                                        </button>
                                        <button 
                                            type="submit"
                                            className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                                        >
                                            <Send size={18} /> 신청하기
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    ) : selectedApp ? (
                        /* EXISTING APPLICATION DETAILS */
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50">
                            
                            {/* 1. Status Tracker */}
                            <div className="mb-6 md:mb-8 bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                                    <ActivityIcon status={selectedApp.processStatus} /> 
                                    진행 상태 : <span className="text-indigo-600">{procedureSteps[getStatusIndex(selectedApp.processStatus)]}</span>
                                </h4>
                                <div className="relative px-2 md:px-4 overflow-x-auto pb-2">
                                    <div className="min-w-[500px]">
                                        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full z-0"></div>
                                        <div 
                                            className="absolute top-1/2 left-0 h-1 bg-indigo-500 -translate-y-1/2 rounded-full z-0 transition-all duration-500"
                                            style={{ width: `${(getStatusIndex(selectedApp.processStatus) / (procedureSteps.length - 1)) * 100}%` }}
                                        ></div>
                                        <div className="flex justify-between relative z-10">
                                            {procedureSteps.map((step, idx) => {
                                                const currentIdx = getStatusIndex(selectedApp.processStatus);
                                                const isPassed = idx <= currentIdx;
                                                const isCurrent = idx === currentIdx;
                                                return (
                                                    <div key={idx} className="flex flex-col items-center gap-2 min-w-[40px]">
                                                        <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                                                            isCurrent ? 'bg-indigo-600 border-indigo-600 scale-150 shadow-md' : 
                                                            isPassed ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'
                                                        }`}></div>
                                                        <span className={`text-[10px] font-bold mt-1 whitespace-nowrap ${isCurrent ? 'text-indigo-600' : isPassed ? 'text-slate-600' : 'text-slate-300'}`}>
                                                            {step}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                                {/* Left Column: Info & Chat */}
                                <div className="space-y-4 md:space-y-6">
                                    {/* Application Info */}
                                    <section className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
                                        <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                                            <FileText size={18} className="text-slate-400" /> 신청 정보
                                        </h4>
                                        <div className="space-y-4 text-sm text-slate-600">
                                            <div className="flex justify-between">
                                                <span className="font-medium text-slate-500">상품명</span>
                                                <span className="font-bold text-slate-800 text-base text-right ml-4">{selectedApp.serviceType}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium text-slate-500">신청인</span>
                                                <span className="font-bold text-slate-800">{selectedApp.name}</span>
                                            </div>
                                            <div>
                                                <span className="block font-medium text-slate-500 mb-1">문의 내용</span>
                                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-slate-700 whitespace-pre-wrap leading-relaxed">
                                                    {selectedApp.content}
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Admin Reply */}
                                    <section className="bg-blue-50 p-4 md:p-6 rounded-2xl border border-blue-100 shadow-sm">
                                        <h4 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                                            <CheckCircle size={18} /> 관리자 답변
                                        </h4>
                                        {selectedApp.adminReply ? (
                                            <div className="bg-white p-4 rounded-xl border border-blue-100 text-slate-700 whitespace-pre-wrap leading-relaxed shadow-sm text-sm md:text-base">
                                                {selectedApp.adminReply}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 text-blue-400 text-sm bg-white/50 rounded-xl border border-dashed border-blue-200">
                                                관리자가 내용을 확인 중입니다.<br/>잠시만 기다려주세요.
                                            </div>
                                        )}
                                    </section>
                                </div>

                                {/* Right Column: Payment & Files */}
                                <div className="space-y-4 md:space-y-6">
                                    {/* Payment Section */}
                                    <section className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
                                        <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                                            <CreditCard size={18} className="text-slate-400" /> 결제 진행
                                        </h4>
                                        
                                        {selectedApp.paymentAmount ? (
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-end bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                    <span className="text-sm font-medium text-slate-500">결제 요청 금액</span>
                                                    <span className="text-2xl font-black text-indigo-600">
                                                        {selectedApp.paymentAmount.toLocaleString()}원
                                                    </span>
                                                </div>

                                                {selectedApp.isPaid ? (
                                                    <div className="bg-green-50 text-green-700 p-4 rounded-xl font-bold text-center flex items-center justify-center gap-2 border border-green-100">
                                                        <CheckCircle size={20} /> 결제가 완료되었습니다.
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <button onClick={() => handlePayment('BankTransfer')} className="py-3 px-2 md:px-4 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-indigo-500 transition-all text-xs md:text-sm font-bold text-slate-600 break-keep">
                                                            무통장 입금
                                                        </button>
                                                        <button onClick={() => handlePayment('VirtualAccount')} className="py-3 px-2 md:px-4 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-indigo-500 transition-all text-xs md:text-sm font-bold text-slate-600 break-keep">
                                                            계좌이체
                                                        </button>
                                                        <button onClick={() => handlePayment('CreditCard')} className="py-3 px-2 md:px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-xs md:text-sm font-bold shadow-lg shadow-indigo-200 break-keep">
                                                            신용카드
                                                        </button>
                                                        <button onClick={() => handlePayment('PayPal')} className="py-3 px-2 md:px-4 bg-[#003087] text-white rounded-xl hover:bg-[#00256b] transition-all text-xs md:text-sm font-bold shadow-lg shadow-blue-200 break-keep">
                                                            PayPal
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-sm">
                                                <DollarSign size={24} className="mx-auto mb-2 opacity-50" />
                                                금액 산정 중입니다.
                                            </div>
                                        )}
                                    </section>

                                    {/* File Upload Section */}
                                    <section className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
                                        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                                            <h4 className="font-bold text-slate-700 flex items-center gap-2 text-sm md:text-base">
                                                <Paperclip size={18} className="text-slate-400" /> 파일 업로드
                                                <span className="text-xs font-normal text-slate-400 ml-1 bg-slate-100 px-2 py-0.5 rounded-full">
                                                    {selectedApp.attachments?.length || 0}/10
                                                </span>
                                            </h4>
                                            
                                            <label className={`cursor-pointer px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                                {uploading ? <RefreshCw size={12} className="animate-spin"/> : <Upload size={12} />} 
                                                파일 추가
                                                <input 
                                                    type="file" 
                                                    multiple 
                                                    className="hidden" 
                                                    onChange={handleFileUpload} 
                                                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.hwp"
                                                />
                                            </label>
                                        </div>

                                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                            {selectedApp.attachments && selectedApp.attachments.length > 0 ? (
                                                selectedApp.attachments.map(file => (
                                                    <div key={file.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100 group hover:border-indigo-200 transition-colors">
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            <div className={`p-2 rounded-lg ${file.uploadedBy === 'admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                                                <FileText size={16} />
                                                            </div>
                                                            <div className="truncate">
                                                                <p className="text-sm font-medium text-slate-700 truncate max-w-[150px]">{file.name}</p>
                                                                <p className="text-[10px] text-slate-400">
                                                                    {(file.size / 1024).toFixed(1)}KB • {new Date(file.createdAt).toLocaleDateString()}
                                                                    {file.uploadedBy === 'admin' && <span className="ml-1 text-red-500 font-bold">Admin</span>}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            {/* Download Mock */}
                                                            <a href={file.data} download={file.name} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                                <Download size={16} />
                                                            </a>
                                                            {file.uploadedBy === 'user' && (
                                                                <button onClick={() => handleDeleteFile(file.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                                                    <p className="text-sm text-slate-400">업로드된 파일이 없습니다.</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-3 flex items-start gap-2 p-3 bg-yellow-50 rounded-lg text-yellow-700 text-xs border border-yellow-100">
                                            <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                            <p>파일당 최대 5MB, 최대 10개까지 업로드 가능합니다.<br/>여권 사본, 신청 서류 등을 업로드해주세요.</p>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-6 bg-slate-50 p-4">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                                <LayoutDashboard size={48} className="text-slate-200" />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-bold text-slate-700">온라인 업무 관리</h3>
                                <p className="text-slate-500 text-sm md:text-base">좌측 목록에서 진행중인 업무를 선택하거나<br/>새로운 업무를 신청해주세요.</p>
                            </div>
                            <button 
                                onClick={() => setIsCreating(true)}
                                className="px-8 py-4 bg-indigo-600 text-white rounded-full font-bold shadow-xl hover:bg-indigo-700 transition-all hover:-translate-y-1 flex items-center gap-2"
                            >
                                <Plus size={20} /> 새 업무 신청하기
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper for status icon
const ActivityIcon = ({ status }: { status: ProcessStatus }) => {
    return <RefreshCw size={20} className="text-indigo-600" />;
}

export default OnlineApplicationModal;
