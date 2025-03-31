import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import MultiSelectCheckBoxes from 'forpdi/src/components/inputs/MultiSelectCheckBoxes';

import Messages from 'forpdi/src/Messages';

const viewAllOptionValue = -1;

const MultiSelectWithSelectAll = ({
  id,
  name,
  placeholderButtonLabel,
  placeholderToEmpty,
  label,
  options,
  onChange,
  selectedOptions,
  style,
  className,
  optionLabelName,
  optionValueName,
  ...rest
}) => {
  const viewAllOption = {
    [optionLabelName]: Messages.get('label.viewAll_'),
    [optionValueName]: viewAllOptionValue,
  };

  function getOptions() {
    return options.length > 0 ? [viewAllOption, ...options] : [];
  }

  function getSelectedOptions() {
    if (selectedOptions.length === options.length && options.length > 0) {
      return [viewAllOption, ...options];
    }

    return selectedOptions;
  }

  function onChangeHandler(newSelectedOptions) {
    const viewAllSelectedInNew = viewAllOptionIsSelected(newSelectedOptions);
    const viewAllSelectedInOld = viewAllOptionIsSelected(getSelectedOptions());

    const viewAllIsSelected = viewAllSelectedInNew && !viewAllSelectedInOld;

    const allOptionsIsSelectedInNew = !viewAllSelectedInNew && !viewAllSelectedInOld
      && newSelectedOptions.length === options.length;

    if (viewAllIsSelected || allOptionsIsSelectedInNew) {
      onChange(options, name);
      return;
    }

    const shouldUnselectAllOptions = viewAllSelectedInOld && !viewAllSelectedInNew;

    if (shouldUnselectAllOptions) {
      onChange([], name);
      return;
    }

    if (viewAllSelectedInNew) {
      newSelectedOptions.splice(0, 1);
    }
    onChange(newSelectedOptions, name);
  }

  function viewAllOptionIsSelected(selectedOptionsToCheck) {
    return !!_.find(
      selectedOptionsToCheck,
      opt => opt[optionValueName] === viewAllOptionValue,
    );
  }

  const placeholder = options.length > 0
    ? placeholderButtonLabel
    : placeholderToEmpty || placeholderButtonLabel;

  return (
    <MultiSelectCheckBoxes
      label={label}
      onChange={onChangeHandler}
      options={getOptions()}
      className={className}
      placeholderButtonLabel={placeholder}
      value={getSelectedOptions()}
      containerStyle={{
        flex: 1,
        ...style,
      }}
      hideSearchField
      optionLabelName={optionLabelName}
      optionValueName={optionValueName}
      {...rest}
    />
  );
};

MultiSelectWithSelectAll.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  placeholderButtonLabel: PropTypes.string.isRequired,
  placeholderToEmpty: PropTypes.string,
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    id: PropTypes.number,
  })).isRequired,
  onChange: PropTypes.func.isRequired,
  selectedOptions: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    id: PropTypes.number,
  })).isRequired,
  style: PropTypes.shape({}),
  className: PropTypes.string,
  optionLabelName: PropTypes.string,
  optionValueName: PropTypes.string,
};

MultiSelectWithSelectAll.defaultProps = {
  id: null,
  name: null,
  placeholderToEmpty: null,
  style: {},
  className: '',
  optionLabelName: 'name',
  optionValueName: 'id',
};

export default MultiSelectWithSelectAll;
