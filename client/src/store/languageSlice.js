import { createSlice } from '@reduxjs/toolkit';
import en from '../i18n/en.json';
import hi from '../i18n/hi.json';

const translations = { en, hi };

const languageSlice = createSlice({
  name: 'language',
  initialState: {
    current: localStorage.getItem('lang') || 'en',
    translations: translations[localStorage.getItem('lang') || 'en'],
  },
  reducers: {
    setLanguage: (state, action) => {
      state.current = action.payload;
      state.translations = translations[action.payload];
      localStorage.setItem('lang', action.payload);
    },
    toggleLanguage: (state) => {
      const next = state.current === 'en' ? 'hi' : 'en';
      state.current = next;
      state.translations = translations[next];
      localStorage.setItem('lang', next);
    },
  },
});

export const { setLanguage, toggleLanguage } = languageSlice.actions;
export const selectT = (state) => state.language.translations;
export const selectLang = (state) => state.language.current;
export default languageSlice.reducer;
