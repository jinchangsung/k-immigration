import React, { useEffect, useState } from 'react';
import { dbService } from '../services/dbService';
import { NewsItem } from '../types';
import { Bell, ChevronRight, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import AutoTranslatedText from './AutoTranslatedText';

const NewsSection: React.FC = () => {
  const { t } = useLanguage();
  const [newsData, setNewsData] = useState<NewsItem[]>([]);

  useEffect(() => {
    // Load news from "Database"
    const data = dbService.getNews();
    // Show only top 3 recent news
    setNewsData(data.slice(0, 3));
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg text-red-500">
                <Bell size={24} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">{t.news.title}</h3>
          </div>
          <button className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium">
            {t.news.viewAll} <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {newsData.map((news) => (
            <div 
                key={news.id} 
                className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300"></div>
              
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-4">
                <Calendar size={14} />
                {news.date}
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-3 line-clamp-1 group-hover:text-blue-600 transition-colors">
                <AutoTranslatedText text={news.title} />
              </h4>
              <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                <AutoTranslatedText text={news.content} />
              </p>
              
              <div className="mt-4 flex justify-end">
                <span className="text-xs font-bold text-blue-100 group-hover:text-blue-600 transition-colors">{t.news.readMore}</span>
              </div>
            </div>
          ))}
          {newsData.length === 0 && (
              <div className="col-span-3 text-center py-10 text-slate-400">
                  <AutoTranslatedText text="등록된 소식이 없습니다." />
              </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;