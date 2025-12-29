import React from 'react';
import PropTypes from 'prop-types';

import Icon from 'forpdi/src/components/Icon';

const TransparentIconButton = ({
  onClick = null,
  style = {},
  icon,
  iconColor = '',
  iconSize = undefined,
  title = null,
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

export default TransparentIconButton;
