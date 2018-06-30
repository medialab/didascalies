import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {max} from 'd3-array';
import {scaleLinear} from 'd3-scale';
const {BarChart} = require('react-d3-components');
import {
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
  Level,
  Control,
  Radio,
  Column,
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
        case 'circulation':
          if (a.nb_orateurs / a.nb_interv > b.nb_orateurs / b.nb_interv) {
            return 1;
          }
          return -1;
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
    const maxPctPositif = max(dossiersList, d => d.nb_didasc_positives / d.nb_mots);
    const maxPctNegatif = max(dossiersList, d => d.nb_interruptions / d.nb_mots)
    const maxPctNeutre = max(dossiersList, d => d.nb_didasc_neutres / d.nb_mots)
    const maxNbSeances = max(dossiersList, d => d.nb_seances)

    const scalePos = scaleLinear().domain([0, maxPctPositif]).range([0, 1]);
    const scaleNeg = scaleLinear().domain([0, maxPctNegatif]).range([0, 1]);
    const scaleNeutre = scaleLinear().domain([0, maxPctNeutre]).range([0, 1]);

    const radarData = {
      variables: [
        {key: 'pct_positif', label: 'Réactions positives'},
        {key: 'pct_interruptions', label: 'Interruptions'},
        {key: 'pct_neutre', label: 'Réactions diverses'},
      ],
      sets: visibleDossiersList.map(d => {
        return {
          key: d.id,
          label: d.nom,
          values: {
            pct_positif: scalePos(d.nb_didasc_positives / d.nb_mots),
            pct_interruptions: scaleNeg(d.nb_interruptions / d.nb_mots),
            pct_neutre: scaleNeutre(d.nb_didasc_neutres / d.nb_mots),
          }
        }
      })
    };
    // const barData =  [{
    //     label: 'somethingA',
    //     values: [{x: 'SomethingA', y: 10}, {x: 'SomethingB', y: 4}, {x: 'SomethingC', y: 3}]
    // }];
    const barData = [{
      label: 'Longueur des débats',
      values: visibleDossiersList.map((d, i) => ({
        x: 'd'+i,
        y: d.nb_seances
      })),

    }];
    return (
      <Container> 
      <Columns>
      <Column isSize={4} style={{overflow: 'auto', position: 'fixed', top: '5rem', left: 0, height: 'calc(100% - 5rem)'}}>
          <Level>
            <form>
              <Field>
                <Input placeHolder={'chercher un dossier'} value={searchStr} onChange={e => this.setState({searchStr: e.target.value})} />
              </Field>
              <Field>
                  <Control value={sortMode}>
                      <Radio onClick={() => this.setState({sortMode: 'title'})} checked={sortMode === 'title'} name="title">Titre</Radio>
                      <Radio onClick={() => this.setState({sortMode: 'nb_seances'})} checked={sortMode === 'nb_seances'} name="nb_seances">Nombre de séances</Radio>
                      <Radio onClick={() => this.setState({sortMode: 'pc_interruptions'})} checked={sortMode === 'pc_interruptions'} name="pc_interruptions">% d'interruptions</Radio>
                      <Radio onClick={() => this.setState({sortMode: 'circulation'})} checked={sortMode === 'circulation'} name="circulation">Circulation de la parole (orateurs / nb interventions)</Radio>
                  </Control>
              </Field>
            </form>
          </Level>
          {barData[0].values.length ? 
          <Level>
            <Column>
              <Title isSize={4}>Nombre de séances</Title>
              <BarChartContainer 
                data={barData}
                xAxis={{tickArguments: []}}
                yAxis={{
                  label: "nb séances", 
                  tickArguments: [0, maxNbSeances],
                  tickFormat: d => parseInt(d)
                }}
              />
            </Column>
          </Level> : null}
          {visibleDossiersList.length > 0 && 
          <Level>
            <Column>
              <Title isSize={4}>Typologies de réactions</Title>
              <RadarContainer domainMax={1} data={radarData} />
            </Column>
          </Level>
          }
        </Column>
        <Column isSize={8} isOffset={4}>
          {
            visibleDossiersList
            .map((dossier, index) => {
              return (
                <DossierCard dossier={dossier} key={index} />
              )
            })
          }
          </Column>
        </Columns>
      </Container>
    )
  }
}