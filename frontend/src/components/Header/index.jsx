import React from 'react';
import logo from '../../assets/images/wave.png';
import './_index.scss';
import { Button } from '@mui/material';
import BasicMenu from '../BasicMenu';

function Header({ items, onAddView, onCompareView, onFileUpload, onReset, shouldShowReset }) {
  return (
    <div className="sm-Header">
      <nav className="navbar navbar-expand-lg navbar-light bg-light justify-content-between">
        <div>
          <img src={logo} height="22" />
          <a className="sm-Header-title navbar-brand" href="/">SoundMap</a>
        </div>
        <div className="sm-Header-right">
          {shouldShowReset && <Button color="secondary" className="sm-Header-button" onClick={onReset}>Reset</Button>}
          {onCompareView && <BasicMenu name="Compare Views" items={['Overview', 'Summary']} onItemClick={onCompareView} />}
          {items && <BasicMenu name="Add View" items={items} onItemClick={onAddView} />}
          <Button
            className="sm-Header-button"
            variant="contained"
            component="label"
          >
            Upload File
            <input
              onChange={onFileUpload}
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
