import React, { Component } from 'react';
import TTip from 'react-tooltip';

import {getFile} from './utils/client';
 
import Layout from './views/Layout';
import Home from './views/Home';
import Dossier from './views/Dossier';

import 'bulma/css/bulma.css'


import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
} from 'react-router-dom';

import './App.css';

class App extends Component {
  render = () => {

    return (<Router>
        <Layout>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/dossier/:dossierId" component={Dossier} />
          </Switch>
        </Layout>
      </Router>);
  }
}

export default App;
