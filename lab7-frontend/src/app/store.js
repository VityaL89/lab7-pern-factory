import { configureStore } from '@reduxjs/toolkit';
import modelsReducer from '../features/modelsSlice';

export const store = configureStore({
  reducer: {
    models: modelsReducer,
  },
});