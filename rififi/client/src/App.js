import React, { Component } from 'react';
import TTip from 'react-tooltip';

import {getFile} from './utils/client';
 
import Layout from './views/Layout';
import Home from './views/Home';
import Dossier from './views/Dossier';
import Seance from './views/Seance';
import Liste from './views/Liste';
import Acteurs from './views/Acteurs';
import Methodologie from './views/Methodologie';
import APropos from './views/APropos';

import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
} from 'react-router-dom';


import 'bulma/css/bulma.css'

import './App.scss';

class App extends Component {
  render = () => {

    return (<Router>
        <Layout>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/liste" component={Liste} />
            <Route exact path="/dossier/:dossierId" component={Dossier} />
            <Route exact path="/dossier/:dossierId/seance/:seanceIndex" component={Seance} />
            <Route exact path="/acteurs" component={Acteurs} />
            <Route exact path="/methodologie" component={Methodologie} />
            <Route exact path="/a-propos" component={APropos} />
          </Switch>
        </Layout>
      </Router>);
  }
}

export default App;
