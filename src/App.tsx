import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProductManager from './pages/ProductManager';
import Sale from './pages/Sale';
import Analytics from './pages/Analytics';
import Transactions from './pages/Transactions';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/manager" element={<ProductManager />} />
        <Route path="/sale" element={<Sale />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;
