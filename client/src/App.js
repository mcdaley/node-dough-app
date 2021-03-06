import React                from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
}                           from 'react-router-dom'

import AppBarWithRouter     from './components/ui/navbar/Navbar'
import Home                 from './pages/home/home-page'
import PagesAccountsIndex   from './pages/accounts/Index'
import PagesAccountsShow    from './pages/accounts/Show'
import About                from './pages/about/about-page'

/**
 * Dough App
 */
function App() {
  return (
    <div className="App">
      <Router>
        <AppBarWithRouter />

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/home"               exact component={Home} />
          <Route path="/accounts/list"      exact component={PagesAccountsIndex} />
          <Route path="/accounts/show/:id"  exact component={PagesAccountsShow} />
          <Route path="/about"              exact component={About} />
          <Route path="/"                   component={Home} />
        </Switch>
      </Router>
    </div>
  );
}

// Export the app.
export default App;
