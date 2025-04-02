import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import ForPDIChart from 'forpdi/src/forpdi/core/widget/ForPDIChart';

import AxisLabel from 'forpdi/src/forrisco/components/dashboard/AxisLabel';

const staticOptions = {
  legend: { position: 'none' },
  explorer: { axis: 'horizontal' },
  bar: { groupWidth: '50%' },
};

const hAxisStaticOptions = {
  minValue: 1,
  maxValue: 12,
};

const vAxisStaticOptions = {
  minValue: 1,
  format: '#',
};

function getHAxisMaxValue(chartData) {
  let max = 0;
  _.forEach(chartData, (tuple) => {
    for (let i = 1; i < chartData.length; i += 1) {
      max = max < tuple[i] ? tuple[i] : max;
    }
  });

  return max;
}

function getCompleteOptions(chartData, options) {
  const { vAxis, hAxis } = options;

  const titleTextStyle = AxisLabel.style;

  return {
    ...staticOptions,
    ...options,
    vAxis: {
      ...vAxisStaticOptions,
      ...vAxis,
      title: vAxis.title.toUpperCase(),
      titleTextStyle,
    },
    hAxis: {
      ...hAxisStaticOptions,
      ...hAxis,
      title: hAxis.title.toUpperCase(),
      titleTextStyle,
      maxValue: getHAxisMaxValue(chartData),
    },
  };
}

const DashboardChart = ({
  id,
  chartData,
  options,
  onChartClick,
}) => {
  const completeOptions = getCompleteOptions(chartData, options);
  return (
    <ForPDIChart
      graph_id={id}
      chartType="LineChart"
      data={chartData}
      options={completeOptions}
      width="100%"
      height="300px"
      legend_toggle={false}
      pageSize={10}
      total={undefined}
      onChangePage={() => {}}
      chartEvents={onChartClick ? [
        {
          eventName: 'select',
          callback: onChartClick,
        },
      ] : null}
    />
  );
};

DashboardChart.propTypes = {
  chartData: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  ).isRequired,
  options: PropTypes.shape({}).isRequired,
  id: PropTypes.string,
  onChartClick: PropTypes.func,
};

DashboardChart.defaultProps = {
  id: '',
  onChartClick: null,
};

export default DashboardChart;
