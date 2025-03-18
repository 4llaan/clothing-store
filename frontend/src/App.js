import Navbar from "./Components/Navbar/Navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Shop from "./Pages/Shop";
import Cart from "./Pages/Cart";
import Product from "./Pages/Product";
import Checkout from "./Pages/Checkout";
import Footer from "./Components/Footer/Footer";
import ShopCategory from "./Pages/ShopCategory";
import LoginSignup from "./Pages/LoginSignup";
import women_banner from "./Components/Assets/banner_women.png";
import men_banner from "./Components/Assets/banner_mens.png";
import kid_banner from "./Components/Assets/banner_kids.png";
import Profile from './Components/Profile/Profile';
import ForgotPassword from './Pages/ForgotPassword'; // Import the ForgotPassword component
import OtpModal from "./Pages/otpverifier";
import SearchResults from './Components/SearchResults/SearchResults'; // Import SearchResults component
import SellersCorner from './Pages/SellersCorner';
import GoThrift from './Pages/GoThrift';  // Import the GoThrift component
import SellerForm from './Pages/SelllerForm'  // Import the SellerForm component
import YourOrders from './Pages/YourOrders'; // Add this import
import OrderReviewPage from './Pages/OrderReviewPage';
import MyRequests from './Pages/MyRequests';




export const backend_url = 'http://localhost:4000';
export const currency = '₹';

function App() {
  return (
    <div>
      <Router>
        <Navbar />
        <Routes>  
          <Route path="/" element={<Shop gender="all" />} />
          <Route path="/mens" element={<ShopCategory banner={men_banner} category="men" />} />
          <Route path="/womens" element={<ShopCategory banner={women_banner} category="women" />} />
          <Route path="/kids" element={<ShopCategory banner={kid_banner} category="kid" />} />

          <Route path="/search" element={<SearchResults />} /> {/* Add this route for search results */}
          <Route path="/product/:productId" element={<Product />} /> {/* Ensure this path matches */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<LoginSignup/>} />  
          <Route path="/profile" element={<Profile />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/otp-verification" element={<OtpModal />} />
          <Route path="/sellerscorner" element={<SellersCorner />} /> {/* Add this */}
          <Route path="/gothrift" element={<GoThrift />} /> {/* Add this */}
          <Route path="/sellerform" element={<SellerForm />} />
          <Route path="/your-orders" element={<YourOrders />} />
          <Route path="/review-order" element={<OrderReviewPage />} />
          <Route path="/my-requests" element={<MyRequests />} />


        </Routes>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
