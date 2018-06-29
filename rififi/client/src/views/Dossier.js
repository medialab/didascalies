import React, { Component } from 'react';
import TTip from 'react-tooltip';

import {getFile} from '../utils/client';
 
import Profile from '../components/Profile';


import {
  Container,
  Title
} from 'bloomer';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: undefined
    };
  }


  getData = dossierId => {
    getFile(dossierId)
    .then(data => {
        this.setState({
          data: data,
          dossierName: dossierId
        })
      })
      .catch(console.error)
  }

  componentDidMount() {

    const {
      props: {
        match: {
          params: {
            dossierId
          }
        }
      }
    } = this;

    this.getData(dossierId);
  }


  render = () => {
    const {
      state: {
        data,
        dossierName,
      }
    } = this;

    return (
      <Container>
        <article>
        <div>
        <Title>
          {dossierName}
        </Title>
          {
            data ?
              <Profile 
              title={dossierName}
               data={data} />
            :
              'Chargement'
          }
          </div>
        </article>
        <TTip place="top" id="annotation" />
      </Container>
    );
  }
}

export default App;
