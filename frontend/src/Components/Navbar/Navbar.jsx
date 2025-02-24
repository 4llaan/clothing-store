import React, { useState, useEffect, useContext } from 'react';
import './Navbar.css';
import logo from '../Assets/logo.png';
import cart_icon from '../Assets/cart_icon.png';
import default_profile from '../Assets/default_profile.png';
import { Link, useNavigate } from 'react-router-dom';  // Use 'useNavigate' to handle redirection after search
import { ShopContext } from '../../Context/ShopContext';

const Navbar = () => {
  const [menu, setMenu] = useState('shop');
  const { getTotalCartItems } = useContext(ShopContext);
  const [userProfile, setUserProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // New state for search query
  const navigate = useNavigate(); // useNavigate hook for navigation

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('auth-token');
      if (token) {
        try {
          const response = await fetch('http://localhost:4000/api/profile', {
            method: 'GET',
            headers: {
              'auth-token': token,
            },
          });

          if (response.ok) {
            const profileData = await response.json();
            setUserProfile(profileData);
          } else {
            console.error('Failed to fetch user profile');
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    window.location.replace("/");
  };

  // Function to handle search query submission
  const handleSearchSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`); // Redirect to the search results page with the query
    }
  };

  return (
    <div className='navbar'>
      <div className='nav-logo'>
        <Link to='/' style={{ textDecoration: 'none', color: 'inherit' }}>
          <img src={logo} alt='Shopper Logo' />
          <p>SHOPPER</p>
        </Link>
      </div>

      <ul className='nav-menu'>
        <li onClick={() => setMenu('shop')}><Link to='/' style={{ textDecoration: 'none' }}>shop</Link> {menu === 'shop' && <hr />}</li>
        <li onClick={() => setMenu('mens')}><Link to='/mens' style={{ textDecoration: 'none' }}>mens</Link> {menu === 'mens' && <hr />}</li>
        <li onClick={() => setMenu('womens')}><Link to='/womens' style={{ textDecoration: 'none' }}>womens</Link> {menu === 'womens' && <hr />}</li>
        <li onClick={() => setMenu('kids')}><Link to='/kids' style={{ textDecoration: 'none' }}>kids</Link> {menu === 'kids' && <hr />}</li>
        <li onClick={() => setMenu('SELLERS CORNER')}><Link to='/sellerscorner' style={{ textDecoration: 'none' }}>SELLERS CORNER</Link> {menu === 'SELLERS CORNER' && <hr />}</li>
        <li onClick={() => setMenu('GO THRIFT')}><Link to='/gothrift' style={{ textDecoration: 'none' }}>GO THRIFT</Link> {menu === 'GO THRIFT' && <hr />}</li>
      </ul>

      {/* Search Bar */}
      <div className="nav-search">
        <form onSubmit={handleSearchSubmit}>
          <input
            type="text"
            className="nav-search-input"
            placeholder="Search products..."
            id='search'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} // Update search query state
          />
          <button className="nav-search-button" type="submit" id='submit'>Search</button>
        </form>
      </div>

      {/* Add Your Orders link here */}
      {localStorage.getItem('auth-token') && (
        <div className="nav-orders">
          <Link 
            to="/your-orders" 
            className="orders-link"
            onClick={() => setMenu('YOUR ORDERS')}
          >
            Your Orders
          </Link>
        </div>
      )}

      <div className="nav-login-cart">
        {localStorage.getItem('auth-token') ? (
          <>
            <div className="nav-profile">
              <Link to="/profile" style={{ textDecoration: 'none' }}>
                <img src={userProfile?.profilePic || default_profile} alt="Profile" className="profile-img" />
              </Link>
              <div className="profile-info">
                <p>welcome, {userProfile?.name || "User"}</p>
                <button onClick={handleLogout}>Logout</button>
              </div>
            </div>
          </>
        ) : (
          <Link to='/login' style={{ textDecoration: 'none' }}>
            <button>Login</button>
          </Link>
        )}
        <Link to="/cart"><img src={cart_icon} alt="cart" /></Link>
        <div className='nav-cart-count'>{getTotalCartItems()}</div>
      </div>
    </div>
  );
};

export default Navbar;
