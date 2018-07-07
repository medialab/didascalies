import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {max, extent} from 'd3-array';
import {scaleLinear} from 'd3-scale';
const {BarChart} = require('react-d3-components');
import {
  Button,
  Hero,
  HeroBody,
  Container,
  Columns,
  Title,
  Form,
  Field,
  Card,
  Input,
  CardContent,
  CardHeader,
  CardHeaderTitle,
  Label,
  Level,
  Control,
  Radio,
  Column,
  Select,
} from 'bloomer';

import {
  Link
} from 'react-router-dom';


import DossierCard from '../components/DossierCard';
import RadarContainer from '../components/RadarContainer';
import BarChartContainer from '../components/BarChartContainer';

export default class Liste extends Component {

  static contextTypes = {
    dossiers: PropTypes.object
  }

  constructor(props) {
    super(props);
    this.state = {
      searchStr: '',
      sortMode: 'nb_seances'
    }
  }

  goSort = (items, mode) => {
    return items.sort((a, b) => {
      switch(mode) {
        case 'nb_seances':
          if (a.nb_seances < b.nb_seances) {
            return 1;
          }
          return -1;
        case 'pc_interruptions':
          if (a.pc_interruptions < b.pc_interruptions) {
            return 1;
          }
          return -1;
        case 'hilarite':
          if (a.nb_rires / a.nb_mots < b.nb_rires / b.nb_mots) {
            return 1;
          }
          return -1;
        case 'circulation':
          if (a.nb_orateurs / a.nb_interv > b.nb_orateurs / b.nb_interv) {
            return -1;
          }
          return 1;
        case 'title':
        default:
          if (a.nom > b.nom) {
            return 1;
          }
          return -1;
      }
    })
  }

  render = () => {
    const {
      state: {
        sortMode,
        searchStr = '',
        highlightedDossier,
        hoveredDossier,
      },
      context: {
        dossiers
      },
      goSort
    } = this;
    const dossiersList = Object.keys(dossiers)
      .map(key => dossiers[key]).filter(d => d && d.nb_seances)
    let visibleDossiersList = dossiersList
      .filter(d => searchStr.length ? d.nom.toLowerCase().indexOf(searchStr) > -1 : true)
    visibleDossiersList = goSort(visibleDossiersList, sortMode);

    const scalePos = scaleLinear().domain(extent(dossiersList, d => (d.nb_didasc_positives + d.nb_interruptions_positives) / d.nb_mots)).range([0, 1]);
    const scaleNeg = scaleLinear().domain(extent(dossiersList, d => (d.nb_interruptions_negatives + d.nb_didasc_negatives) / d.nb_mots)).range([0, 1]);
    const scaleRires = scaleLinear().domain(extent(dossiersList, d => d.nb_rires / d.nb_mots)).range([0, 1]);
    const scaleMurmures = scaleLinear().domain(extent(dossiersList, d => d.nb_murmures / d.nb_mots)).range([0, 1]);
    // const scaleCirculation = scaleLinear().domain(extent(dossiersList, d => d.nb_orateurs / d.nb_interv)).range([0, 1]);
    const scaleInterruptions = scaleLinear().domain(extent(dossiersList, d => d.pc_interruptions)).range([0, 1]);
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
        'interruptions', 
        label: 'Taux d\'animation',
      },
      // {
      //   key: 
      //   'circulation', 
      //   label: 'Circulation de la parole',
      // },
    ];

    const radarData = {
      variables: radarVariables,
      sets: visibleDossiersList
      .filter(d => {
        if (hoveredDossier) {
          return d.id === hoveredDossier;
        }
        return true;
      })
      .map(d => {
        return {
          key: d.id,
          label: d.nom,
          values: {
            pct_soutien: scalePos((d.nb_didasc_positives + d.nb_interruptions_positives) / d.nb_mots),
            pct_agression: scaleNeg((d.nb_didasc_negatives + d.nb_interruptions_negatives) / d.nb_mots),
            rires: scaleRires(d.nb_rires / d.nb_mots),
            murmures: scaleMurmures(d.nb_murmures / d.nb_mots),
            // circulation: scaleCirculation(d.nb_orateurs / d.nb_interv),
            interruptions: scaleInterruptions(d.pc_interruptions),
          }
        }
      })
    };


    const onRadarHover = point => {
      this.setState({
        highlightedDossier: point ? point.setKey : undefined
      })
    };
    const onDossierOver = dossier => {
      this.setState({
        hoveredDossier: dossier.id
      })
    }
    const onDossierOut = dossier => {
      this.setState({
        hoveredDossier: undefined,
      })
    }
    return (
      <Container> 
      <Columns>
      <Column isSize={4} style={{overflow: 'auto', position: 'fixed', top: '5rem', left: 0, height: 'calc(100% - 5rem)'}}>
          <Level>
            <Column>
              <form>
                <Field>
                  <Input placeholder={'chercher un dossier'} value={searchStr} onChange={e => this.setState({searchStr: e.target.value})} />
                </Field>
                {<Field>
                <Label>Trier par</Label>
                    <Control>
                        <Select value={sortMode} onChange={e => this.setState({sortMode: e.target.value})}>
                          <option value={'title'} checked={sortMode === 'title'}>
                            titre
                          </option>
                          <option value={'nb_seances'} checked={sortMode === 'nb_seances'}>
                            nombre de séances
                          </option>
                          <option value={'pc_interruptions'} checked={sortMode === 'pc_interruptions'}>
                            animation
                          </option>
                          <option value={'circulation'} checked={sortMode === 'circulation'}>
                            circulation de la parole
                          </option>
                          <option value={'hilarite'} checked={sortMode === 'hilarite'}>
                            hilarité
                          </option>
                        </Select>
                    </Control>
                </Field>}
                 
              </form>
            </Column>
          </Level>
          
          {visibleDossiersList.length > 0 && 
          <Level>
            <Column>
              <RadarContainer 
                domainMax={1} 
                data={radarData} 
                highlighted={highlightedDossier}
                onHover={onRadarHover}
              />
             {highlightedDossier && <Button onClick={() => onRadarHover(undefined)}>
                  Réinitialiser
                </Button>}
            </Column>
          </Level>
          }
        </Column>
        <Column isSize={8} isOffset={4}>
          {
            visibleDossiersList
            .filter(d => {
              if (highlightedDossier) {
                return d.id === highlightedDossier;
              } else return true;
            })
            .map((dossier, index) => {
              return (
                <DossierCard onMouseOver={onDossierOver} onMouseOut={onDossierOut} dossier={dossier} key={index} />
              )
            })
          }
          </Column>
        </Columns>
      </Container>
    )
  }
}