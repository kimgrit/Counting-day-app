// @ts-nocheck
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import CountPage from './pages/CountPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CountPage />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
