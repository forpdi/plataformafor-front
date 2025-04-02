import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Collapse } from 'react-collapse';

import IconButton from 'forpdi/src/components/buttons/IconButton';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';

import InfoDropdown from 'forpdi/src/components/info/InfoDropdown';

class DashboardCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: true,
    };
  }

  changeIsOpen = () => {
    const { isOpen } = this.state;
    this.setState({ isOpen: !isOpen });
  }

  render() {
    const {
      title,
      children,
      titleClass,
      infoMessage,
      height,
    } = this.props;
    const { isOpen } = this.state;

    return (
      <div className="dashboard-card custom-scrollbar">
        <div style={{ display: 'flex' }}>
          <div style={{ display: 'flex' }} className={`dashboard-card__header ${titleClass}`}>
            <SecondaryTitle className={`${titleClass}`}>
              {title}
            </SecondaryTitle>
            {infoMessage && <InfoDropdown infoMessage={infoMessage} style={{ display: 'flex', alignItems: 'center' }} />}
          </div>
          <IconButton icon="chevron-down" style={{ backgroundColor: 'transparent', marginLeft: 'auto' }} onClick={this.changeIsOpen} />
        </div>

        <Collapse isOpened={isOpen}>
          <div style={{ height, display: 'flex', flexDirection: 'column' }}>
            {children}
          </div>
        </Collapse>
      </div>
    );
  }
}

DashboardCard.propTypes = {
  title: PropTypes.string,
  titleClass: PropTypes.string,
  infoMessage: PropTypes.string,
  children: PropTypes.node.isRequired,
  height: PropTypes.string,
};

DashboardCard.defaultProps = {
  title: '',
  titleClass: '',
  infoMessage: '',
  height: 'inherit',
};

export default DashboardCard;
