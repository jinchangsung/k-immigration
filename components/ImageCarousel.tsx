import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const ImageCarousel: React.FC = () => {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Using Unsplash images that closely match the user's provided images
  const slides = [
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1629636253139-44d471569d65?q=80&w=2000&auto=format&fit=crop", // Marine City / Busan Day
      alt: "Busan Marine City"
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2000&auto=format&fit=crop", // Diverse Group
      alt: "Diverse People"
    },
    {
      id: 3,
      url: "https://images.unsplash.com/photo-1596417548773-45db889150c9?q=80&w=2000&auto=format&fit=crop", // Harbor/City
      alt: "Korea City Harbor"
    },
    {
      id: 4,
      url: "https://images.unsplash.com/photo-1548115184-bc6544d06a58?q=80&w=2000&auto=format&fit=crop", // Palace
      alt: "Gyeongbokgung Palace"
    },
    {
      id: 5,
      url: "https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=2000&auto=format&fit=crop", // Gyeongbokgung Detail
      alt: "Gyeongbokgung Palace Detail"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-slate-900">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={slide.url}
            alt={slide.alt}
            className="w-full h-full object-cover"
          />
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent"></div>
        </div>
      ))}

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center z-10">
        <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="max-w-2xl space-y-6 animate-in slide-in-from-bottom-10 fade-in duration-1000">
                <div className="inline-block px-4 py-1.5 bg-blue-600/30 backdrop-blur-sm border border-blue-400/50 rounded-full">
                    <span className="text-blue-100 text-xs font-bold tracking-wider uppercase">{t.hero.tag}</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-lg">
                    {t.hero.title1} <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                    {t.hero.title2}
                    </span>
                </h2>
                <p className="text-lg text-slate-200 leading-relaxed max-w-lg drop-shadow-md whitespace-pre-line">
                    {t.hero.desc}
                </p>
                <div className="flex gap-4 pt-4">
                    <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-500 transition-all flex items-center gap-2 shadow-lg">
                    {t.hero.btnApply}
                    <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 right-8 flex gap-2 z-20">
        <button 
            onClick={prevSlide}
            className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-colors border border-white/20"
        >
            <ChevronLeft size={24} />
        </button>
        <button 
            onClick={nextSlide}
            className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-colors border border-white/20"
        >
            <ChevronRight size={24} />
        </button>
      </div>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, idx) => (
            <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentSlide === idx ? 'w-8 bg-blue-500' : 'bg-white/50 hover:bg-white'
                }`}
            />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;