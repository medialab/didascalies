const React = require('react');
const scales = require('d3-scale');
const { withSize } = require('react-sizeme');
const groups = [
  'présidence',
  'gouvernement',
  'commission',
  'GDR',
  'LFI',
  'NG',
  'LREM',
  'MODEM',
  'UAI',
  'LR',
  'NI'
];

const Rect = ({x, stroke='transparent', fill='transparent', tip, width = 0, height}) =>
  <rect data-html={true} data-for='annotation' title={tip} data-tip={tip} stroke={stroke} fill={fill} width={width} height={height} x={x} y={0} />

const toneToColor = ton => {
  switch(ton) {
    case 'positif':
      return 'green';
    case 'negatif':
      return 'red';
    default:
      return 'lightgrey';
  }
}

const buildTipForIntervention = ({intervention, fonction, parlementaire, nom, parlementaire_groupe_acronyme}) => `
  <div>${parlementaire !== 'NULL' ? parlementaire : nom}${fonction ? ` (${fonction})` : ''}${parlementaire_groupe_acronyme !== 'NULL' ? ` (${parlementaire_groupe_acronyme})` : ''}</div>
  <div>${intervention}</div>
`;

class Profile extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      temporalite: 'sequentiel'
    }
  }
  render() {
    const { 
      hasError, 
      size: {width, height, monitorHeight},
      data, 
      style, 
      ...props } = this.props;
    const {temporalite} = this.state;
    let headerStep = 0;

    const getLength = step => 
      temporalite === 'temporel' ?
      (step.type === 'elocution' ? step.intervention.split(/\s/).length : 200) / 5
      : 1;

    const CELL = (height || monitorHeight) / groups.length || 10;
    const totalLength = temporalite === 'temporel' ?
      data.reduce((sum, step) => sum += getLength(step), 0)
      : data.length;
    const scaleX = scales.scaleLinear().domain([0, totalLength]).range([0, width * .9])
    let breakCount = 0;
    const seanceBreaks = data.reduce((result, datum, index) => {
      const nextDatum = index + 1 < data.length - 1 ? data[index + 1] : undefined;
      breakCount += getLength(datum);
      if (nextDatum && datum.seance_id !== nextDatum.seance_id) {
        return result.concat({
          x: breakCount
        })
      }
      return result;
    }, []);

    let lineStep = 0;
    return (
      <div style={style}>
      <svg  {...props} height={CELL * groups.length * 3} width={width}>
       
        <g transform={`translate(10, 10)scale(.8)`}>
          <g>
            <text>Agrégé</text>
             <g transform={`translate(${CELL * 10}, -${CELL})`}>
              {
                seanceBreaks.map(point => (
                  <line 
                    key={point.x}
                    x1={point.x}
                    x2={point.x}
                    y1={0}
                    y2={CELL * groups.length * 2 + CELL * 2}
                    stroke={'lightgrey'}
                  />
                ))
              }
              {data.map((step, index2) => {
                const color = step.type === 'elocution' ?
                                  (step.intervention.length < 60 && step.intervention.indexOf('!') > -1) ? 'brown' : 'lightblue'
                                   : 
                                   toneToColor(step.ton);
                const width = scaleX(getLength(step));
                const x = headerStep;
                headerStep += width;
                return <Rect height={CELL} tip={step.didascalie || buildTipForIntervention(step)} width={width} key={index2} x={x} fill={color} />
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
                {
                  data.map((step, index2) => {
                    const concerned = !step.groupes.length && group === 'global' || step.groupes.indexOf(group) > -1;
                    const width = scaleX(getLength(step));
                    const x = localStep;
                    localStep += width;
                    if (concerned) {
                      if (step.type === 'elocution') {
                        const interjection = (step.intervention.length < 60 && step.intervention.indexOf('!') > -1);
                        
                        return <Rect tip={buildTipForIntervention(step)} height={CELL} key={index2}  width={width} x={x} fill={interjection ? 'brown' : 'lightblue'} />
                      } else {
                        return <Rect tip={step.didascalie} height={CELL} key={index2} x={x}  width={width} fill={toneToColor(step.ton)}  />
                      }
                    }
                    return <Rect key={index2} x={index2} height={CELL}  />
                  })
                }
                </g>
                
              </g>
            )
          }
          )
        }
        <g transform={`translate(${CELL * 10}, ${CELL})`}>
            {
              data.reduce((result, step, index2) => {
                const width1 = scaleX(getLength(step));
                const x1 = lineStep + width1/2;
                lineStep += width1;
                const next = index2 < data.length - 1 ? data[index2 + 1] : undefined;
                if (next) {
                  const width2 = scaleX(getLength(next));
                  const x2 = lineStep + width2/2;
                  step.groupes.forEach((groupeIn, groupeIndex) => {
                    next.groupes.forEach((groupeOut, groupeIndex2) => {
                      const iIn = groups.indexOf(groupeIn);
                      const iOut = groups.indexOf(groupeOut);
                      const y1 = CELL * iIn * 2 + CELL/2;
                      const y2 = CELL * iOut * 2 + CELL/2;
                      console.log(y1, y2);
                      result.push(
                        <line
                          key={x1}
                          x1={x1}
                          x2={x2}
                          y1={y1}
                          y2={y2}
                          stroke={'black'}
                        />
                      )
                    })
                  })
                }

                return result;
              }, [])
            }
          </g>
        </g>
      </svg>
      <div>
        <button onClick={() => this.setState({temporalite: 'sequentiel'})}>
          Séquentiel {temporalite === 'sequentiel' ? '(active)': ''}
        </button>
        <button onClick={() => this.setState({temporalite: 'temporel'})}>
          Nombre de mots {temporalite === 'temporel' ? '(active)': ''}
        </button>
      </div>
      </div>
    );
  }
}

module.exports = withSize()(Profile);

// module.exports = List;