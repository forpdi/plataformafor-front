import React from 'react';
import PropTypes from 'prop-types';
import ReactMultiSelectCheckBoxes from 'react-multiselect-checkboxes';
import _ from 'underscore';

import InputContainer from 'forpdi/src/components/inputs/InputContainer';
import ErrorControl from 'forpdi/src/components/ErrorControl';
import Label from 'forpdi/src/components/typography/Label';

import Messages from 'forpdi/src/Messages';

const customStyles = {
  option: provided => ({
    ...provided,
    borderBottom: '1px dotted',
    padding: 15,
  }),
  container: provided => ({
    ...provided,
    width: '100%',
    borderWidth: '1px',
    borderStyle: 'solid',
    backgroundColor: '#fff',
    padding: '6px',
    borderRadius: '7px',
  }),
  menu: provided => ({
    ...provided,
    borderWidth: '1px',
    padding: '8px',
    borderRadius: '7px',
  }),
};

const MultiSelectCheckBoxes = ({
  placeholderButtonLabel,
  options,
  value,
  onChange,
  name,
  id,
  label,
  errorMsg,
  required,
  disabled,
  optionLabelName,
  optionValueName,
  cutOptions,
  className,
  containerStyle,
  hideSearchField,
}, { theme }) => {
  function parseOption(optionsToParse) {
    return _.map(optionsToParse, opt => ({
      label: opt[optionLabelName],
      value: opt[optionValueName],
      ...opt,
    }));
  }

  function onChangeHandler(newSelectedOptions) {
    const formattedSelectedOptions = _.map(
      newSelectedOptions,
      opt => ({ [optionLabelName]: opt.label, [optionValueName]: opt.value, ...opt }),
    );

    onChange(formattedSelectedOptions, name);
  }

  function renderLabel() {
    return label && (
      <Label required={required} htmlFor={id} className="label-vertical">
        {label}
      </Label>
    );
  }

  const style = disabled ? {
    dropdownButton: provided => ({
      ...provided,
      pointerEvents: 'none',
      width: '100%',
    }),
  } : {};

  return (
    <InputContainer style={{ width: '100%', ...containerStyle, cursor: disabled ? 'not-allowed' : 'default' }}>
      {renderLabel()}
      <ErrorControl errorMsg={errorMsg}>
        <div className={`multi-select-check-boxes multi-select-check-boxes__custom ${theme}-multi-select-check-boxes ${className}`}>
          <ReactMultiSelectCheckBoxes
            name={name}
            id={id}
            className={cutOptions ? 'multi-select-check-boxes__cutted-text' : ''}
            styles={{ ...customStyles, ...style }}
            hideSearch={hideSearchField}
            placeholderButtonLabel={placeholderButtonLabel}
            placeholder={Messages.get('label.doSearch')}
            options={parseOption(options)}
            noOptionsMessage={() => Messages.get('label.itemNotFound')}
            value={parseOption(value)}
            onChange={onChangeHandler}
            required={required}
            getDropdownButtonLabel={() => {
              if (value == null) { return placeholderButtonLabel; }
              if (value.length === 0) { return placeholderButtonLabel; }
              if (value.length === 1) { return `${value.length} item selecionado`; }
              return `${value.length} itens selecionados`;
            }}
          />
        </div>
      </ErrorControl>
    </InputContainer>
  );
};

const valuePropType = PropTypes.oneOfType([
  PropTypes.string, PropTypes.number, PropTypes.bool,
]);

MultiSelectCheckBoxes.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  placeholderButtonLabel: PropTypes.string,
  value: PropTypes.arrayOf(PropTypes.shape({
    label: valuePropType,
    value: valuePropType,
  })),
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string,
  id: PropTypes.string,
  label: PropTypes.node,
  errorMsg: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  optionLabelName: PropTypes.string,
  optionValueName: PropTypes.string,
  cutOptions: PropTypes.bool,
  containerStyle: PropTypes.shape({}),
  hideSearchField: PropTypes.bool,
  className: PropTypes.string,
};

MultiSelectCheckBoxes.defaultProps = {
  placeholderButtonLabel: '',
  value: null,
  name: null,
  id: null,
  label: null,
  errorMsg: '',
  required: false,
  disabled: false,
  optionLabelName: 'name',
  optionValueName: 'id',
  cutOptions: false,
  containerStyle: {},
  hideSearchField: false,
  className: '',
};

MultiSelectCheckBoxes.contextTypes = {
  theme: PropTypes.string,
};

export default MultiSelectCheckBoxes;
