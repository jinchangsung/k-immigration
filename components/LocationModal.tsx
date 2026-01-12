import React from 'react';
import { X, MapPin } from 'lucide-react';
import { COMPANY_INFO } from '../constants';

interface LocationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    // Direct link to Naver Map as a fallback/simple solution without requiring client ID in code for this demo
    // Ideally, with a Client ID, we would load the script.
    const mapUrl = "https://map.naver.com/v5/search/서울시 강남구 강남대로 156길 12";

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                <div className="bg-slate-900 p-6 flex justify-between items-center text-white shrink-0">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <MapPin size={20} className="text-blue-400" /> 오시는 길
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="flex-1 bg-slate-50 p-0 relative">
                     {/* Map Placeholder / Iframe equivalent */}
                     <div className="w-full h-[400px] bg-slate-200 flex flex-col items-center justify-center text-slate-500">
                        <div className="text-center p-8">
                             <MapPin size={48} className="mx-auto mb-4 text-slate-400" />
                             <p className="mb-4 font-bold">네이버 지도에서 위치 확인하기</p>
                             <a 
                                href={mapUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-6 py-3 bg-[#03C75A] text-white font-bold rounded-lg hover:bg-[#02b351] transition-colors inline-flex items-center gap-2"
                             >
                                네이버 지도 열기
                             </a>
                             <p className="mt-4 text-xs text-slate-400 max-w-sm mx-auto">
                                * 실제 지도 API를 연동하려면 Naver Cloud Platform Client ID가 필요합니다.
                             </p>
                        </div>
                     </div>
                </div>

                <div className="p-8 bg-white border-t border-slate-200">
                    <h4 className="font-bold text-lg text-slate-800 mb-2">{COMPANY_INFO.address}</h4>
                    <p className="text-slate-500 mb-4 text-sm">지번: 서울특별시 강남구 신사동 516-10 다복빌딩 4층</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <strong className="block text-slate-800 mb-1">지하철 이용시</strong>
                            <p className="text-slate-600">3호선/신분당선 신사역 8번 출구 도보 5분</p>
                        </div>
                         <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <strong className="block text-slate-800 mb-1">버스 이용시</strong>
                            <p className="text-slate-600">신사역사거리 정류장 하차</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationModal;