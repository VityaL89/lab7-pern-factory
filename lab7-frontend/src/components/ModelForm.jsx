import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addModel } from '../features/modelsSlice';

const ModelForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', price: '', product_id: 1, image_url: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Валидация на стороне клиента (требование ЛР)
    if (form.name.length < 3) return setError('Название должно быть минимум 3 символа');
    if (form.price <= 0) return setError('Цена должна быть больше нуля');

    dispatch(addModel(form))
      .unwrap()
      .then(() => navigate('/'))
      .catch(err => {
        // Обработка ошибок от Sequelize
        if (Array.isArray(err.response?.data?.error)) {
          setError(err.response.data.error.join(', '));
        } else {
          setError(err.response?.data?.error || 'Ошибка при создании');
        }
      });
  };

  return (
    <div className="container mt-4">
      <h2>Добавить модель</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit} className="w-50">
        <div className="mb-3">
          <label className="form-label">Название</label>
          <input type="text" className="form-control" 
                 onChange={e => setForm({...form, name: e.target.value})} required />
        </div>
        
        <div className="mb-3">
          <label className="form-label">Цена (BYN)</label>
          <input type="number" step="0.01" className="form-control" 
                 onChange={e => setForm({...form, price: e.target.value})} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Ссылка на фото (URL)</label>
          <input type="url" className="form-control" 
                 onChange={e => setForm({...form, image_url: e.target.value})} required />
        </div>

        <button type="submit" className="btn btn-success">Сохранить</button>
        <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate('/')}>Отмена</button>
      </form>
    </div>
  );
};

export default ModelForm;