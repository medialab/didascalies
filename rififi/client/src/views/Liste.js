import React, { Component } from 'react';
import PropTypes from 'prop-types';
const {LineChart} = require('react-d3-components');
import {
  Hero,
  HeroBody,
  Container,
  Title,
  Form,
  Field,
  Card,
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
        sortMode
      },
      context: {
        dossiers
      },
      goSort
    } = this;
    const dossiersList = Object.keys(dossiers).map(key => dossiers[key]).filter(d => d && d.nb_seances);
    return (
      <Container> 
      <Level>
        <form>
          <Field>
              <Control value={sortMode}>
                  <Radio onClick={() => this.setState({sortMode: 'title'})} checked={sortMode === 'title'} name="title">Titre</Radio>
                  <Radio onClick={() => this.setState({sortMode: 'nb_seances'})} checked={sortMode === 'nb_seances'} name="nb_seances">Nombre de séances</Radio>
                  <Radio onClick={() => this.setState({sortMode: 'pc_interruptions'})} checked={sortMode === 'pc_interruptions'} name="pc_interruptions">% d'interruptions</Radio>
              </Control>
          </Field>
        </form>
      </Level>
      {
        goSort(dossiersList, sortMode)
        .map((dossier, index) => {
          return (
            <Column key={index}>
              <Card>
                <CardHeader>
                    <CardHeaderTitle>
                        <Title>
                         <Link to={`/dossier/${dossier.id}`}> {dossier.nom}</Link>
                        </Title>
                    </CardHeaderTitle>
                </CardHeader>
                
                <CardContent>
                    <div>
                    {dossier.nb_seances} séance{dossier.nb_seances > 1 ? 's': ''}
                  </div>
                  <div>
                    {parseInt(dossier.pc_interruptions * 100)}% d'interruptions
                  </div>
                  {dossier.profile_interruptions.length > 1 && <LineChart
                      data={{
                        label: '',
                        values: dossier.profile_interruptions.map((s, i) => ({
                          x: i,
                          y: s * 100
                        })),
                      }
                      }
                      width={1000}
                      height={200}
                      yAxis={{
                        label: "interruptions",
                        tickValues: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100],
                        tickFormat: x => { return parseInt(x) + '%'; }
                      }}
                      
                      xAxis={{
                        label: "séances du débat",
                        tickValues: dossier.profile_interruptions.map((s, i) => i),
                        tickFormat: x => { return parseInt(x); }
                      }}
                      margin={{top: 10, bottom: 50, left: 50, right: 10}}/>}
                    
                </CardContent>
              </Card>  
            </Column>
          )
        })
      }
      </Container>
    )
  }
}