import React from 'react';
import { MousePointerClick, ArrowRight } from 'lucide-react';

const Hero3D: React.FC = () => {
  return (
    <div className="relative w-full bg-gradient-to-b from-slate-50 to-blue-50 pt-10 pb-20 overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-200/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between relative z-10">
        
        {/* Left Text Content */}
        <div className="md:w-1/2 mb-12 md:mb-0 space-y-6 text-center md:text-left">
          <div className="inline-block px-4 py-1.5 bg-white border border-blue-100 rounded-full shadow-sm">
            <span className="text-blue-600 text-xs font-bold tracking-wider uppercase">Online Immigration Service</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-800 leading-tight">
            한국 생활의 시작, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              스마트한 행정처리
            </span>
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed max-w-lg mx-auto md:mx-0">
            출입국관리사무소 방문 없이, 온라인으로 간편하게.<br/>
            비자 연장부터 체류 자격 변경까지 원스톱으로 해결하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
            <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(37,99,235,0.5)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group">
              민원 신청 바로가기
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
              <MousePointerClick size={20} className="text-slate-400" />
              이용안내
            </button>
          </div>
        </div>

        {/* Right 3D Visual Content */}
        <div className="md:w-1/2 relative perspective-1000">
          {/* Main Card */}
          <div className="relative w-full max-w-md mx-auto aspect-[4/3] bg-white rounded-3xl shadow-2xl transform rotate-y-12 rotate-x-6 hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700 border border-slate-100 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-blue-50"></div>
            
            {/* Header of the fake UI */}
            <div className="relative p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="text-xs font-mono text-slate-300">K-Immigration</div>
            </div>

            {/* Content of the fake UI */}
            <div className="relative p-6 space-y-4">
                <div className="flex gap-4">
                    <div className="w-1/3 h-24 bg-blue-500 rounded-2xl shadow-lg flex items-center justify-center text-white font-bold text-xl">Visa</div>
                    <div className="w-2/3 space-y-3">
                        <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                        <div className="h-10 bg-slate-800 text-white rounded-lg flex items-center justify-center text-sm shadow-md mt-2">Approved</div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                     <div className="h-20 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center shadow-sm">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full mb-2"></div>
                        <div className="w-12 h-2 bg-slate-200 rounded"></div>
                     </div>
                     <div className="h-20 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center shadow-sm">
                        <div className="w-8 h-8 bg-green-100 rounded-full mb-2"></div>
                        <div className="w-12 h-2 bg-slate-200 rounded"></div>
                     </div>
                </div>
            </div>

            {/* Floating Element 1 */}
            <div className="absolute -right-8 top-20 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-bounce delay-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">✓</div>
                    <div>
                        <div className="text-xs text-slate-400">Status</div>
                        <div className="text-sm font-bold text-slate-800">승인 완료</div>
                    </div>
                </div>
            </div>

             {/* Floating Element 2 */}
             <div className="absolute -left-6 bottom-12 bg-slate-900 p-4 rounded-2xl shadow-2xl shadow-blue-900/20 transform translate-z-10 group-hover:scale-110 transition-transform">
                <div className="text-white text-xs font-medium mb-1">Documents</div>
                <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-800"></div>
                    <div className="w-8 h-8 rounded-full bg-slate-600 border-2 border-slate-800"></div>
                    <div className="w-8 h-8 rounded-full bg-slate-500 border-2 border-slate-800 flex items-center justify-center text-[10px] text-white">+2</div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero3D;