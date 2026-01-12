import React, { useState } from 'react';
import { Lock, X, UserPlus, LogIn, Loader2 } from 'lucide-react';
import { dbService } from '../services/dbService';

interface AdminLoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: () => void;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        try {
            if (activeTab === 'login') {
                const result = await dbService.verifyAdmin(email, password);
                if (result.success) {
                    onLoginSuccess();
                    setEmail('');
                    setPassword('');
                    onClose();
                } else {
                    setError(result.message);
                }
            } else {
                // Register
                const result = await dbService.requestAdminAccess(email, password);
                if (result.success) {
                    setSuccessMsg(result.message);
                    setEmail('');
                    setPassword('');
                    setTimeout(() => setActiveTab('login'), 2000);
                } else {
                    setError(result.message);
                }
            }
        } catch (err) {
            setError('처리 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
                    <div className="flex items-center gap-2">
                        <Lock size={20} className="text-blue-400" />
                        <h3 className="text-lg font-bold">
                            {activeTab === 'login' ? '관리자 로그인' : '관리자 권한 요청'}
                        </h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Tabs */}
                    <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
                        <button
                            onClick={() => { setActiveTab('login'); setError(''); setSuccessMsg(''); }}
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                                activeTab === 'login' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            로그인
                        </button>
                        <button
                            onClick={() => { setActiveTab('register'); setError(''); setSuccessMsg(''); }}
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                                activeTab === 'register' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            가입 신청
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">이메일 (ID)</label>
                            <input 
                                type="email" 
                                required 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                placeholder="ai.jinpd@gmail.com"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">비밀번호</label>
                            <input 
                                type="password" 
                                required 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                placeholder="********"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg font-medium">
                                {error}
                            </div>
                        )}
                         {successMsg && (
                            <div className="p-3 bg-green-50 text-green-600 text-xs rounded-lg font-medium">
                                {successMsg}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full py-3 mt-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${
                                activeTab === 'login' 
                                    ? 'bg-blue-600 hover:bg-blue-700' 
                                    : 'bg-slate-700 hover:bg-slate-800'
                            }`}
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                activeTab === 'login' ? (
                                    <> <LogIn size={18} /> 로그인 </>
                                ) : (
                                    <> <UserPlus size={18} /> 권한 요청하기 </>
                                )
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginModal;