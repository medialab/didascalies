import React, { Component } from 'react';
import get from 'axios'
import TTip from 'react-tooltip';


import Profile from './components/Profile';

import './App.css';

const getFile = file =>  new Promise((resolve, reject) => {
  get(`http://localhost:8000/${file}`, {
      credentials: 'include'
    }).then(({data}) => resolve(data))
      .catch(reject)
})

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      dossiers: []
    };
  }

  componentDidMount() {
    getFile('liste.txt')
      .then(str => {
        this.setState({
          dossiers: str.split('\n').map(s => s.trim())
        })
      })
      .catch(console.error)
  }

  getData = dossier => {
    getFile(dossier)
    .then(data => {
        this.setState({
          data: data,
          dossier
        })
      })
      .catch(console.error)
  }

  render = () => {
    const {
      state: {
        dossiers,
        data,
        dossier
      },
      getData
    } = this;
    return (
      <div className="App">
        <aside
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '20%',
            height: '100%',
            overflow: 'auto'
          }}
        >
          <ul>
            {
              dossiers.map((dossier, index) => {
                const onClick = () => getData(dossier);
                return <li key={index}>
                  <button onClick={onClick}>
                    {dossier}
                  </button>
                </li>
              })
            }
          </ul>
        </aside>
        <article
          style={{
            position: 'fixed',
            left: '20%',
            top: 0,
            width: '80%',
            height: '100%',
            overflow: 'auto'
          }}
        >
        <div
        style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            overflow: 'auto'
          }}
          >
          {
            data ?
              <Profile 
              title={dossier}
              style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            overflow: 'auto'
          }} data={data} />
            :
              'Cliquer sur un texte sur la gauche'
          }
          </div>
        </article>
        <TTip place="top" id="annotation" />
      </div>
    );
  }
}

export default App;
