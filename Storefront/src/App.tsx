import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StorePage from './pages/StorePage';
import ProductPage from './pages/ProductPage';
import ContactPage from './pages/ContactPage';
import PoliciesPage from './pages/PoliciesPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/store/:domain" element={<StorePage />} />
        <Route path="/product/:productId" element={<ProductPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/policies" element={<PoliciesPage />} />
        <Route path="/" element={<StorePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


