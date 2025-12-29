import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Collapse } from 'react-collapse';

import InfoDisplayList from 'forpdi/src/components/info/InfoDisplayList';
import IconButton from 'forpdi/src/components/buttons/IconButton';
import Label from 'forpdi/src/components/typography/Label';

import Messages from 'forpdi/src/Messages';

const listItemContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  overflowX: 'auto',
  padding: '15px 25px',
  borderBottom: 'solid #ccc 1px',
};

class InfoDisplayListAccordion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: true,
    };
  }

  renderListItem(item) {
    const { renderItem } = this.props;

    return (
      <div style={{ ...listItemContainerStyle }}>
        {renderItem(item)}
      </div>
    );
  }

  changeIsOpen = () => {
    const { isOpen } = this.state;
    this.setState({ isOpen: !isOpen });
  }

  render() {
    const {
      label,
      infoList,
      emptyMessage,
    } = this.props;
    const { isOpen } = this.state;

    return (
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', backgroundColor: '#f2f2f2', padding: '1rem' }}>
          <div style={{ display: 'flex' }}>
            <Label style={{ alignSelf: 'center' }}>
              {label}
            </Label>
          </div>
          <IconButton
            icon={isOpen ? 'chevron-down' : 'chevron-right'}
            style={{ backgroundColor: 'transparent', marginLeft: 'auto', paddingRight: '25px' }}
            onClick={this.changeIsOpen}
          />
        </div>

        <Collapse isOpened={isOpen}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <InfoDisplayList
              infoList={infoList}
              renderItem={item => this.renderListItem(item)}
              emptyMessage={
                <span style={{ padding: '15px 25px', display: 'block' }}>{emptyMessage}</span>
              }
            />
          </div>
        </Collapse>
      </div>
    );
  }
}

InfoDisplayListAccordion.propTypes = {
  label: PropTypes.string,
  infoList: PropTypes.arrayOf(PropTypes.shape({})),
  emptyMessage: PropTypes.string,
  renderItem: PropTypes.func.isRequired,
};

InfoDisplayListAccordion.defaultProps = {
  label: null,
  infoList: [],
  emptyMessage: Messages.get('label.noRegister'),
};

export default InfoDisplayListAccordion;
