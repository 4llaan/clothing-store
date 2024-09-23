import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar'; 
import Shop from './pages/Shop';
import Product from './pages/Product';
import Cart from './pages/Cart';
import LoginSignup from './pages/LoginSignup';
import Gothrift from './pages/Gothrift';
import SellersCorner from './pages/SellersCorner';
import Footer from './components/Footer/Footer';
import ShopCategory from './pages/ShopCategory';
import men_banner from './components/Assets/banner_mens.png'
import women_banner from './components/Assets/banner_women.png'
import kid_banner from './components/Assets/banner_kids.png';



function App() {
  return (
    <div>
      <Router>
        <Navbar />
        <Routes>
  <Route exact path="/" element={<Shop />} />
  {/* Remove these ShopCategory routes */}
<Route exact path="/mens" element={<ShopCategory banner={men_banner} category="mens" />} />
  <Route exact path="/womens" element={<ShopCategory banner={women_banner} category="womens" />} />
  <Route exact path="/kids" element={<ShopCategory banner={kid_banner} category="kid" />} /> 
  <Route exact path="/product" element={<Product />} />
  <Route exact path="/productid" element={<Product />} />
  <Route exact path="/cart" element={<Cart />} />
  <Route exact path="/gothrift" element={<Gothrift />} />
  <Route exact path="/sellerscorner" element={<SellersCorner />} />
  <Route path="/Login" element={<LoginSignup />} />
</Routes>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
