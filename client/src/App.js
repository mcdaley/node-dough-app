import React      from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
}                 from "react-router-dom"

import AppBarWithRouter     from './components/navbar/navbar'
import Home       from './pages/home/home-page'
import Accounts   from './pages/accounts/accounts-page'
import About      from './pages/about/about-page'

import './App.css';

function App() {
  return (
    <div className="App">
      <Router>
        <AppBarWithRouter />

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/home"     exact component={Home} />
          <Route path="/accounts" exact component={Accounts} />
          <Route path="/about"    exact component={About} />
          <Route path="/"         component={Home} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
