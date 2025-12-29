import React from 'react';
import PropTypes from 'prop-types';

const LinkButton = ({
  onClick = null,
  text = '',
  loading = false,
  title = '',
  className = '',
  style = {},
}, { theme } = {}) => (
  <button
    type="button"
    disabled={!!loading}
    title={title}
    style={{
      cursor: loading ? 'wait' : 'pointer',
      ...style,
    }}
    className={`link-button ${theme}-primary-color ${className}`}
    onClick={onClick}
  >
    {text}
  </button>
);

LinkButton.propTypes = {
  onClick: PropTypes.func,
  text: PropTypes.string,
  loading: PropTypes.bool,
  title: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.shape({}),
};

LinkButton.contextTypes = {
  theme: PropTypes.string,
};

export default LinkButton;
