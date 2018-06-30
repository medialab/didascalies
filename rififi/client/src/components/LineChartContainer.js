import React, {Component} from 'react';
import {withSize} from 'react-sizeme';

import {LineChart} from 'react-d3-components';


class LineChartContainer extends Component {
  render = () => {
    const {
      props: {
        data,
        size: {
          width,
          // height
        },
        ...props
      }
    } = this;

    const height = width / 3;
    return (
      <div>
         <LineChart
          data={data}
          width={width}
          height={height}
          margin={{top: 10, bottom: 50, left: 50, right: 10}}
          {...props}
        />
      </div>
    )
  }
}

export default withSize()(LineChartContainer)