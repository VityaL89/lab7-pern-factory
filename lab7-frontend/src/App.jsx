import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import ModelsList from './pages/ModelsList';
import ModelDetails from './pages/ModelDetails';
import ModelForm from './components/ModelForm';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
        {/* Навигация */}
        <nav className="navbar navbar-expand navbar-dark bg-dark px-4">
          <Link to="/" className="navbar-brand">Фабрика Одежды</Link>
        </nav>

        {/* Маршруты */}
        <Routes>
          <Route path="/" element={<ModelsList />} />
          <Route path="/models/:id" element={<ModelDetails />} />
          <Route path="/add" element={<ModelForm />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;