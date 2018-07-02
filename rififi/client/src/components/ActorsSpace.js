const React = require('react');
const scales = require('d3-scale');
const arrays = require('d3-array');
const max = arrays.max;
const extent = arrays.extent;
const { withSize } = require('react-sizeme');
const TTip = require('react-tooltip');
const TSNE = require('tsne-js');

const Worker = require('./tsne.worker.js');


class Counter extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      displayed: undefined,
    }

    this.interval = setInterval(() => {
      this.setState({displayed: parseInt((props.target - new Date().getTime()) / 1000)})
    }, 1000);
  }


  componentWillReceiveProps = nextProps => {
    if (this.props.target !== nextProps.target) {
      window.clearInterval(this.interval);
      this.interval = null;
      this.interval = setInterval(() => {
        this.setState({displayed: parseInt((nextProps.target - new Date().getTime()) / 1000)})
      }, 1000);
    }
  }

  componentWillUnmout = () => {
    window.clearInterval(this.interval);
    this.interval = null;
  }


  render = () => {
    const {
      displayed
    } = this.state;
    return (
      <i><time>{displayed > 0 ? displayed : 'patience'}</time></i>
    )
  }
}


const {
  Columns,
  Column,
  Control,
  Field,
  Label,
  Select,
  Radio
} = require('bloomer');

const OrateurMark = require('./OrateurMark').default;

const statsVals = CONFIG.statsVals;

class ActorsSpace extends React.Component {

  constructor (props) {
    super(props);

    const groups = props.beginingGroups || props.groups;
    const {orateurs} = props;

    const data =  orateurs.filter(o => {
              return o.groupes.find(g => groups.indexOf(g) > -1) !== undefined;
            })
          .map(o => statsVals.map(key => o.stats[key]));

    this.state = {
      mode: 'comparaison',
      xAxis: statsVals[0],
      yAxis: statsVals[1],
      shownGroups: props.beginingGroups || props.groups,
      estimateTSNE: new Date().getTime() + Math.pow(data.length, 2) * .3
    }
    
    // updateTsneValues(props)
    // .then(tsneValues => this.setState({tsneValues }))
    this.worker = new Worker();
    this.worker.postMessage({
      data
    });
    this.worker.onmessage = (event) => {
      this.setState({tsneValues: event.data, estimateTSNE: undefined})
    };
  }

  componentWillUpdate = (nextProps, nextState) => {
    if (
      (
        this.props.orateurs.length !== nextProps.orateurs.length ||
        this.state.mode !== nextState.mode ||
        this.state.shownGroups !== nextState.shownGroups)
      &&  nextState.mode === 'tsne'
      ) {
      this.worker.terminate();
      this.worker = new Worker();

      const data = nextProps.orateurs.filter(o => {
              return o.groupes.find(g => nextState.shownGroups.indexOf(g) > -1) !== undefined;
            }).map(o => statsVals.map(key => o.stats[key]));
      this.worker.postMessage({
        data
      });
      this.setState({
        tsneValues: undefined,
        estimateTSNE: new Date().getTime() + Math.pow(data.length, 2) * .3
      })
      const self = this;
      this.worker.onmessage =  (event) => {
        self.setState({tsneValues: event.data, estimateTSNE: undefined})
      };
    }
  }

  componentWillUnmount() {
    this.worker.terminate();
  }

