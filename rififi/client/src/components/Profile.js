const React = require('react');
const scales = require('d3-scale');
const {extent} = require('d3-array');
const { withSize } = require('react-sizeme');
const TTip = require('react-tooltip');

const Bloomer = require('bloomer');
const {
  Button,
  Box,
  Column,
  Columns,
  Title,
  Tabs,
  TabList,
  Icon,
  Tab,
  TabLink,
  Radio,
} = Bloomer;

import OrateurMark from './OrateurMark';
import ActorsSpace from './ActorsSpace';
import LineChartContainer from './LineChartContainer';

const colors = CONFIG.eventsColors;

const groups = CONFIG.parlementaryGroups;

const isInvective = (step) => step.interruption;

const Rect = ({
  x, 
  y = 0,
  fill='transparent', 
  tip, 
  width = 0,
  height,
  onHover,
  onOut,
  active
}) =>
  <rect 
    onMouseOver={onHover} 
    onMouseOut={onOut} 
    data-html={true} 
    data-for='annotation' 
    title={tip} 
    stroke={active ? 'black': 'transparent'} 
    fill={fill} 
    width={width} 
    height={height} 
    x={x} 
    y={y} 
  />

const buildTipForIntervention = ({intervention, fonction, parlementaire, nom, parlementaire_groupe_acronyme}) => `
  <div>${parlementaire !== 'NULL' ? parlementaire : nom}${fonction ? ` (${fonction})` : ''}${parlementaire_groupe_acronyme !== 'NULL' ? ` (${parlementaire_groupe_acronyme})` : ''}</div>
  <div>${intervention}</div>
`;

