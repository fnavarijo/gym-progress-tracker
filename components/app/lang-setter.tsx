'use client';

import { useEffect } from 'react';

interface LangSetterProps {
  locale: string;
}

export function LangSetter({ locale }: LangSetterProps) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
