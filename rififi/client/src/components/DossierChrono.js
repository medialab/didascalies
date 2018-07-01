const React = require('react');
const scales = require('d3-scale');
const arrays = require('d3-array');
const {LineChart} = require('react-d3-components');
const max = arrays.max;
const extent = arrays.extent;
const { withSize } = require('react-sizeme');
const TTip = require('react-tooltip');

const colors = {
  'LREM': 'lightblue',
  'MODEM': 'lightgrey',
  'NG': 'pink',
  'LR': 'blue',
  'GDR': 'brown',
  'UAI': 'blue',
  'LFI': 'red',
  'NI': 'yellow'
}


class DossierChrono extends React.Component {

  render() {
    const { 
      size: {width, monitorHeight},
      seances,
      style,
      ...props
     } = this.props;


    const height = width / 5;

    const ticks = [];
    for(let i = 1 ; i < seances.length + 1 ; i ++) ticks.push(i);
    const data = seances.map((seance, index) => ({
              x: index + 1,
              y: seance.pc_interruptions * 100
            }
            ));
    return (
      <div style={style}>
        <LineChart
          data={{
            label: '',
            values: data,
          }
          }
          width={width}
          height={height}
          yAxis={{
            label: "animation",
            tickValues: [0, 10, 20, 30,  40, 50, 60, 70, 80, 90, 100],
            tickFormat: x => { return parseInt(x) + '%'; }
          }}
          
          xAxis={{
            label: "séances du débat",
            tickValues: ticks,
            tickFormat: x => { return parseInt(x); }
          }}
          margin={{top: 10, bottom: 50, left: 50, right: 10}}/>
        
        <TTip id="assemblee" />
      </div>
    );
  }
}

module.exports = withSize({
  // monitorWidth: true,
  // monitorHeight: true
})(DossierChrono);

// module.exports = List;