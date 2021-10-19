import React from 'react';
import logo from '../../assets/images/wave.png';
import './_index.scss';

function Header() {
  return (
    <div className="sm-Header">
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <img src={logo} height="22" />
        <a className="sm-Header-title navbar-brand" href="/">SoundMap</a>
      </nav>
      <br />
    </div>
  );
}

export default Header;
