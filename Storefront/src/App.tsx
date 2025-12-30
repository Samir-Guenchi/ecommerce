import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StorePage from './pages/StorePage';
import ProductPage from './pages/ProductPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/product/:productId" element={<ProductPage />} />
        <Route path="/" element={<StorePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


