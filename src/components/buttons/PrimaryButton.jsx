import React from 'react';
import PropTypes from 'prop-types';

const PrimaryButton = ({
  onClick,
  style,
  text,
  loading,
  title,
  disabled,
}, { theme }) => {
  function getCursor() {
    if (loading) {
      return 'wait';
    }
    if (disabled) {
      return 'not-allowed';
    }

    return 'pointer';
  }

  const bgClassName = disabled ? 'button-disable-bg' : `${theme}-primary-bg ${theme}-hover-1-bg`;

  return (
    <button
      type="button"
      disabled={!!loading}
      title={title}
      style={{
        padding: '8px 30px',
        borderRadius: '8px',
        border: 'none',
        textTransform: 'uppercase',
        cursor: getCursor(),
        ...style,
      }}
      className={`${bgClassName} ${theme}-secondary-color`}
      onClick={disabled ? null : onClick}
    >
      {text}
    </button>
  );
};

PrimaryButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  text: PropTypes.string,
  loading: PropTypes.bool,
  title: PropTypes.string,
  style: PropTypes.shape({}),
  disabled: PropTypes.bool,
};

PrimaryButton.defaultProps = {
  text: '',
  loading: false,
  title: '',
  style: {},
  disabled: false,
};

PrimaryButton.contextTypes = {
  theme: PropTypes.string,
};

export default PrimaryButton;