  render() {
    const { 
      size: {width: inputWidth, monitorHeight},
      style, 
      highlight = [],
      orateurs: inputOrateurs,
      colors = {},
      groups,
      onHover,
      beginingGroups,
      ...props
     } = this.props;

     const {
      xAxis,
      yAxis,
      mode,
      shownGroups,
      tsneValues,
      estimateTSNE
     } = this.state;


    const width = inputWidth * (8/12)
    const height = width;

    const orateurs = (inputOrateurs || []).filter(o => {
      return o.groupes.find(g => shownGroups.indexOf(g) > -1) !== undefined;
    })

    
    const orateursScales = statsVals
      .reduce((res, key) => ({
        ...res,
        [key]: scales.scaleLinear().range([0, 1]).domain(extent(orateurs, d => d.stats[key]))
      }) , {});
        

    let xScale;
    let yScale;
    if (mode === 'comparaison') {
      xScale = scales.scaleLinear().range([0, width])
        .domain(extent(orateurs, o => o.stats[xAxis]));
      yScale = scales.scaleLinear().range([height, 0])
        .domain(extent(orateurs, o => o.stats[yAxis]));
    } else if (mode === 'tsne') {
      xScale = scales.scaleLinear().range([0, width])
        .domain([-1, 1]);
      yScale = scales.scaleLinear().range([height, 0])
        .domain([-1, 1]);
    }

    const tickGroup = group => {
      let newShown;
      if (shownGroups.indexOf(group) === -1) {
        newShown = [...shownGroups, group]
      } else {
        newShown = shownGroups.filter(g => g !== group);
      }
      this.setState({
        shownGroups: newShown
      })
    }  

    return (
      <Columns style={style}>
        <Column isSize={4}>
          <Field>
            <Label>
              Filtrer par groupes
            </Label>
            <Control>
              {
                groups.map(group => (
                  <div key={group}>
                    <Radio 
                      className="is-checkradio"
                      onClick={() => tickGroup(group)} 
                      checked={shownGroups.indexOf(group) > -1} 
                      name={group}>
                      {group}
                    </Radio>
                  </div>
                ))
              }
            </Control>
        </Field>

          

          {<Field>
              <Label>Mode de visualisation</Label>
              <Control>
                  <Select onChange={e => this.setState({mode: e.target.value})}>
                    <option checked={mode === 'comparaison'}>
                      comparaison
                    </option>
                    <option checked={mode === 'tsne'}>
                      tsne
                    </option>
                  </Select>
              </Control>
          </Field>}
          {mode === 'comparaison' && <Field>
                        <Label>Axe des x</Label>
                        <Control>
                            <Select value={xAxis} onChange={e => this.setState({xAxis: e.target.value})}>
                            {
                                statsVals.map(val => (
                                  <option key={val}>
                                  {val}
                                  </option>
                                ))
                              }
                            </Select>
                        </Control>
                    </Field>}
         {mode === 'comparaison' && <Field>
              <Label>Axe des y</Label>
              <Control>
                  <Select value={yAxis} onChange={e => this.setState({yAxis: e.target.value})}>
                  {
                      statsVals.map(val => (
                        <option key={val}>
                        {val}
                        </option>
                      ))
                    }
                  </Select>
              </Control>
          </Field>}
          {estimateTSNE && mode === 'tsne' &&
            <div style={{position: 'absolute', top: '45%', left: '55%'}}>
              Chargement du t-sne (<Counter target={estimateTSNE} />)
            </div>
          }
        </Column>
        <Column isSize={8} >
          <svg  {...props} height={height} width={width}>
          <rect x={0} y={0} width={width} height={height} fill={'rgba(0,0,0,0.05)'} />
          <line
            x1={5}
            x2={5}
            y1={height - 5}
            y2={5}
            stroke={'lightgrey'}
            markerEnd="url(#triangle)"
          />
          {mode === 'comparaison' && <text
            x={7}
            y={15}
          >
            {yAxis}
          </text>}
          <line
            x1={5}
            x2={width - 5}
            y1={height - 5}
            y2={height - 5}
            stroke={'lightgrey'}
            markerEnd="url(#triangle)"
          />
          {mode === 'comparaison' && <text
            x={width - 15}
            y={height - 15}
            textAnchor={'end'}
          >
            {xAxis}
          </text>}
          <g transform={`translate(10,10)scale(.9)`}>
           { (mode === 'comparaison' || (mode === 'tsne' && tsneValues && tsneValues.length === orateurs.length)) &&
            orateurs.map((orateur, index) => {
              // console.log(xAxis, orateur.stats, xScale(orateur.stats[xAxis]))
              const x = mode === 'comparaison' ? xScale(orateur.stats[xAxis]) : xScale(tsneValues[index][0]);
              const y = mode === 'comparaison' ? yScale(orateur.stats[yAxis]) : yScale(tsneValues[index][1]);
              const values = statsVals.reduce((res, key) => ({
                        ...res,
                        [key]: {
                          absolute: orateur.stats[key],
                          relative: orateursScales[key](orateur.stats[key])
                        }
                      }), {})
              return (
                <g transform={`translate(${x}, ${y})`} key={index}>
                  <g transform={`translate(20, 40)scale(10)rotate(-135)`}>
                    <OrateurMark
                      colors={colors}
                      name={`${orateur.nom} (${orateur.groupes.join()})`}
                      values={values}
                      id={orateur.nom}
                      onHover={onHover}
                    />
                  </g>
                </g>
              )
            })
           }
           </g>

           <marker id="triangle"
            viewBox="0 0 10 10" refX="0" refY="5" 
            markerUnits="strokeWidth"
            markerWidth="4" markerHeight="3"
            orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" />
          </marker>
          </svg>
        </Column>
        <TTip place="top" id="mark" effect="solid" />
      </Columns>
    );
  }
}

module.exports = withSize({
  // monitorWidth: true,
  // monitorHeight: true
})(ActorsSpace);

// module.exports = List;