import React from 'react';
import PropTypes from 'prop-types';

const SecondaryButton = ({
  onClick,
  text,
  style,
  hoverClass,
  className,
  backgroundClassName,
  title,
}, { theme }) => {
  const secondaryButtonHoverClass = hoverClass === '' ? `${theme}-hover-2-bg ` : hoverClass;

  return (
    <button
      title={title}
      type="button"
      style={{
        padding: '8px 30px',
        borderRadius: '8px',
        border: 'none',
        textTransform: 'uppercase',
        ...style,
      }}
      className={`${backgroundClassName || `${theme}-secondary-bg`} ${theme}-primary-color ${secondaryButtonHoverClass} ${className}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

SecondaryButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  text: PropTypes.string,
  style: PropTypes.shape({}),
  hoverClass: PropTypes.string,
  className: PropTypes.string,
  backgroundClassName: PropTypes.string,
  title: PropTypes.string,
};

SecondaryButton.defaultProps = {
  text: '',
  style: {},
  hoverClass: '',
  className: '',
  backgroundClassName: '',
  title: '',
};

SecondaryButton.contextTypes = {
  theme: PropTypes.string,
};

export default SecondaryButton;
