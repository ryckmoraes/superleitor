
import { useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';

export const useTranslations = () => {
    const { language } = useLanguage();

    const t = useCallback((key: string, values?: Record<string, string | number>, defaultValue?: string) => {
        return getTranslation(language, key, values, defaultValue);
    }, [language]);

    return { t, lang: language.split('-')[0] };
};
