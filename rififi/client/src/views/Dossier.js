import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {getFile} from '../utils/client';
 
import Profile from '../components/Profile';
import Assemblee from '../components/Assemblee';
import DossierChrono from '../components/DossierChrono';

import {
  Button,
  Container,
  Columns,
  Column,
  Title,
  Level,
} from 'bloomer';

class App extends Component {

  static contextTypes = {
    listeDeputes: PropTypes.array,
    placesAssemblee: PropTypes.object,
    groupes: PropTypes.object,
  }

  constructor(props) {
    super(props);
    this.state = {
      data: undefined,
      currentStep: 0,
      seanceIndex: 0,
      currentSeanceIndex: 0,
    };
  }


  getData = dossierId => {
    getFile(`dossiers/${dossierId}.json`)
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
  componentWillReceiveProps = () => {
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

  updateCurrentStep = (index, seanceIndex) => {
    const step = this.state.data.seances[seanceIndex].interventions[index];
    const {type, parlementaire, groupes} = step;
    if (type === 'elocution') {
      this.setState({
        highlightedParlementaires: [parlementaire],
        currentStep: index,
        currentSeanceIndex: seanceIndex
      })
    } else if (type === 'didascalie') {
      const {
        listeDeputes
      } = this.context;
      const deputes = groupes.reduce((result, groupeId) => 
          result.concat(
            listeDeputes
            .filter(d => {
              return d.depute.groupe_sigle === groupeId
            })
            .map(d => d.depute.nom)
          )
      , []);
      this.setState({
        highlightedParlementaires: deputes,
        currentStep: index,
        currentSeanceIndex: seanceIndex
      })
    }
  }

  handleOverStep = (step, index, seanceIndex) => {
    this.updateCurrentStep(index, seanceIndex);   
  }

  handleOutStep = () => {
    // this.setState({
    //   highlightedParlementaires: undefined
    // })
  }

  handleUpdateState = (index, seanceIndex) => {

    const seances = this.state.data.seances[seanceIndex].interventions;
    if (index + 1 < seances.length) {
      this.updateCurrentStep(index, seanceIndex);
    }
  }


  render = () => {
    const {
      state: {
        data,
        dossierName,
        highlightedParlementaires,
        currentStep,
        currentSeanceIndex,
      },
      context: {
        listeDeputes,
        placesAssemblee,
        groupes
      },
      handleOverStep,
      handleOutStep,
      handleUpdateState,
    } = this;

    if (!data || !listeDeputes) return null;

    const nextSeance = currentSeanceIndex + 1 < data.seances.length ? data.seances[currentSeanceIndex + 1] : undefined;
    const prevSeance = currentSeanceIndex - 1 >= 0 ? data.seances[currentSeanceIndex - 1] : undefined;

    let currentStepData = currentStep !== undefined && currentSeanceIndex !== undefined ? data.seances[currentSeanceIndex].interventions[currentStep] : undefined;
    let currentDepute;
    if (currentStepData && currentStepData.type !== 'didascalie') {
      currentDepute = listeDeputes.find(d => d.depute.nom === currentStepData.parlementaire);
    }

    return (
      <Container>
          
        <Columns>
          <Column isSize={8}>
            {data &&
              <Title isSize={1}>
                {data.id_an ? <a target="blank" href={`https://www.lafabriquedelaloi.fr/articles.html?loi=15-${data.id_an}`}>
                  {data.nom}
                </a>
                : data.nom
              }
            </Title>}
            <Column>
              <Title isSize={3}>
                Évolution du pourcentage d'interruptions entre les séances
              </Title>
              {
                data && data.seances.length > 1 &&
                <DossierChrono seances={data.seances} />
              }
            </Column>
            <Columns>
              {
                prevSeance &&
                <Column>
                  <Title isSize={2}>
                    <Button onClick={() => this.setState({currentSeanceIndex: currentSeanceIndex - 1})}>
                      {'<'} Séance précédente ({currentSeanceIndex - 1 + 1}) du {new Date(`${prevSeance.interventions[0].date} ${prevSeance.interventions[0].moment}`).toLocaleString()}
                    </Button>
                  </Title>
                </Column>
              }
              {
                nextSeance &&
                <Column>
                  <Title isSize={2}>
                    <Button onClick={() => this.setState({currentSeanceIndex: currentSeanceIndex + 1})}>
                      > Séance suivante ({currentSeanceIndex + 1 + 1}) du {new Date(`${nextSeance.interventions[0].date} ${nextSeance.interventions[0].moment}`).toLocaleString()}
                    </Button>
                  </Title>
                </Column>
              }
            </Columns>
              
            {
              data ?
                data
                .seances
                .filter((d, i) => i === currentSeanceIndex)
                .map((seance, seanceIndex) => {
                  const date = `${seance.interventions[0].date} ${seance.interventions[0].moment}`;

                  return (<Column
                  key={seanceIndex} 
                  >
                    <Title isSize={2}>
                      Séance ({currentSeanceIndex + 1 }) du {new Date(date).toLocaleString()}
                    </Title>
                    <Profile
                    onUpdateStep={handleUpdateState}
                    currentStep={currentStep}
                    seanceIndex={seanceIndex}
                    onHover={handleOverStep}
                    onOut={handleOutStep}
                    id={seanceIndex}
                    data={seance.interventions} />
                  </Column>
                 )
                })
                
              :
                'Chargement'
            }
            
            </Column>
            <Column style={{position: 'fixed', left: '66%', top: '10rem'}} isSize={4}>
            {
              listeDeputes && placesAssemblee &&
              <Assemblee
                listeDeputes={listeDeputes}
                placesAssemblee={placesAssemblee}
                groupes={groupes}
                highlight={highlightedParlementaires}
              />
            }
            {
              currentStepData ?
              <div>
                {currentStepData.type !== 'didascalie' && <Title isSize={3}>
                  {`${currentStepData.parlementaire !== 'NULL' ?
                    currentStepData.parlementaire :
                    currentStepData.nom
                  } (${currentStepData.groupes.join()})`}
                </Title>}
                {
                  
                  currentDepute ?
                    <img src={`https://www.nosdeputes.fr/depute/photo/${currentDepute.depute.slug}/60`} />
                  : null
                  
                }

                <div
                  dangerouslySetInnerHTML={{
                    __html: currentStepData.type === 'elocution' ? 
                              currentStepData.intervention : `<i>${currentStepData.didascalie}</i>`
                  }}
                />
              </div> : null
            }

            </Column>
        </Columns>
      </Container>
    );
  }
}

export default App;
