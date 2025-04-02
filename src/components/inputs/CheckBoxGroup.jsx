import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import Label from 'forpdi/src/components/typography/Label';
import InputContainer from 'forpdi/src/components/inputs/InputContainer';
import CheckBox from 'forpdi/src/components/inputs/CheckBox';
import Text from 'forpdi/src/components/typography/Text';
import ErrorControl from 'forpdi/src/components/ErrorControl';

import Messages from 'forpdi/src/Messages';

const CheckBoxGroup = ({
  options,
  checkedValues,
  groupName,
  onChange,
  label,
  className,
  errorMsg,
  style,
  checksContainerStyle,
  optionLabelName,
  optionValueName,
  showCheckAll,
  required,
}) => {
  function onChangeHandler(value) {
    const updatedCheckedValues = checkedValues.includes(value)
      ? _.filter(checkedValues, cv => cv !== value)
      : [...checkedValues, value];

    onChange(updatedCheckedValues, groupName);
  }

  function onCheckAllChange(opts) {
    const updatedCheckedValues = checkAllIsChecked(opts)
      ? getAllUnchecked(opts)
      : getAllChecked(opts);

    onChange(updatedCheckedValues, groupName);
  }

  function getAllChecked(opts) {
    const values = [...checkedValues];
    _.forEach(opts, (option) => {
      const value = option[optionValueName];
      if (!checkedValues.includes(value)) {
        values.push(value);
      }
    });

    return values;
  }

  function getAllUnchecked(opts) {
    const optsValues = _.map(opts, option => option[optionValueName]);
    return _.filter(checkedValues, cv => !optsValues.includes(cv));
  }

  function checkAllIsChecked(opts) {
    return _.reduce(
      opts,
      (memo, option) => checkedValues.includes(option[optionValueName]) && memo,
      true,
    );
  }

  function renderLabel() {
    return (
      <Label required={required} className="label-vertical">
        {label}
      </Label>
    );
  }

  function renderGroup() {
    return (
      <div className={`check-group ${className}`} style={checksContainerStyle}>
        {
          _.isArray(options)
            ? renderChecks(options)
            : renderTopics()
        }
      </div>
    );
  }

  function renderTopics() {
    const topics = _.keys(options);
    return _.map(topics, (topic, idx) => (
      <div key={idx} className="check-group-topic-container">
        <Text style={{ marginBottom: '10px' }}>{topic}</Text>
        <div style={{ marginLeft: '10px' }}>
          {options[topic].length ? renderChecks(options[topic]) : renderEmpty}
        </div>
      </div>
    ));
  }

  function renderChecks(opts) {
    const checkBoxes = [];
    if (showCheckAll) {
      checkBoxes.push(
        <CheckBox
          key="select-all-opt"
          onChange={() => onCheckAllChange(opts)}
          checked={checkAllIsChecked(opts)}
          label={Messages.get('label.selectAll')}
        />,
      );
    }
    _.forEach(opts, (option) => {
      const optionLabel = option[optionLabelName];
      const optionValue = option[optionValueName];
      checkBoxes.push(
        <CheckBox
          key={optionValue}
          onChange={() => onChangeHandler(optionValue)}
          checked={checkedValues.includes(optionValue)}
          id={`${groupName}-${optionValue}`}
          name={groupName}
          label={optionLabel}
        />,
      );
    });

    return checkBoxes;
  }

  function renderCheckGroup() {
    return (
      <InputContainer style={style} className="check-group-container">
        {renderLabel()}
        <ErrorControl errorMsg={errorMsg}>
          {renderGroup()}
        </ErrorControl>
      </InputContainer>
    );
  }

  const renderEmpty = (
    <Text style={{ marginTop: '15px' }}>
      {Messages.get('label.noRecords')}
    </Text>
  );

  return (
    _.isArray(options) && options.length === 0
      ? renderEmpty
      : renderCheckGroup()
  );
};

const optionsPropType = PropTypes.arrayOf(PropTypes.shape({})).isRequired;

CheckBoxGroup.propTypes = {
  options: PropTypes.oneOfType([
    optionsPropType,
    PropTypes.shape({}),
  ]),
  label: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  groupName: PropTypes.string.isRequired,
  className: PropTypes.string,
  errorMsg: PropTypes.string,
  checkedValues: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  ),
  style: PropTypes.shape({}),
  checksContainerStyle: PropTypes.shape({}),
  optionLabelName: PropTypes.string,
  optionValueName: PropTypes.string,
  showCheckAll: PropTypes.bool,
  required: PropTypes.bool,
};

CheckBoxGroup.defaultProps = {
  label: '',
  errorMsg: '',
  style: {},
  checksContainerStyle: {},
  checkedValues: [],
  className: '',
  optionLabelName: 'label',
  optionValueName: 'value',
  showCheckAll: false,
  required: false,
};

export default CheckBoxGroup;
