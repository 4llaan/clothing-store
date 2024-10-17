import React, { useState, useEffect, useContext } from 'react';
import './Navbar.css';
import logo from '../Assets/logo.png';
import cart_icon from '../Assets/cart_icon.png';
import default_profile from '../Assets/default_profile.png'
import { Link } from 'react-router-dom';
import { ShopContext } from '../../Context/ShopContext'

const Navbar = () => {
  const [menu, setMenu] = useState('shop');
  const {getTotalCartItems}=useContext(ShopContext);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('auth-token'); // Retrieve the auth token
      if (token) {
        try {
          const response = await fetch('http://localhost:4000/api/profile', {
            method: 'GET',
            headers: {
              'auth-token': token, // Send the token in the header for authentication
            },
          });

          if (response.ok) {
            const profileData = await response.json();
            setUserProfile(profileData); // Update the state with user profile data
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
      
      <div className="nav-login-cart">
        {localStorage.getItem('auth-token') ? (
          <>
            <div className="nav-profile">
              <Link to="/profile" style={{ textDecoration: 'none' }}>
                <img src={userProfile?.profilePic || default_profile} alt="Profile" className="profile-img" />
              </Link>
              <div className="profile-info">
                <p>welcome,{userProfile?.name || "User"}</p> {/* Display the user's name */}
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
