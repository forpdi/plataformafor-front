import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import Text from 'forpdi/src/components/typography/Text';
import DashboardCard from 'forpdi/src/components/dashboard/DashboardCard';

const IndicatorsCard = ({ title, indicators }) => (
  <DashboardCard
    title={title}
    height="180px"
  >
    <Text style={{ marginBottom: '10px' }}>
      <b>{indicators[0].name}</b>
      {':  '}
      <b style={{ fontSize: '20px' }}>{indicators[0].value}</b>
    </Text>
    <div style={{ marginLeft: '10px' }}>
      {
        _.map(indicators, (ind, idx) => {
          if (idx === 0) {
            return null;
          }
          return (
            <Text key={ind.name} style={{ marginBottom: '8px' }}>
              {ind.name}
              {': '}
              <b>{ind.value}</b>
            </Text>
          );
        })
      }
    </div>
  </DashboardCard>
);

IndicatorsCard.propTypes = {
  title: PropTypes.string.isRequired,
  indicators: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    value: PropTypes.number,
  })),
};

IndicatorsCard.defaultProps = {
  indicators: null,
};

export default IndicatorsCard;
