import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TTip from 'react-tooltip';

import {getFile} from '../utils/client';
 
import Profile from '../components/Profile';
import Assemblee from '../components/Assemblee';
import DossierChrono from '../components/DossierChrono';
import LineChartContainer from '../components/LineChartContainer';

import {
  Button,
  Box,
  Container,
  Columns,
  Column,
  Title,
  Level,
  LevelLeft,
  LevelItem,
} from 'bloomer';

const capitalize = str => str[0].toUpperCase() + str.slice(1)

class Seance extends Component {

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
  componentWillReceiveProps = nextProps => {
    const {
        match: {
          params: {
            dossierId: prevId
          }
        }
    } = this.props;
    const {
        match: {
          params: {
            dossierId: nextId
          }
        }
    } = nextProps;



    if (prevId !== nextId) {
      this.getData(nextId);
    }
  }

  updateCurrentStep = (index/*, seanceIndex*/) => {
    const seanceIndex = this.props.match.params.seanceIndex - 1;
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
    this.updateCurrentStep(index);   
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
      },
      context: {
        listeDeputes,
        placesAssemblee,
        groupes
      },
      props: {
        match: {
          params: {
            seanceIndex,
            dossierId
          }
        },
        history,
      },
      handleOverStep,
      handleOutStep,
      handleUpdateState,
    } = this;

    const currentSeanceIndex = seanceIndex - 1;

    if (!data || !listeDeputes || currentSeanceIndex < 0 || currentSeanceIndex > data.seances.length) return null;

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
              <Title isSize={2}>
                {data.id_an ? <a target="blank" href={`https://www.lafabriquedelaloi.fr/articles.html?loi=15-${data.id_an}`}>
                  {capitalize(data.nom)}
                </a>
                : capitalize(data.nom)
              }
            </Title>}
            <Level>
              <LevelLeft>
              <LevelItem>
                <Title isSize={3}>
                  <Button onClick={() => history.push(`/dossier/${dossierId}/`)}>
                    Vue d'ensemble du dossier
                  </Button>
                </Title>
              </LevelItem>
              {
                prevSeance &&
                <LevelItem>
                  <Title isSize={2}>
                    <Button onClick={() => history.push(`/dossier/${dossierId}/seance/${currentSeanceIndex - 1 + 1}`)}>
                      {'<'} Séance précédente ({currentSeanceIndex - 1 + 1}) {/*du {new Date(`${prevSeance.interventions[0].date} ${prevSeance.interventions[0].moment}`).toLocaleString()}*/}
                    </Button>
                  </Title>
                </LevelItem>
              }
              {
                nextSeance &&
                <LevelItem>
                  <Title isSize={2}>
                    <Button onClick={() => history.push(`/dossier/${dossierId}/seance/${currentSeanceIndex + 1 + 1}`)}>
                      Séance suivante ({currentSeanceIndex + 1 + 1}) {/*du {new Date(`${nextSeance.interventions[0].date} ${nextSeance.interventions[0].moment}`).toLocaleString()}*/} >
                    </Button>
                  </Title>
                </LevelItem>
              }
              </LevelLeft>
            </Level>
              
            {
              data ?
                data
                .seances
                .filter((d, i) => i === currentSeanceIndex)
                .map((seance, seanceIndex) => {
                  const date = `${seance.interventions[0].date} ${seance.interventions[0].moment}`;

                  return (<Box
                  key={seanceIndex} 
                  >
                    <Title isSize={3}>
                      Séance ({currentSeanceIndex + 1 }) du {new Date(date).toLocaleString()}
                    </Title>
                    
                    <Profile
                    onUpdateStep={handleUpdateState}
                    currentStep={currentStep}
                    seanceIndex={seanceIndex}
                    onHover={handleOverStep}
                    onOut={handleOutStep}
                    id={seanceIndex}
                    seance={seance} />
                  </Box>
                 )
                })
                
              :
                'Chargement'
            }
            
            </Column>
            <Column style={{position: 'fixed', left: '66%', top: '5rem'}} isSize={4}>
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
                  style={{height: '20rem', overflow: 'auto'}}
                  dangerouslySetInnerHTML={{
                    __html: currentStepData.type === 'elocution' ? 
                              currentStepData.intervention : `<i>${currentStepData.didascalie}</i>`
                  }}
                />
              </div> : null
            }

            </Column>
        </Columns>
        <TTip id="ttip" />
      </Container>
    );
  }
}

export default Seance;
