import React from 'react';
import './app.scss';

import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <React.Fragment>
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Dashboard} />
        </Switch>
      </BrowserRouter>
    </React.Fragment>
  );
}

export default App;
