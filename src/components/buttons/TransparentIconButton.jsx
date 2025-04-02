import React from 'react';
import PropTypes from 'prop-types';

import Icon from 'forpdi/src/components/Icon';

const TransparentIconButton = ({
  onClick,
  style,
  icon,
  iconColor,
  iconSize,
  title,
}) => (
  <button
    type="button"
    style={{
      border: 'none',
      background: 'none',
      padding: 0,
      ...style,
    }}
    onClick={onClick}
  >
    <Icon icon={icon} color={iconColor} size={iconSize} title={title} />
  </button>
);

TransparentIconButton.propTypes = {
  onClick: PropTypes.func,
  style: PropTypes.shape({}),
  icon: PropTypes.string.isRequired,
  iconColor: PropTypes.string,
  iconSize: PropTypes.string,
  title: PropTypes.string,
};

TransparentIconButton.defaultProps = {
  onClick: null,
  style: {},
  iconColor: '',
  iconSize: undefined,
  title: null,
};

export default TransparentIconButton;
