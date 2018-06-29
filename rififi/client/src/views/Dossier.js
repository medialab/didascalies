import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {getFile} from '../utils/client';
 
import Profile from '../components/Profile';
import Assemblee from '../components/Assemblee';

import {
  Container,
  Title
} from 'bloomer';

class App extends Component {

  static contextTypes = {
    listeDeputes: PropTypes.array,
    placesAssemblee: PropTypes.object,
  }

  constructor(props) {
    super(props);
    this.state = {
      data: undefined
    };
  }


  getData = dossierId => {
    getFile(`/dossiers/${dossierId}`)
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
      },
      context: {
        listeDeputes,
        placesAssemblee
      }
    } = this;

    return (
      <Container>
        <div>
          <Title>
            {dossierName}
          </Title>
            {
              data ?
                data
                .seances
                .map((seance, seanceIndex) => 
                  <div
                  key={seanceIndex} 
                  >
                    <Title isSize={2}>
                      Séance {seanceIndex + 1}
                    </Title>
                    <Profile
                    data={seance.interventions} />
                  </div>
                 )
                
              :
                'Chargement'
            }
            {
              listeDeputes && placesAssemblee &&
              <Assemblee
                listeDeputes={listeDeputes}
                placesAssemblee={placesAssemblee}
              />
            }
        </div>
      </Container>
    );
  }
}

export default App;
