import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TTip from 'react-tooltip';

import {scaleLinear} from 'd3-scale';
import {extent} from 'd3-array';

import {getFile} from '../utils/client';
 
import Profile from '../components/Profile';
import Assemblee from '../components/Assemblee';
import DossierChrono from '../components/DossierChrono';
import LineChartContainer from '../components/LineChartContainer';
import ActorsSpace from '../components/ActorsSpace';
import RadarContainer from '../components/RadarContainer';

import {
  Button,
  Box,
  Container,
  Columns,
  Column,
  Title,
  Level,
} from 'bloomer';

const capitalize = str => str[0].toUpperCase() + str.slice(1)

class App extends Component {

  static contextTypes = {
    listeDeputes: PropTypes.array,
    placesAssemblee: PropTypes.object,
    groupes: PropTypes.object,
    dossiers: PropTypes.object,
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
    const seanceIndex = this.state.currentSeanceIndex;
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
        currentSeanceIndex,
      },
      context: {
        listeDeputes,
        placesAssemblee,
        groupes,
        dossiers,
      },
      props: {
        match: {
          params: {
            dossierId,
          }
        },
        history,
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

    const dossiersList = Object.keys(dossiers || {})
      .map(key => dossiers[key]).filter(d => d && d.nb_seances)
    let visibleDossiersList = dossiersList;
    
    const scalePos = scaleLinear().domain(extent(dossiersList, d => (d.nb_didasc_positives + d.nb_interruptions_positives) / d.nb_mots)).range([0, 1]);
    const scaleNeg = scaleLinear().domain(extent(dossiersList, d => (d.nb_interruptions_negatives + d.nb_didasc_negatives) / d.nb_mots)).range([0, 1]);
    const scaleRires = scaleLinear().domain(extent(dossiersList, d => d.nb_rires / d.nb_mots)).range([0, 1]);
    const scaleMurmures = scaleLinear().domain(extent(dossiersList, d => d.nb_murmures / d.nb_mots)).range([0, 1]);
    const scaleCirculation = scaleLinear().domain(extent(dossiersList, d => d.nb_orateurs / d.nb_interv)).range([0, 1]);
    const radarVariables = [
      {
        key: 'pct_soutien', 
        label: 'Réactions de soutien',
      },
      
      {
        key: 
        'rires', 
        label: 'Rires et sourires',
      },
      {
        key: 
        'murmures', 
        label: 'Murmures',
      },
      {
        key: 'pct_agression', 
        label: 'Réactions d\'agression',
      },
      {
        key: 
        'circulation', 
        label: 'Circulation parole',
      },
    ];

    const radarData = {
      variables: radarVariables,
      sets: [data]
      .map(d => {
        return {
          key: d.id,
          label: d.nom,
          values: {
            pct_soutien: scalePos((d.nb_didasc_positives + d.nb_interruptions_positives) / d.nb_mots),
            pct_agression: scaleNeg((d.nb_didasc_negatives + d.nb_interruptions_negatives) / d.nb_mots),
            rires: scaleRires(d.nb_rires / d.nb_mots),
            murmures: scaleMurmures(d.nb_murmures / d.nb_mots),
            circulation: scaleCirculation(d.nb_orateurs / d.nb_interv),
          }
        }
      })
    };

    return (
      <Container>
          
        <Columns>
          <Column isSize={8}>
            {data &&
              <Title isSize={3}>
                {data.id_an ? <a target="blank" href={`https://www.lafabriquedelaloi.fr/articles.html?loi=15-${data.id_an}`}>
                  {capitalize(data.nom)}
                </a>
                : capitalize(data.nom)
              }
            </Title>}
            <Title isSize={2}>
              <Button isColor={'primary'} onClick={() => history.push(`/dossier/${dossierId}/seance/1`)}>
                Consulter les séances
              </Button>
            </Title>
            {
                data && data.seances.length > 1 &&
              <Column>
                <Title isSize={3}>
                  Évolution du pourcentage d'animation entre les séances
                </Title>
                <DossierChrono seances={data.seances} />
              </Column>
            }
            <Column>
              <Title isSize={3}>
                  Acteurs des débats
                </Title>
              <ActorsSpace
                colors={CONFIG.eventsColors} 
                orateurs={Object.keys(data.orateurs).map(k => data.orateurs[k])}
                groups={CONFIG.parlementaryGroups}
              />
            </Column>
          </Column>
          <Column isSize={4}>
            <RadarContainer 
              domainMax={1} 
              data={radarData} 
            />
            <Column>
              <Title isSize={4}>
                Séances
              </Title>
              {
                data.seances.map((seance, seanceIndex) => {
                  return <Level>
                  <Button key={seanceIndex} isColor={'info'} onClick={() => history.push(`/dossier/${dossierId}/seance/${seanceIndex + 1}`)}>
                      Séance du {new Date(`${seance.interventions[0].date} ${seance.interventions[0].moment}`).toLocaleString()}
                    </Button>
                    </Level>
                })
              }
            </Column>
          </Column>
          
        </Columns>
        <TTip id="ttip" />
      </Container>
    );
  }
}

export default App;
