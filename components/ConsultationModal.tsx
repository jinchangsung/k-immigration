import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType?: string; // Optional: Pre-fill the service type if triggered from a detail page
}

const ConsultationModal: React.FC<ConsultationModalProps> = ({ isOpen, onClose, serviceType }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    passportNo: '',
    content: ''
  });

  useEffect(() => {
    if (isOpen) {
        setFormData(prev => ({
            ...prev,
            content: serviceType ? `[${serviceType}] 신청합니다. \n\n` : '',
            name: user ? user.displayName : '',
            email: user ? user.email : '',
        }));
    }
  }, [isOpen, serviceType, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await dbService.saveConsultation({
          ...formData,
          serviceType: serviceType || 'General'
      });
      alert(t.consultation.success);
      onClose();
      // Reset form but keep user info if logged in
      setFormData({ 
          name: user ? user.displayName : '', 
          email: user ? user.email : '', 
          phone: '', 
          passportNo: '', 
          content: '' 
      });
    } catch (error) {
      console.error(error);
      alert('Error submitting form');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
            <div>
                <h3 className="text-xl font-bold">
                    {serviceType ? `${serviceType} 신청` : t.consultation.title}
                </h3>
                <p className="text-sm text-slate-400 mt-1">{t.consultation.desc}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">{t.consultation.name}</label>
                    <input required name="name" value={formData.name} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">{t.consultation.phone}</label>
                    <input required name="phone" value={formData.phone} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">{t.consultation.email}</label>
                    <input 
                        required 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        // If logged in, make email read-only to ensure linkage with MyPage
                        readOnly={!!user}
                        className={`w-full p-3 bg-slate-50 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none ${user ? 'text-slate-500 bg-slate-100 cursor-not-allowed' : ''}`}
                    />
                    {user && <p className="text-[10px] text-blue-500 mt-1">* 로그인된 계정으로 신청됩니다.</p>}
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">{t.consultation.passport}</label>
                    <input required name="passportNo" value={formData.passportNo} onChange={handleChange} className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">{t.consultation.content}</label>
                <textarea required name="content" value={formData.content} onChange={handleChange} rows={4} className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
            </div>

            <div className="pt-2 flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                    {t.consultation.cancel}
                </button>
                <button type="submit" disabled={loading} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" /> : t.consultation.submit}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ConsultationModal;