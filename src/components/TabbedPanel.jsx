import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import _ from 'underscore';

import AppContainer from 'forpdi/src/components/AppContainer';
import LinkButton from 'forpdi/src/components/buttons/LinkButton';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import Tag from 'forpdi/src/components/Tag';

const tabsHeight = 47;
const topContainerHeight = 110;

const TabbedPanel = ({ children, tabs, topContainerContent }, { theme }) => {
  const baseClassName = 'tab-item-label';
  const disabledClassName = `${baseClassName} ${theme}-disabled-text-color cursorDefault`;
  const inactiveClassName = `${baseClassName} ${theme}-primary-color ${theme}-primary-hover-color ${theme}-hover-2-bg tab-item-label--inactive`;
  const activeClassName = `${baseClassName} ${theme}-text-color ${theme}-text-hover-color tab-item-label--active`;

  function getTabItem(tab) {
    const { to, onClick } = tab;

    if (to) {
      return renderTabLink(tab);
    }

    if (onClick) {
      return renderTabButton(tab);
    }

    return renderTabWithoutAction(tab);
  }

  function renderTabLink(tab) {
    const { to, label } = tab;

    return (
      <Link
        to={to}
        className={inactiveClassName}
        activeClassName={activeClassName}
      >
        {label}
      </Link>
    );
  }

  function renderTabButton(tab) {
    const {
      isActive, isDisabled, label, onClick,
    } = tab;

    let className;
    if (isActive) {
      className = activeClassName;
    } else if (isDisabled) {
      className = disabledClassName;
    } else {
      className = inactiveClassName;
    }

    return (
      <LinkButton
        text={label}
        className={className}
        onClick={isDisabled ? null : onClick}
      >
        {label}
      </LinkButton>
    );
  }

  function renderTabWithoutAction(tab) {
    return (
      <p className={`${baseClassName} tab-item-label--without-action`}>
        {tab.label}
      </p>
    );
  }

  function renderTabs() {
    return (
      <ul
        className={`tabbed-panel__tabs ${theme}-background-bg`}
        style={{ height: tabsHeight }}
      >
        {
          _.map(tabs, (tab, idx) => (
            <li className="tab-item" key={idx}>
              {getTabItem(tab)}
            </li>
          ))
        }
      </ul>
    );
  }

  function renderTopContainer() {
    const { title, tag, height } = topContainerContent;
    const style = height ? { height, padding: 0 } : null;
    return (
      <TabbedPanel.TopContainer style={style}>
        {title && <SecondaryTitle>{title}</SecondaryTitle>}
        {
          tag && (
            <Tag label={tag} />
          )
        }
      </TabbedPanel.TopContainer>
    );
  }

  return (
    <AppContainer.ScrollableContent>
      <AppContainer.Section>
        {renderTabs()}
        {topContainerContent && renderTopContainer()}
        {children}
      </AppContainer.Section>
    </AppContainer.ScrollableContent>
  );
};

TabbedPanel.nextTopSticky = tabsHeight + topContainerHeight;

TabbedPanel.tabsHeight = tabsHeight;


TabbedPanel.propTypes = {
  children: PropTypes.node,
  tabs: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    to: PropTypes.string,
  })),
  topContainerContent: PropTypes.shape({
    title: PropTypes.string,
    tag: PropTypes.string,
  }),
};

TabbedPanel.defaultProps = {
  children: null,
  tabs: [],
  topContainerContent: null,
};

TabbedPanel.contextTypes = {
  theme: PropTypes.string,
};

TabbedPanel.displayName = 'TabbedPanel';


TabbedPanel.TopContainer = ({ children, style }) => (
  <div
    className="tabbed-panel__top-container"
    style={{ height: topContainerHeight, top: tabsHeight, ...style }}
  >
    {children}
  </div>
);

TabbedPanel.TopContainer.propTypes = {
  children: PropTypes.node,
  style: PropTypes.shape({}),
};

TabbedPanel.TopContainer.defaultProps = {
  children: null,
  style: {},
};

TabbedPanel.TopContainer.displayName = `${TabbedPanel.displayName}.TopContainer`;


TabbedPanel.MainContainer = ({ children }) => (
  <div className="tabbed-panel__main-container">
    {children}
  </div>
);

TabbedPanel.MainContainer.propTypes = {
  children: PropTypes.node,
};

TabbedPanel.MainContainer.defaultProps = {
  children: null,
};

TabbedPanel.MainContainer.displayName = `${TabbedPanel.displayName}.MainContainer`;


export default TabbedPanel;
