import React from 'react';
import PropTypes from 'prop-types';

const AxisLabel = ({
  children,
  className,
  style,
}) => (
  <h2
    className={`${className}`}
    style={{ ...AxisLabel.style, ...style }}
  >
    {children}
  </h2>
);

AxisLabel.style = {
  fontSize: 18.4,
  textTransform: 'uppercase',
  fontWeight: 'normal',
  lineHeight: '32px',
  wordBreak: 'break-word',
  fontFamily: 'inherit',
  color: '#656162',
  italic: false,
};

AxisLabel.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  style: PropTypes.shape({}),
};

AxisLabel.defaultProps = {
  className: '',
  style: null,
};

AxisLabel.contextTypes = {
  theme: PropTypes.string,
};

export default AxisLabel;
