import React from 'react';
import PropTypes from 'prop-types';

const ProgressBar = ({ percent }, { theme }) => (
  <div className={`${theme}-secondary-2-bg`} style={{ width: '100%' }}>
    <div
      className={`${theme}-primary-bg`}
      style={{
        height: '9px',
        borderRadius: '5px',
        width: `${percent}%`,
        transition: 'width 0.6s ease',
      }}
    />
  </div>
);

ProgressBar.propTypes = {
  percent: PropTypes.number,
};

ProgressBar.defaultProps = {
  percent: 100,
};

ProgressBar.contextTypes = {
  theme: PropTypes.string,
};

export default ProgressBar;
