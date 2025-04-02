import React from 'react';
import PropTypes from 'prop-types';

import IconButton from 'forpdi/src/components/buttons/IconButton';

const SecondaryIconButton = ({
  icon,
  className,
  style,
  onClick,
  title,
}, { theme }) => (
  <IconButton
    style={style}
    hoverClass={`${theme}-hover-2-bg`}
    className={`background-color-bg ${className}`}
    icon={icon}
    onClick={onClick}
    title={title}
  />
);

SecondaryIconButton.propTypes = {
  icon: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.shape({}),
  onClick: PropTypes.func.isRequired,
  title: PropTypes.string,
};

SecondaryIconButton.defaultProps = {
  icon: '',
  className: '',
  style: {},
  title: '',
};

SecondaryIconButton.contextTypes = {
  theme: PropTypes.string,
};

export default SecondaryIconButton;
