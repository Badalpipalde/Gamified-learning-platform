import { createSlice } from '@reduxjs/toolkit';

const gamificationSlice = createSlice({
  name: 'gamification',
  initialState: {
    xp: 0,
    level: 1,
    coins: 0,
    streak: { current: 0, longest: 0 },
    badges: [],
    dailyChallengeCompleted: false,
    recentXPGain: null,
  },
  reducers: {
    setGamificationData: (state, action) => {
      return { ...state, ...action.payload };
    },
    addXP: (state, action) => {
      state.xp += action.payload;
      state.level = Math.floor(state.xp / 500) + 1;
      state.recentXPGain = action.payload;
    },
    addCoins: (state, action) => {
      state.coins += action.payload;
    },
    addBadge: (state, action) => {
      state.badges.push(action.payload);
    },
    completeDailyChallenge: (state) => {
      state.dailyChallengeCompleted = true;
    },
    clearRecentXP: (state) => {
      state.recentXPGain = null;
    },
  },
});

export const { setGamificationData, addXP, addCoins, addBadge, completeDailyChallenge, clearRecentXP } = gamificationSlice.actions;
export default gamificationSlice.reducer;
