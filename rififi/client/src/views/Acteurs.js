import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TTip from 'react-tooltip';

import {extent, mean} from 'd3-array';
import * as scales from 'd3-scale';

import {getFile} from '../utils/client';
 
import Profile from '../components/Profile';
import Assemblee from '../components/Assemblee';
import DossierChrono from '../components/DossierChrono';
import LineChartContainer from '../components/LineChartContainer';

import ActorsSpace from '../components/ActorsSpace';
import OrateurMark from '../components/OrateurMark';

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

class Acteurs extends Component {

  static contextTypes = {
    listeDeputes: PropTypes.array,
    placesAssemblee: PropTypes.object,
    groupes: PropTypes.object,
  }

  constructor(props) {
    super(props);
    this.state = {
      orateurs: undefined
    };
  }


  getData = () => {
    getFile(`orateurs.json`)
    .then(orateurs => {
        this.setState({
          orateurs,
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

    this.getData();
  }
  


  render = () => {
    const {
      state: {
        orateurs,
        highlightedParlementaires = []
      },
      context: {
        listeDeputes,
        placesAssemblee,
        groupes
      },
    } = this;

    if (!orateurs) return null;

    const orateursList = Object.keys(orateurs).map(k => orateurs[k]).slice(0, 500);

    const orateursScales = CONFIG.statsVals
      .reduce((res, key) => ({
        ...res,
        [key]: scales.scaleLinear().range([0.1, 1]).domain(extent(orateursList, d => d.stats[key]))
      }) , {});
    const statsMeans = CONFIG.statsVals
      .reduce((res, key) => ({
        ...res,
        [key]: mean(orateursList, d => d.stats[key])
      }) , {});


    const handleHover = name => {
      this.setState({
        highlightedParlementaires: [name]
      })
    }
    return (
      <Container>
          
        <Columns>
          <Column isSize={8}>
            <ActorsSpace
              colors={CONFIG.eventsColors} 
              orateurs={orateursList}
              groups={CONFIG.parlementaryGroups}
              beginingGroups={CONFIG.parlementaryGroups.slice(0, 2)}
              onHover = {handleHover}
            />
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
            highlightedParlementaires ?
            <Column>
              {
                highlightedParlementaires.map(nom => {
                  let dep = listeDeputes.find(d => d.depute.nom === nom);
                  const orateur = orateurs[nom];
                  dep = dep ? dep.depute : {};
                  const values = CONFIG.statsVals.reduce((res, key) => ({
                              ...res,
                              [key]: {
                                absolute: orateur.stats[key],
                                relative: orateursScales[key](orateur.stats[key])
                              }
                            }), {});
                  return (
                    <Column key={nom}
                    >
                      <Title isSize={4}>{nom} ({orateur.groupes.join()})</Title>

                      <Columns>
                        <Column isSize={2}>
                          <img src={`https://www.nosdeputes.fr/depute/photo/${dep.slug}/60`} />
                        </Column>
                        <Column>
                          <div>
                            {dep.nom_circo}
                          </div>
                          <div>
                            {dep.parti_ratt_financier}
                          </div>
                          <div>
                            {dep.profession}
                          </div>
                          <div>
                            <a target="blank" href={dep.url_nosdeputes}>
                              Lien nos députés
                            </a>
                          </div>
                        </Column>
                      </Columns>
                      <Column>
                          
                        <div>
                        <Columns>
                          <Column isSize={2}><svg style={{display: 'inline', height:'40px', width: '40px'}}>
                            <g transform={`translate(20, 40)scale(15)rotate(-135)`}>
                            <OrateurMark
                              colors={CONFIG.eventsColors}
                              name={orateur.nom}
                              values={values}
                            />
                            </g>
                          </svg></Column>
                          <Column isSize={10}>
                            <div>
                              {values.attaques_recues.absolute > statsMeans.attaques_recues ? 'Plus attaqué que la moyenne' : 'Moins attaqué que la moyenne'}
                            </div>
                            <div>
                              {values.soutiens_recus.absolute > statsMeans.soutiens_recus ? 'Plus soutenu que la moyenne' : 'Moins sountenu que la moyenne'}
                            </div>
                            <div>
                              {values.invectivite.absolute > statsMeans.invectivite ? 'Plus invectif que la moyenne' : 'Moins invectif que la moyenne'}
                            </div>
                            <div>
                              A pris la parole {orateur.count} fois durant la législature, dont {orateur.stats.invectivite} invectives (phrases courtes exclamatives)
                            </div>
                          </Column>
                        </Columns>
                        </div>
                      </Column>
                        
                    </Column>
                  )
                })
              }
            </Column>
          : null}

          </Column>
        </Columns>
        <TTip id="mark" />
      </Container>
    );
  }
}

export default Acteurs;
