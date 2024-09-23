import React, { useState } from 'react';
import './Navbar.css';
import logo from '../Assets/logo.png';
import cart_icon from '../Assets/cart_icon.png';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [menu, setMenu] = useState('shop');

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
        <li onClick={() => setMenu('GO THRIFT')}><Link to='/gothrift' style={{ textDecoration: 'none' }}>GO THRIFT</Link> {menu === 'GO THRIFT' && <hr />} </li>
      </ul>
      
      <div className='nav-login-cart'>
        <Link to='/login'><button>Login</button></Link>
        <Link to='/cart'>
          <img src={cart_icon} alt='Cart Icon' />
        </Link>
        <div className='nav-cart-count'>0</div>
      </div>
    </div>
  );
};

export default Navbar;
