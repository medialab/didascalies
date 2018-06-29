const React = require('react');
const scales = require('d3-scale');
const uniq = require('lodash').uniq;
const arrays = require('d3-array');
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


class Assemblee extends React.Component {

  render() {
    const { 
      size: {width, monitorHeight},
      listeDeputes,
      placesAssemblee, 
      style, 
      ...props
     } = this.props;

     const placesAssembleeList = Object.keys(placesAssemblee)
      .map(k => 
        Object.assign({}, placesAssemblee[k],
          {
            place: k
          }
        )
        );

    uniq(Object.keys(listeDeputes).map(key => {
      return listeDeputes[key].depute.groupe_sigle
    })).map(d => console.log(d));
    const height = width / 2;

    const rad = height / 80;

    const xExtent = extent(placesAssembleeList, d => d.x);
    const yExtent = extent(placesAssembleeList, d => d.y);
    const xAmbi = xExtent[1] - xExtent[0];
    const scaleX = scales.scaleLinear()
    .domain(xExtent)
    .range([0, width]);
    const scaleY = scales.scaleLinear()
    .domain(yExtent)
    .range([0, height]);
    return (
      <div style={style}>
        <svg  {...props} height={height} width={width}>
          
          <g  transform={'translate(10, 10)scale(.8)'}>
          {
            placesAssembleeList.map((place, index) => {
              const deputeInfo = listeDeputes[place.place] && listeDeputes[place.place].depute;
              return (
                <ellipse
                  key={index}
                  cx={scaleX(place.x)}
                  cy={scaleY(place.y)}
                  data-tip={deputeInfo ? `${deputeInfo.nom} (${deputeInfo.groupe_sigle})` : '?'}
                  data-for='assemblee'
                  rx={rad}
                  ry={rad}
                  stroke={deputeInfo ? colors[deputeInfo.groupe_sigle] : 'lightrey'}
                  fill={'transparent'}
                />
              )
            })
          }
          </g>
        </svg>
        <TTip id="assemblee" />
      </div>
    );
  }
}

module.exports = withSize({
  // monitorWidth: true,
  // monitorHeight: true
})(Assemblee);

// module.exports = List;