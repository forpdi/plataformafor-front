import React from 'react';
import PropTypes from 'prop-types';

const textColorClassName = 'secondary-text-color';

const ColorfulCard = ({
  color,
  children,
  onClick,
  width,
}) => {
  const commonClassName = 'colorful-card custom-scrollbar';

  function renderClickable() {
    return (
      <div
        className={`${commonClassName} colorful-card--clickable `}
        style={{ backgroundColor: color, minWidth: width, maxWidth: width }}
        onClick={onClick}
        onKeyDown={onclick}
        role="button"
        tabIndex="-1"
      >
        {children}
      </div>
    );
  }

  function renderStatic() {
    return (
      <div
        className={commonClassName}
        style={{ backgroundColor: color }}
      >
        {children}
      </div>
    );
  }

  return onClick ? renderClickable() : renderStatic();
};

ColorfulCard.propTypes = {
  children: PropTypes.node.isRequired,
  color: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  width: PropTypes.string,
};

ColorfulCard.defaultProps = {
  onClick: null,
  width: '8rem',
};

ColorfulCard.displayName = 'ColorfulCard';


ColorfulCard.GroupContainer = ({ children }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      flex: 1,
      overflow: 'auto',
    }}
    className="custom-scrollbar"
  >
    <div style={{ display: 'flex', justifyContent: 'center', margin: 'auto' }}>
      {children}
    </div>
  </div>
);

ColorfulCard.GroupContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

ColorfulCard.GroupContainer.displayName = `${ColorfulCard.displayName}.MainContent`;


ColorfulCard.MainContent = ({ children }) => (
  <p
    className={textColorClassName}
    style={{ fontSize: '4rem', margin: 0 }}
  >
    {children}
  </p>
);

ColorfulCard.MainContent.propTypes = {
  children: PropTypes.node.isRequired,
};

ColorfulCard.MainContent.displayName = `${ColorfulCard.displayName}.MainContent`;


ColorfulCard.PrimaryLabel = ({ children }) => (
  <p
    className={textColorClassName}
    style={{
      fontSize: '0.9rem', textTransform: 'uppercase', margin: 0, width: '80%', textAlign: 'center', height: '36px',
    }}
  >
    {children}
  </p>
);

ColorfulCard.PrimaryLabel.propTypes = {
  children: PropTypes.node.isRequired,
};

ColorfulCard.PrimaryLabel.displayName = `${ColorfulCard.displayName}.PrimaryLabel`;


ColorfulCard.SecondaryLabel = ({ children }) => (
  <p
    className={textColorClassName}
    style={{
      fontSize: '0.8rem', margin: 0, width: '80%', textAlign: 'center', height: '36px',
    }}
  >
    {children}
  </p>
);

ColorfulCard.SecondaryLabel.propTypes = {
  children: PropTypes.node.isRequired,
};

ColorfulCard.SecondaryLabel.displayName = `${ColorfulCard.displayName}.PrimaryLabel`;

export default ColorfulCard;
