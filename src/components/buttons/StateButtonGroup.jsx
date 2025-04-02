import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import SecondaryButton from 'forpdi/src/components/buttons/SecondaryButton';

const StateButtonGroup = ({
  options,
  checkedValue,
  onClick,
  style,
  className,
  groupName,
  optionValueName,
  optionLabelName,
}, { theme }) => {
  const active = `${theme}-secondary-2-bg`;

  return (
    <div className={className} style={style}>
      {_.map(options, option => (
        <SecondaryButton
          key={option[optionValueName]}
          name={groupName}
          onClick={() => onClick(option[optionValueName], groupName)}
          text={option[optionLabelName]}
          backgroundClassName={option[optionValueName] === checkedValue ? active : ''}
          style={{
            marginRight: '5px',
            textTransform: 'unset',
            paddingRight: '20px',
            paddingLeft: '20px',
          }}
        />
      ))}
    </div>
  );
};

const valuePropType = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
  PropTypes.bool,
]);

StateButtonGroup.propTypes = {
  checkedValue: valuePropType,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: valuePropType,
    }),
  ).isRequired,
  onClick: PropTypes.func.isRequired,
  groupName: PropTypes.string.isRequired,
  className: PropTypes.string,
  style: PropTypes.shape({}),
  optionValueName: PropTypes.string,
  optionLabelName: PropTypes.string,
};

StateButtonGroup.defaultProps = {
  checkedValue: null,
  className: '',
  style: {},
  optionValueName: 'id',
  optionLabelName: 'name',
};

StateButtonGroup.contextTypes = {
  theme: PropTypes.string,
};

export default StateButtonGroup;
