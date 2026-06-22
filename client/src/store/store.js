import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import themeReducer from './themeSlice';
import languageReducer from './languageSlice';
import gamificationReducer from './gamificationSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    language: languageReducer,
    gamification: gamificationReducer,
  },
});

export default store;
