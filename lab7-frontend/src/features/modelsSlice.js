import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/models';

// Получение списка моделей
export const fetchModels = createAsyncThunk('models/fetch', async (params = {}) => {
  const response = await axios.get(API_URL, { params });
  return response.data;
});

// Добавление модели
export const addModel = createAsyncThunk('models/add', async (modelData) => {
  const response = await axios.post(API_URL, modelData);
  return response.data;
});

// Удаление модели
export const deleteModel = createAsyncThunk('models/delete', async (id) => {
  await axios.delete(`${API_URL}/${id}`);
  return id;
});

const modelsSlice = createSlice({
  name: 'models',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
    totalPages: 0,
    currentPage: 1
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Обработка загрузки
      .addCase(fetchModels.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchModels.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchModels.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // Обработка добавления
      .addCase(addModel.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Обработка удаления
      .addCase(deleteModel.fulfilled, (state, action) => {
        state.items = state.items.filter(m => m.id !== action.payload);
      });
  },
});

export default modelsSlice.reducer;