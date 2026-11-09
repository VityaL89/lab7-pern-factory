import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchModels, deleteModel } from '../features/modelsSlice';

const ModelsList = () => {
  const dispatch = useDispatch();
  const { items, status, totalPages, currentPage, error } = useSelector((state) => state.models);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchModels({ page, limit: 5, sort: 'id', order: 'ASC' }));
  }, [dispatch, page]);

  const handleDelete = (id) => {
    // Подтверждение перед удалением (требование ЛР)
    if (window.confirm('Вы уверены, что хотите удалить эту модель?')) {
      dispatch(deleteModel(id))
        .unwrap()
        .catch((err) => {
          // Обработка ошибки удаления (например, если есть поставки)
          alert(err.response?.data?.error || 'Ошибка при удалении');
        });
    }
  };

  if (status === 'loading') return <div className="text-center mt-5"><h3>Загрузка...</h3></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h2>Список моделей одежды</h2>
      <Link to="/add" className="btn btn-primary mb-3">Добавить модель</Link>
      
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Фото</th>
            <th>Название</th>
            <th>Цена</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {items.map((model) => (
            <tr key={model.id}>
              <td>{model.id}</td>
              <td><img src={model.image_url} alt="" width="50" className="img-thumbnail" /></td>
              <td>{model.name}</td>
              <td>{model.price} BYN</td>
              <td>
                <Link to={`/models/${model.id}`} className="btn btn-sm btn-info me-2">Подробнее</Link>
                <button onClick={() => handleDelete(model.id)} className="btn btn-sm btn-danger">Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Пагинация */}
      <div className="d-flex justify-content-center">
        {Array.from({ length: totalPages }, (_, i) => (
          <button 
            key={i} 
            onClick={() => setPage(i + 1)} 
            className={`btn ${page === i + 1 ? 'btn-primary' : 'btn-outline-primary'} me-1`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModelsList;