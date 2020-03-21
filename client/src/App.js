import React      from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
}                 from "react-router-dom"

import Home       from './pages/home/home-page'
import Accounts   from './pages/accounts/accounts-page'
import About      from './pages/about/about-page'

//* import logo       from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <Router>
        <div>
          <nav>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/accounts">Accounts</Link>
              </li>
              <li>
                <Link to="/about">About</Link>
              </li>
            </ul>
          </nav>

          {/* A <Switch> looks through its children <Route>s and
              renders the first one that matches the current URL. */}
          <Switch>
            <Route path="/accounts">
              <Accounts />
            </Route>
            <Route path="/about">
              <About />
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </div>
      </Router>
    </div>
  );
}

export default App;
