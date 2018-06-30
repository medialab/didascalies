import React, {Component} from 'react';
import {withSize} from 'react-sizeme';

import {BarChart} from 'react-d3-components';


class RadarContainer extends Component {
  render = () => {
    const {
      props: {
        data,
        size: {
          width,
          // height
        }
      }
    } = this;

    const height = width / 3;
    return (
      <div>
         <BarChart
          data={data}
          width={width}
          height={height}
          margin={{top: 10, bottom: 50, left: 50, right: 10}}/>
      </div>
    )
  }
}

export default withSize()(RadarContainer)