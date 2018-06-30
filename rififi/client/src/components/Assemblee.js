const React = require('react');
const scales = require('d3-scale');
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
      groupes,
      highlight = [],
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
              let deputeInfo = listeDeputes.find(d => d.depute.place_en_hemicycle === place.place);
              let groupe;
              let fill = 'transparent';
              let highlighted;
              let realRad = rad;
              if (deputeInfo) {
                deputeInfo = deputeInfo.depute;
                groupe = groupes[deputeInfo.groupe_sigle];
                if (highlight.indexOf(deputeInfo.nom) > -1) {
                  highlighted = true;
                }
              }
              if (highlighted) {
                fill = groupe ? `rgb(${groupe.couleur})`: 'lightgrey'
                realRad *= 2;
              }
              return (
                <ellipse
                  key={index}
                  cx={scaleX(place.x)}
                  cy={scaleY(place.y)}
                  data-tip={deputeInfo ? `${deputeInfo.nom} (${deputeInfo.groupe_sigle})` : '?'}
                  data-for='assemblee'
                  rx={realRad}
                  ry={realRad}
                  stroke={groupe ? `rgb(${groupe.couleur})`: 'lightgrey'}
                  fill={fill}
                />
              )
            })
          }
          <ellipse
            cx={scaleX(xExtent[1]/2)}
            cy={scaleY(yExtent[1] * .6)}
            data-tip={'gouvernement'}
            data-for='assemblee'
            rx={rad}
            ry={rad}
            stroke={'grey'}
            fill={highlight.indexOf('NULL') > -1 ? 'grey': 'transparent'}
          />
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