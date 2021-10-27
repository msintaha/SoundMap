import React from 'react';
import logo from '../../assets/images/wave.png';
import './_index.scss';
import { Button } from '@mui/material';

function Header(props) {
  return (
    <div className="sm-Header">
      <nav className="navbar navbar-expand-lg navbar-light bg-light justify-content-between">
        <div>
          <img src={logo} height="22" />
          <a className="sm-Header-title navbar-brand" href="/">SoundMap</a>
        </div>
        <div>
          <Button
            className="sm-Header-button"
            variant="outlined"
            component="label"
          >
            Upload File
            <input
              onChange={props.onFileUpload}
              type="file"
              accept=".csv"
              hidden
            />
          </Button>
        </div>
      </nav>
      <br />
    </div>
  );
}

export default Header;
