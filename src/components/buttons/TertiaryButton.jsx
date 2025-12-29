import React from 'react';
import PropTypes from 'prop-types';

import Icon from 'forpdi/src/components/Icon';

const TertiaryButton = ({
  onClick,
  icon,
  style,
  text,
  loading,
  title,
  className,
}, { theme }) => (
  <button
    type="button"
    disabled={!!loading}
    title={title}
    style={{
      cursor: loading ? 'wait' : 'pointer',
      ...style,
    }}
    className={`tertiary-button ${theme}-secondary-bg ${theme}-primary-color ${theme}-primary-border ${theme}-hover-2-bg ${className}`}
    onClick={onClick}
  >
    {text}
    {
      icon && (
        <div style={{ marginLeft: '15px' }}>
          <Icon icon={icon} />
        </div>
      )
    }
  </button>
);

TertiaryButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.string,
  text: PropTypes.string,
  loading: PropTypes.bool,
  title: PropTypes.string,
  style: PropTypes.shape({}),
  className: PropTypes.string,
};

TertiaryButton.defaultProps = {
  icon: null,
  text: '',
  loading: false,
  title: '',
  style: {},
  className: '',
};

TertiaryButton.contextTypes = {
  theme: PropTypes.string,
};

export default TertiaryButton;
