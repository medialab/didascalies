import React from 'react';
import {withSize} from 'react-sizeme';
import {LineChart} from 'react-d3-components';
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

import Radar from 'react-d3-radar';

class DossierCard extends React.Component {

  render() {
    const { 
      size: {width, monitorHeight},
      dossier,
      style,
      onMouseOver,
      onMouseOut,
      ...props
     } = this.props;


    const height = width / 5;
    return (
                <Column onMouseOver={() => onMouseOver(dossier)} onMouseOut={() => onMouseOut(dossier)}>
                  <Card>
                    <CardHeader>
                        <CardHeaderTitle>
                            <Title>
                              <Link to={`/dossier/${dossier.id}`}> {dossier.nom}</Link>
                            </Title>
                        </CardHeaderTitle>
                    </CardHeader>
                    
                    <CardContent>
                      <Level>
                        <div>
                          {dossier.nb_seances} séance{dossier.nb_seances > 1 ? 's': ''}
                        </div>
                        <div>
                          {dossier.nb_interv} interventions
                        </div>
                        <div>
                          {dossier.nb_orateurs} orateurs
                        </div>
                      </Level>
                      <Level>
                      {dossier.profile_interruptions.length > 1 && <LineChart
                          data={{
                            label: '',
                            values: dossier.profile_interruptions.map((s, i) => ({
                              x: i,
                              y: s * 100
                            })),
                          }
                          }
                          width={width * .9}
                          height={height}
                          yAxis={{
                            label: "animation",
                            tickValues: [0, 20, 40,60, 80, 100],
                            tickFormat: x => { return parseInt(x) + '%'; }
                          }}
                          
                          xAxis={{
                            label: "séances du débat",
                            tickValues: dossier.profile_interruptions.map((s, i) => i),
                            tickFormat: x => { return parseInt(x); }
                          }}
                          margin={{top: 10, bottom: 50, left: 50, right: 10}}/>}
                      </Level>
                        
                      <Level>


                      </Level>
                    </CardContent>
                  </Card>  
                </Column>
              )
  }
}

module.exports = withSize({
  // monitorWidth: true,
  // monitorHeight: true
})(DossierCard);

// module.exports = List;