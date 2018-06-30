import React, {Component} from 'react';
import {withSize} from 'react-sizeme';

import Radar from 'react-d3-radar';


class RadarContainer extends Component {
  render = () => {
    const {
      props: {
        data,
        domainMax,
        size: {
          width,
          // height
        }
      }
    } = this;

    const height = width;
    return (
      <div>
        <Radar
                width={width}
                height={height}
                padding={width / 5}
                domainMax={domainMax}
                highlighted={null}
                onHover={(point) => {
                  if (point) {
                    console.log('hovered over a data point');
                  } else {
                    console.log('not over anything');
                  }
                }}
                data={data}
              />
      </div>
    )
  }
}

export default withSize()(RadarContainer)