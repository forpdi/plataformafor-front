import React from 'react';
import PropTypes from 'prop-types';

const textColorClassName = 'secondary-text-color';

const ColorfulCard = ({
  color,
  children,
  onClick = null,
  width = '8rem',
}) => {
  const commonClassName = 'colorful-card custom-scrollbar';

  // Estilos comuns para centralizar o conteúdo verticalmente
  const layoutStyle = {
    backgroundColor: color,
    minWidth: width,
    maxWidth: width,
    // NOVO: Altura mínima para deixar o card "alto"
    minHeight: '18rem',
    // NOVO: Garante que o número e texto fiquem no centro vertical
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  };

  function renderClickable() {
    return (
      <div
        className={`${commonClassName} colorful-card--clickable `}
        style={layoutStyle}
        onClick={onClick}
        onKeyDown={onClick}
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
        style={layoutStyle}
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
  // AJUSTE: Diminuí de 14rem para 12rem (menos largo)
  width: '10rem',
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
      fontSize: '1.2rem',
      textTransform: 'uppercase',
      margin: 0,
      width: '90%',
      textAlign: 'center',
      minHeight: '40px',
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
      fontSize: '1rem',
      margin: 0,
      width: '90%',
      textAlign: 'center',
      minHeight: '30px',
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
