import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translateText } from '../services/geminiService';
import { Language } from '../types';

interface AutoTranslatedTextProps {
  text: string;
  className?: string;
}

const AutoTranslatedText: React.FC<AutoTranslatedTextProps> = ({ text, className = '' }) => {
  const { language } = useLanguage();
  const [translatedContent, setTranslatedContent] = useState(text);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const performTranslation = async () => {
      // If language is KR or text is empty, just use original
      if (language === Language.KR || !text) {
        setTranslatedContent(text);
        return;
      }

      setIsTranslating(true);
      try {
        const result = await translateText(text, language);
        if (isMounted) setTranslatedContent(result);
      } catch (error) {
        if (isMounted) setTranslatedContent(text);
      } finally {
        if (isMounted) setIsTranslating(false);
      }
    };

    performTranslation();

    return () => { isMounted = false; };
  }, [text, language]);

  return (
    <div className={`transition-opacity duration-300 ${isTranslating ? 'opacity-50 animate-pulse' : 'opacity-100'} ${className}`}>
      {translatedContent}
    </div>
  );
};

export default AutoTranslatedText;