import React from 'react';
import PropTypes from 'prop-types';

const CircleStatus = ({
  title,
  color,
}) => (
  <div
    title={title}
    style={{
      backgroundColor: `${color}`,
      border: '1px solid transparent',
      height: '25px',
      width: '25px',
      borderRadius: '25px',
      margin: '0 auto',
    }}
  />
);

CircleStatus.propTypes = {
  title: PropTypes.string,
  color: PropTypes.string,
};

CircleStatus.defaultProps = {
  title: null,
  color: null,
};

export default CircleStatus;