class Profile extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      temporalite: 'sequentiel',
      playing: false,
      actorsMode: 'vis',
      globalMode: 'synopsis'
    }
  }

  toneToColor = ton => {
    switch(ton) {
      case 'positif':
        return colors.positif;
      case 'negatif':
        return colors.negatif;
      default:
        return colors.neutre;
    }
  }

  componentWillUpdate = (nextProps, nextState) => {
    if (nextState.playing) {
      setTimeout(() => {
        this.props.onUpdateStep((nextProps.currentStep || 0) + 1, nextProps.id)
      }, 2000)
    }
  }

  getColor = step => {
    if (step.type === 'elocution') {
      if (isInvective(step)) {
        return this.toneToColor(step.ton);
      }
      else return colors.intervention;
    }
    else return this.toneToColor(step.ton);
  }
  render() {
    const { 
      hasError, 
      size: {width, height, monitorHeight},
      id,
      seance, 
      onHover,
      onOut,
      style, 
      currentStep,
      seanceIndex,
      // ...props
    } = this.props;
    const {
      playing,
      actorsMode,
      globalMode
    } = this.state;
    const data = seance.interventions.map((d, i) => ({...d, index: i}));
    const {parlementaires, personalites} = seance;
    const {temporalite} = this.state;
    let headerStep = 0;

    const getLength = (step, wordsLength) => 
      temporalite === 'temporel' ?
      (
        step.type === 'elocution' && !isInvective(step) ? 
          step.intervention.split(/\s/).length 
          : wordsLength / 100
      ) / 5
      : 1;

    const realHeight = height < window.innerHeight && height > 0 ? height:  window.innerHeight / 5;

    const CELL = (realHeight) / groups.length || 10;
    const wordsLength = seance.nb_mots;

    const totalLength = temporalite === 'temporel' ?
      data.reduce((sum, step) => sum += getLength(step, wordsLength), 0)
      : data.length;
    const scaleX = scales.scaleLinear().domain([0, totalLength]).range([0, width * .9])
    let breakCount = 0;
    const seanceBreaks = data.reduce((result, datum, index) => {
      const nextDatum = index + 1 < data.length - 1 ? data[index + 1] : undefined;
      breakCount += getLength(datum, wordsLength);
      if (nextDatum && datum.seance_id !== nextDatum.seance_id) {
        return result.concat({
          x: breakCount
        })
      }
      return result;
    }, []);

    let summaryCount = 0;
    const summary = data.reduce((result, datum, index) => {
      const nextDatum = index + 1 < data.length - 1 ? data[index + 1] : undefined;
      summaryCount += getLength(datum, wordsLength);
      const prevTitre = datum.titre_complet && (datum.titre_complet.split('>')[1] || '').trim() ;
      const nextTitre = nextDatum && nextDatum.titre_complet &&  (nextDatum.titre_complet.split('>')[1] || '').trim();
      if (prevTitre !== nextTitre) {
        return result.concat({
          x: summaryCount,
          text: nextTitre
        })
      }
      return result;
    }, []);

    let lineStep = 0;
    let activeStep = 0;


    const getOrateursData = (orateursMap, nameAccessor) => {
      return Object.keys(orateursMap)
        .map(nom => {
          const count = orateursMap[nom];
          const int = data
            .map((d, index) => ({...d, index}))
            .filter(d => d.type !== 'didascalie' && d[nameAccessor] === nom);
          const stats = {
            attaques_recues: 0,
            agressivite: 0,
            soutiens_recus: 0,
            mots_prononces: 0
          }

          int.forEach((intervention) => {
            stats.mots_prononces += intervention.nb_mots;
            if (intervention.interruption) {
              stats.agressivite ++;
            }
            const next = intervention.index < data.length - 1 && data[intervention.index + 1];
            if (next) {
              if (next.type === 'elocution' && next.interruption) {
                stats.attaques_recues += 1 + next.groupes.length / 5;
              } else if (next.type === 'didascalie') {
                if (next.ton === 'negatif') {
                  stats.attaques_recues += 1 + next.groupes.length / 5;
                }
                stats.soutiens_recus += 1 + next.groupes.length /5;
              }
            }
          });

          return {
            nom,
            count,
            int,
            groupes: int[0].groupes,
            stats,
          }
        })
    }

    

    const orateursData = Object.keys(seance.orateursData || {})
    .map(k => seance.orateursData[k])
    .map(o => {
      const int = data
              .map((d, index) => ({...d, index}))
              .filter(d => d.type !== 'didascalie' && (d.nom === o.nom || d.parlementaire === o.nom));
      return {
        ...o,
        int
      }
    })
    .sort((a, b) => {
      if (a.count > b.count)
          return -1;
      return 1;
    });

    const statsVals = ['attaques_recues', 'invectivite', 'soutiens_recus', 'mots_prononces'];
    const orateursScales = statsVals
      .reduce((res, key) => ({
        ...res,
        [key]: scales.scaleLinear().range([0.1, 1]).domain(extent(orateursData, d => d.stats[key]))
      }) , {});

    let profileCount = 0;

    return (
      <div style={style}>
        <Tabs>
          <TabList>
              <Tab onClick={e => this.setState({globalMode: 'synopsis'})} isActive={globalMode === 'synopsis'}>
                  <TabLink>
                      <Icon isSize='small'><span className='fa fa-film' aria-hidden='true' /></Icon>
                      <span>Synopsis (déroulement temporel)</span>
                  </TabLink>
              </Tab>
              <Tab onClick={e => this.setState({globalMode: 'actors'})} isActive={globalMode === 'actors'}>
                  <TabLink>
                      <Icon isSize='small'><span className='fa fa-user' aria-hidden='true' /></Icon>
                      <span>Acteurs (orateurs et leur comportement)</span>
                  </TabLink>
              </Tab>
          </TabList>
        </Tabs>
        {
          globalMode === 'synopsis' ?
          <Column>
            <svg height={CELL * groups.length * 3} width={width}>
              <g transform={`translate(10, ${CELL * 10})scale(.8)`}>
                <g>
                  <text>Agrégé</text>
                   <g transform={`translate(${CELL * 10}, -${CELL})`}>
                    <line
                      y1={CELL * groups.length * 2 + CELL * 6}
                      y2={CELL * groups.length * 2 + CELL * 6}
                      x1={0}
                      x2={width * .9}
                      stroke={`lightgrey`}
                    />
                    {
                      data.map((step, i) => {
                        let x1;
                        let x2;
                        let y1;
                        let y2;
                        const next = i < data.length - 1 && data[i + 1];
                        if (!next) {
                          return null;
                        }
                        if (temporalite === 'sequentiel') {
                          x1 = scaleX(i);
                          x2 = scaleX(i + 1);

                        } else {
                          profileCount += getLength(step, wordsLength);
                          x1 = scaleX(profileCount);
                          x2 = scaleX(profileCount +  getLength(next, wordsLength));
                        }
                        y1 = CELL * groups.length * 2 + CELL * 6 - step.animation_rate * 500
                        y2 = CELL * groups.length * 2 + CELL * 6 - next.animation_rate * 500
                        return (
                          <line
                            key={i}
                            x1={x1}
                            x2={x2}
                            y1={y1}
                            y2={y2}
                            stroke={this.getColor(step)}
                          />
                        )
                      })
                    }

                    {
                      summary.map((step, index) => (
                        <g key={index} 
                          transform={`translate(${scaleX(step.x)}, 0)rotate(-45)`}
                        >
                          <text>
                            {step.text}
                          </text>
                        </g>
                      ))
                    }
                    {
                      summary.map((step, index) => (
                        <g key={index} 
                          transform={`translate(${scaleX(step.x)}, 0)`}
                        >
                          <line
                            x1={0}
                            x2={0}
                            y1={0}
                            strokeDasharray="5, 5" 
                            y2={CELL * groups.length * 2 + CELL * 6}
                            stroke={'lightgrey'}
                          />
                        </g>
                      ))
                    }
                    {data.map((step, index2) => {
                      const color = this.getColor(step);
                      const width = scaleX(getLength(step, wordsLength));
                      const x = activeStep;
                      activeStep += width; 
                      if (index2 === currentStep) {
                        return (
                          <Rect 
                            height={CELL * 6 + CELL * groups.length * 2} 
                            tip={step.didascalie || buildTipForIntervention(step)} 
                            width={width} 
                            key={index2} 
                            x={x} 
                            fill={'rgba(0,0,0,0.05)'} 
                            active={false}
                          />
                        );
                      }
                      return null;
                    })}
                    {data.map((step, index2) => {
                      const color = this.getColor(step);
                      const width = scaleX(getLength(step, wordsLength));
                      const x = headerStep;
                      headerStep += width;
                      const onMouseOver = () => {
                        onHover(step, step.index, id);
                        if (playing) this.setState({playing: false})
                      }
                      const onMouseOut = () => {
                        onOut(step);
                      }
                      return <Rect 
                              active={currentStep === index2} 
                              onOut={onMouseOut} 
                              onHover={onMouseOver} 
                              height={CELL} 
                              tip={step.didascalie || buildTipForIntervention(step)} 
                              width={width} 
                              key={index2} 
                              x={x} 
                              fill={color} 
                              />
                    })}
                   </g>
                </g>

              {
                groups.map(
                  (group, index1) => {
                    let localStep = 0;
                    return (
                    <g transform={`translate(0, ${CELL * 2  + CELL * index1 * 2})`} key={index1}>
                      <text>{group}</text>
                      <g transform={`translate(${CELL * 10}, -${CELL})`}>
                      <rect
                        fill={'rgba(0,0,0,0.1)'}
                        x={0}
                        y={0}
                        height={CELL}
                        width={scaleX(totalLength)}
                      />
                      {
                        data.map((step, index2) => {
                          const concerned = !step.groupes.length && group === 'global' || step.groupes.indexOf(group) > -1;
                          const width = scaleX(getLength(step, wordsLength));
                          const x = localStep;
                          localStep += width;
                          const onMouseOver = () => {
                            onHover(step, step.index, id);
                            if (playing) this.setState({playing: false})
                          }
                          const onMouseOut = () => {
                            onOut(step);
                          }
                          const color = this.getColor(step);
                          if (concerned) {
                            if (step.type === 'elocution') {
                              const interjection = (step.intervention.length < 60 && step.intervention.indexOf('!') > -1);
                              
                              return <Rect onHover={onMouseOver} onOut={onMouseOut} active={currentStep === index2} tip={buildTipForIntervention(step)} height={CELL} key={index2}  width={width} x={x} fill={color} />
                            } else {
                              return <Rect onHover={onMouseOver} onOut={onMouseOut} active={currentStep === index2} tip={step.didascalie} height={CELL} key={index2} x={x}  width={width} fill={color}  />
                            }
                          }
                          return <Rect onHover={onMouseOver} onOut={onMouseOut} active={currentStep === index2} key={index2} x={index2} height={CELL}  />
                        })
                      }
                      </g>
                      
                    </g>
                  )
                }
                )
              }
              
              </g>
            </svg>
            
          <Box>
          <Columns>
            <Column>
              <Column>
                <Button isColor={playing ? 'primary' : 'info'} onClick={() => this.setState({playing: !this.state.playing})}>
                  {playing ? 'Pause': 'Lecture du débat'}
                </Button>
              </Column>
              <Column>
                <div>
                <Radio checked={temporalite === 'sequentiel'} onClick={() => this.setState({temporalite: 'sequentiel'})}>
                  Dimensionnement séquentiel
                </Radio>
                </div>
                <div>
                <Radio checked={temporalite === 'temporel'} onClick={() => this.setState({temporalite: 'temporel'})}>
                  Dimensionnement par nombre de mots
                </Radio>
                </div>
              </Column>
            </Column>
            <Column>
                <Title isSize={4}>
                  Légende
                </Title>
              {
                Object.keys(colors)
                .map(colorKey => (
                  <div key={colorKey}>
                    <span 
                      style={{
                        width: '1rem',
                        height: '1rem',
                        background: colors[colorKey],
                        display: 'inline-block',
                        marginRight: '1rem'
                      }}
                    />
                    <span>{colorKey}</span>
                  </div>
                ))
              }
              </Column>
            </Columns>
          </Box>
        </Column>
        :
        <Column>
          <Tabs>
            <TabList>
                <Tab onClick={e => this.setState({actorsMode: 'vis'})} isActive={actorsMode === 'vis'}>
                    <TabLink>
                        <span>Visualisation</span>
                    </TabLink>
                </Tab>
                <Tab onClick={e => this.setState({actorsMode: 'list'})} isActive={actorsMode === 'list'}>
                    <TabLink>
                        <span>Détail</span>
                    </TabLink>
                </Tab>
            </TabList>
          </Tabs>
        {
          actorsMode === 'vis' ?
            <ActorsSpace
              colors={colors} 
              orateurs={orateursData}
              groups={groups}
            />
            :
            orateursData
            .map(orateur => {        
              return (
                <Box key={orateur.nom}>
                <svg style={{display: 'inline', height:'40px', width: '40px'}}>
                  <g transform={`translate(20, 40)scale(10)rotate(-135)`}>
                  <OrateurMark
                    colors={colors}
                    name={orateur.nom}
                    values={statsVals.reduce((res, key) => ({
                      ...res,
                      [key]: {
                        absolute: orateur.stats[key],
                        relative: orateursScales[key](orateur.stats[key])
                      }
                    }), {})}
                  />
                  </g>
                </svg>
                  {orateur.nom} ({orateur.groupes.join()})
                  <svg style={{display: 'inline', height:'3rem'}}>
                    <g transform={`translate(${CELL/2},${CELL})`}>
                      {
                        orateur.int.map((step, i) => {
                          const prev = step.interruption && step.index > 0 && data[step.index-1];
                          const next = !step.interruption && step.index + 1 < data.length && data[step.index+1];
                          const prevIndex = step.index-1;
                          const nextIndex = step.index+1;
                          const onMouseOver = () => {
                            onHover(step, step.index, id);
                            if (playing) this.setState({playing: false})
                          }
                          const onMouseOut = () => {
                            onOut(step);
                          }
                          const onNextMouseOver = () => {
                            onHover(next, nextIndex, id);
                            if (playing) this.setState({playing: false})
                          }
                          const onNextMouseOut = () => {
                            onOut(next);
                          }
                          const onPrevMouseOver = () => {
                            onHover(prev, prevIndex, id);
                            if (playing) this.setState({playing: false})
                          }
                          const onPrevMouseOut = () => {
                            onOut(prev);
                          }
                          return (
                            <g key={i} transform={`translate(0, ${CELL})`}>
                            {
                                prev &&
                                <Rect 
                                  height={CELL / 2} 
                                  width={CELL / 2} 
                                  x={CELL * 2 * i  - CELL * .5} 
                                  y={-CELL * .5}
                                  fill={this.getColor(prev)} 
                                  active={currentStep === prevIndex}
                                  onHover={onPrevMouseOver}
                                  onOut={onPrevMouseOut}
                                />
                              }
                              <Rect 
                                
                                height={CELL} 
                                width={CELL} 
                                x={CELL * 2 * i} 
                                fill={this.getColor(step)} 
                                active={currentStep === step.index}
                                onHover={onMouseOver}
                                onOut={onMouseOut}
                                />
                              {
                                next &&
                                <Rect 
                                  height={CELL / 2} 
                                  width={CELL / 2} 
                                  x={CELL * 2 * i + CELL} 
                                  y={CELL}
                                  fill={this.getColor(next)} 
                                  active={currentStep === nextIndex}
                                  onHover={onNextMouseOver}
                                  onOut={onNextMouseOut}
                                />
                              }
                            </g>
                          );
                      })
                      }
                    </g>
                  </svg>
                </Box>
              )
            })
          }
          
        </Column>
        }
        
        
          
        
        

        <TTip place="top" id="annotation" effect="solid" />
        <TTip place="top" id="mark" effect="solid" />

      </div>
    );
  }
}

module.exports = withSize({
  // monitorWidth: true,
  // monitorHeight: true
})(Profile);

// module.exports = List;