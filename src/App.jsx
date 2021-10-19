import React from 'react';
import './app.scss';

import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Header from './components/Header';

function App() {
  return (
    <React.Fragment>
      <Header />
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Dashboard} />
        </Switch>
      </BrowserRouter>
    </React.Fragment>
  );
}

export default App;
