import React from 'react';
import PropTypes from 'prop-types';

const AppContainer = ({
  style,
  children,
}, { theme }) => (
  <div className={`app-container ${theme}-background-bg`} style={style}>
    {children}
  </div>
);
AppContainer.displayName = 'AppContainer';


AppContainer.Content = ({ children, style }) => (
  <div className="app-container-content" style={style}>
    {children}
  </div>
);
AppContainer.Content.displayName = `${AppContainer.displayName}.Content`;


AppContainer.TopContent = ({ children, style }) => (
  <div className="app-container-top-content-wrapper" style={style}>
    <div className="app-container-top-content">
      {children}
    </div>
  </div>
);
AppContainer.TopContent.displayName = `${AppContainer.displayName}.TopContent`;


AppContainer.MainContent = ({ children, style }) => (
  <div className="app-container-main-content" style={style}>
    {children}
  </div>
);
AppContainer.MainContent.displayName = `${AppContainer.displayName}.MainContent`;


AppContainer.Section = ({ children, className, style }) => (
  <div className={`app-container-section ${className}`} style={style}>
    {children}
  </div>
);
AppContainer.Section.displayName = `${AppContainer.displayName}.Section`;


AppContainer.ScrollableContent = ({ children, className, style }) => (
  <div className={`app-container-scrollable-content custom-scrollbar ${className}`} style={style}>
    {children}
  </div>
);
AppContainer.ScrollableContent.displayName = `${AppContainer.displayName}.ScrollableContent`;

AppContainer.Column = ({ children, breakWord }) => (
  <div className="app-container-column" style={breakWord ? { wordWrap: 'break-word', wordBreak: 'break-word' } : {}}>
    {children}
  </div>
);

AppContainer.ScrollableContent.getElement = () => document.getElementsByClassName('app-container-scrollable-content')[0];

AppContainer.Column.displayName = `${AppContainer.displayName}.Column`;

AppContainer.propTypes = {
  style: PropTypes.shape({}),
  children: PropTypes.node,
};

AppContainer.Content.propTypes = {
  children: PropTypes.node,
  style: PropTypes.shape({}),
};

AppContainer.TopContent.propTypes = {
  children: PropTypes.node,
  style: PropTypes.shape({}),
};

AppContainer.MainContent.propTypes = {
  children: PropTypes.node,
  style: PropTypes.shape({}),
};

AppContainer.Section.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.shape({}),
};

AppContainer.ScrollableContent.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.shape({}),
};

AppContainer.Column.propTypes = {
  children: PropTypes.node,
  breakWord: PropTypes.bool,
};

AppContainer.defaultProps = {
  style: {},
  children: null,
};

AppContainer.Content.defaultProps = {
  children: null,
  style: {},
};

AppContainer.TopContent.defaultProps = {
  children: null,
  style: {},
};

AppContainer.MainContent.defaultProps = {
  children: null,
  style: {},
};

AppContainer.Section.defaultProps = {
  children: null,
  className: '',
  style: {},
};

AppContainer.ScrollableContent.defaultProps = {
  children: null,
  className: '',
  style: {},
};

AppContainer.Column.defaultProps = {
  children: null,
  breakWord: false,
};

AppContainer.contextTypes = {
  theme: PropTypes.string,
};

export default AppContainer;
