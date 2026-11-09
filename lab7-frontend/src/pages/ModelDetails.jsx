import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ModelDetails = () => {
  const { id } = useParams();
  const [model, setModel] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/models/${id}`).then(res => setModel(res.data));
  }, [id]);

  if (!model) return <div className="text-center mt-5"><h3>Загрузка...</h3></div>;

  return (
    <div className="container mt-4">
      <h2>{model.name}</h2>
      <div className="row">
        <div className="col-md-4">
          <img src={model.image_url} alt={model.name} className="img-fluid img-thumbnail mb-3" />
        </div>
        <div className="col-md-8">
          <p><strong>Цена:</strong> {model.price} BYN</p>
          <p><strong>Вид товара:</strong> {model.Product?.name}</p>
          
          <h4 className="mt-4">Поступления на склад</h4>
          <ul className="list-group">
            {model.Deliveries?.map(d => (
              <li key={d.id} className="list-group-item">
                Дата: {d.delivery_date} | Кол-во: {d.quantity} шт. | Принял: {d.accepted_by}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Link to="/" className="btn btn-secondary mt-4">Назад к списку</Link>
    </div>
  );
};

export default ModelDetails;