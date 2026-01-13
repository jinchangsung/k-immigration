import React, { useEffect, useState } from 'react';
import { X, User, MessageSquare, DollarSign, CreditCard, FileText, FileInput, Landmark, CheckSquare, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/dbService';
import { ConsultationRequest, ProcessStatus } from '../types';

interface MyPageModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const STATUS_ORDER: ProcessStatus[] = [
    'REQUESTED', 'CONSULTING', 'FEE_NOTICE', 'PAYMENT',
    'DOC_PREP', 'SUBMITTED', 'UNDER_REVIEW', 'COMPLETED'
];

const MyPageModal: React.FC<MyPageModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [consultations, setConsultations] = useState<ConsultationRequest[]>([]);
    
    const fetchMyConsultations = () => {
        if (user) {
            const myRequests = dbService.getConsultationsByEmail(user.email);
            setConsultations(myRequests);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchMyConsultations();
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

    // Steps Configuration (Matches ServiceDetail)
    const procedureSteps = [
        { label: '대행신청', icon: User },
        { label: '상담', icon: MessageSquare },
        { label: '금액통보', icon: DollarSign },
        { label: '결제', icon: CreditCard },
        { label: '문서작성', icon: FileText },
        { label: '접수', icon: FileInput },
        { label: '심사', icon: Landmark },
        { label: '결과', icon: CheckSquare },
    ];

    const getStatusIndex = (status: ProcessStatus) => {
        return STATUS_ORDER.indexOf(status);
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-0 md:p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-white md:rounded-2xl w-full md:max-w-4xl h-full md:max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="bg-slate-900 p-4 md:p-6 flex justify-between items-center text-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                            <User size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">마이페이지</h3>
                            <p className="text-sm text-slate-400">{user?.displayName}님의 신청 내역입니다.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
                    
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-slate-700 text-lg">진행 중인 민원</h4>
                        <button 
                            onClick={fetchMyConsultations}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            <RefreshCw size={14} /> 새로고침
                        </button>
                    </div>

                    {consultations.length === 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">
                            신청하신 민원 내역이 없습니다.
                        </div>
                    ) : (
                        <div className="space-y-4 md:space-y-6">
                            {consultations.map((request) => {
                                const currentIndex = getStatusIndex(request.processStatus || 'REQUESTED');

                                return (
                                    <div key={request.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
                                        <div className="flex flex-col md:flex-row justify-between items-start mb-6 border-b border-slate-100 pb-4 gap-2 md:gap-0">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                                                        {request.serviceType || '일반상담'}
                                                    </span>
                                                    <span className="text-xs text-slate-400">
                                                        {new Date(request.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <h5 className="font-bold text-lg text-slate-800">
                                                    {request.content.split('\n')[0].length > 50 
                                                        ? request.content.split('\n')[0].substring(0, 50) + '...' 
                                                        : request.content.split('\n')[0]}
                                                </h5>
                                            </div>
                                            <div className="text-right w-full md:w-auto flex justify-between md:block">
                                                <div className="md:hidden text-xs text-slate-400">현재 상태</div>
                                                <div className="text-sm font-bold text-blue-600">
                                                    {procedureSteps[currentIndex].label} 단계
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Tracker (8 Steps) */}
                                        <div className="relative overflow-x-auto pb-4">
                                            <div className="min-w-[500px] px-2">
                                                {/* Progress Bar Background */}
                                                <div className="absolute top-5 left-0 w-full h-1 bg-slate-100 rounded-full z-0"></div>
                                                
                                                {/* Progress Bar Active */}
                                                <div 
                                                    className="absolute top-5 left-0 h-1 bg-blue-500 rounded-full z-0 transition-all duration-500"
                                                    style={{ width: `${(currentIndex / (procedureSteps.length - 1)) * 100}%` }}
                                                ></div>

                                                <div className="flex justify-between relative z-10">
                                                    {procedureSteps.map((step, idx) => {
                                                        const isCompleted = idx <= currentIndex;
                                                        const isCurrent = idx === currentIndex;

                                                        return (
                                                            <div key={idx} className="flex flex-col items-center gap-2 group w-16">
                                                                <div 
                                                                    className={`
                                                                        w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                                                        ${isCurrent 
                                                                            ? 'bg-blue-600 border-blue-600 text-white scale-110 shadow-lg shadow-blue-500/30' 
                                                                            : isCompleted 
                                                                                ? 'bg-white border-blue-500 text-blue-500' 
                                                                                : 'bg-white border-slate-200 text-slate-300'}
                                                                    `}
                                                                >
                                                                    <step.icon size={isCurrent ? 20 : 18} />
                                                                </div>
                                                                <div className={`text-[10px] font-bold text-center ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-slate-600' : 'text-slate-300'}`}>
                                                                    {step.label}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Detail Toggle or Info could go here */}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyPageModal;
