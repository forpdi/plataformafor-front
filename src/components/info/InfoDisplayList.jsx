import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import InputContainer from 'forpdi/src/components/inputs/InputContainer';
import Label from 'forpdi/src/components/typography/Label';
import Text from 'forpdi/src/components/typography/Text';

import Messages from 'forpdi/src/Messages';

const InfoDisplayList = ({
  label,
  infoList,
  renderItem,
  className,
  emptyMessage,
  maxHeight,
}) => {
  function renderLabel() {
    return (
      <Label className="label-vertical">
        {label}
      </Label>
    );
  }

  function renderInfoList() {
    const style = { margin: 0, padding: 0 };
    if (maxHeight) {
      style.maxHeight = maxHeight;
      style.overflowY = 'auto';
    }
    return (
      <ul style={style} className="custom-scrollbar">
        {
          _.map(infoList, (item, index) => renderListItem(item, index))
        }
      </ul>
    );
  }

  function renderListItem(item, index) {
    return (
      <li key={`list-item-${index}`} style={{ listStyle: 'none', marginBottom: '10px' }}>
        {
          renderItem
            ? renderItem(item)
            : (
              <Text className={className}>
                {item}
              </Text>
            )
        }
      </li>
    );
  }

  return (
    <InputContainer>
      {label && renderLabel()}
      {
        infoList && infoList.length > 0
          ? renderInfoList()
          : (
            <Text>{emptyMessage}</Text>
          )
      }
    </InputContainer>
  );
};

InfoDisplayList.propTypes = {
  label: PropTypes.string,
  infoList: PropTypes.arrayOf(PropTypes.oneOfType(
    [PropTypes.shape({}), PropTypes.string],
  )),
  renderItem: PropTypes.func,
  className: PropTypes.string,
  emptyMessage: PropTypes.node,
  maxHeight: PropTypes.string,
};

InfoDisplayList.defaultProps = {
  label: null,
  infoList: [],
  renderItem: null,
  className: '',
  emptyMessage: Messages.get('label.noRegister'),
  maxHeight: null,
};

export default InfoDisplayList;
