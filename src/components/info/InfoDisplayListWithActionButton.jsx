import React from 'react';
import PropTypes from 'prop-types';

import InfoDisplayList from 'forpdi/src/components/info/InfoDisplayList';
import Text from 'forpdi/src/components/typography/Text';
import IconButton from 'forpdi/src/components/buttons/IconButton';

import Messages from 'forpdi/src/Messages';

const listItemContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  width: '260px',
  alignItems: 'center',
};

const InfoDisplayListWithActionButton = ({
  label,
  infoList,
  emptyMessage,
  style,
  textMaxLength,
  getItemText,
  onClick,
}) => {
  function renderListItem(item) {
    return (
      <div style={{ ...listItemContainerStyle, ...style }}>
        <Text
          syle={{ textAlign: 'left' }}
          text={getItemText(item)}
          maxLength={textMaxLength}
        />
        <IconButton
          icon="eye"
          title={Messages.get('label.view')}
          onClick={() => onClick(item)}
        />
      </div>
    );
  }

  return (
    <InfoDisplayList
      label={label}
      infoList={infoList}
      renderItem={renderListItem}
      emptyMessage={emptyMessage}
    />
  );
};

InfoDisplayListWithActionButton.propTypes = {
  label: PropTypes.string,
  infoList: PropTypes.arrayOf(PropTypes.shape({})),
  emptyMessage: PropTypes.string,
  style: PropTypes.shape({}),
  textMaxLength: PropTypes.number,
  getItemText: PropTypes.func,
  onClick: PropTypes.func.isRequired,
};

InfoDisplayListWithActionButton.defaultProps = {
  label: null,
  infoList: [],
  emptyMessage: undefined,
  style: {},
  textMaxLength: 30,
  getItemText: ({ name }) => name,
};

export default InfoDisplayListWithActionButton;
