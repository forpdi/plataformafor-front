import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import Modal from 'forpdi/src/components/modals/Modal';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import SecondaryButton from 'forpdi/src/components/buttons/SecondaryButton';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import SelectBox from 'forpdi/src/components/inputs/SelectBox';
import DatePicker from 'forpdi/src/components/inputs/DatePicker';
import TextField from 'forpdi/src/components/inputs/TextField';

import Messages from 'forpdi/src/Messages';
import { cutPhrase } from 'forpdi/src/utils/stringUtil';

const rowStyle = {
  marginTop: '1rem',
  marginBottom: '1rem',
};

function getSelectBox(values, selectedValue, onChange) {
  const {
    label,
    options,
    name,
    width,
  } = values;

  const cuttedOptions = _.map(options, option => ({ ...option, name: cutPhrase(option.name, 25) }));

  return (
    <SelectBox
      id={name}
      containerStyle={{ ...rowStyle, width }}
      value={selectedValue}
      label={label}
      options={[{ name: Messages.get('label.all'), id: -1 }, ...cuttedOptions]}
      name={name}
      onChange={({ target }) => onChange(target.name, target.value)}
    />
  );
}

function getTextField(values, selectedValue, onChange) {
  const {
    name,
    label,
    width,
    type,
    minValue,
  } = values;
  return (
    <TextField
      id={name}
      type={type}
      containerStyle={{ ...rowStyle, width }}
      value={selectedValue}
      label={label}
      name={name}
      maxLength={255}
      minValue={minValue}
      onChange={({ target }) => onChange(target.name, target.value)}
    />
  );
}

function getDate(values, selectedValue, onChange) {
  const {
    label,
    name,
    width,
  } = values;

  return (
    <DatePicker
      name={name}
      containerStyle={{ ...rowStyle, width }}
      className="advanced-search__date-picker"
      value={selectedValue}
      label={label}
      onChange={dateStr => onChange(name, dateStr)}
    />
  );
}

class AdvancedSearchModal extends React.Component {
  constructor(props) {
    super(props);

    const { fields } = props;
    const filtersState = _.reduce(fields, (acc, { name, initialValue }) => {
      acc[name] = initialValue;

      return acc;
    }, {});

    this.state = filtersState;
  }

  onChange = (name, value) => {
    this.setState({ [name]: value });
  }

  getField(field) {
    const { name, fieldRenderer } = field;
    const { [name]: selectedValue } = this.state;

    return fieldRenderer(field, selectedValue, this.onChange);
  }

  getFields() {
    const { rowsStructure, fields } = this.props;
    const fieldsComponents = [];

    _.forEach(rowsStructure, (rowStructure) => {
      const elementWidth = `${100 / rowStructure.length}%`;
      const row = [];

      _.forEach(rowStructure, (name) => {
        const findedField = _.find(fields, field => field.name === name);
        if (findedField) {
          findedField.width = elementWidth;
          row.push(this.getField(findedField));
        }
      });

      fieldsComponents.push(
        <div style={{ display: 'flex', flexDirection: 'row', gap: '30px' }}>
          {row}
        </div>,
      );
    });

    return fieldsComponents;
  }

  render() {
    const { onSubmit } = this.props;

    return (
      <Modal width="400px">
        <div className="modal-header" style={{ display: 'flex', padding: '10px 30px 0px 0px' }}>
          <SecondaryTitle>
            {Messages.get('label.advancedSearch')}
          </SecondaryTitle>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap' }}>
          {this.getFields()}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <PrimaryButton
            text={Messages.get('label.research')}
            onClick={() => {
              Modal.hide();
              onSubmit(this.state);
            }}
          />
          <SecondaryButton text={Messages.get('label.cancel')} onClick={() => Modal.hide()} />
        </div>
      </Modal>
    );
  }
}

AdvancedSearchModal.fieldRenderer = {
  date: getDate,
  selectBox: getSelectBox,
  textField: getTextField,
};

AdvancedSearchModal.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onSubmit: PropTypes.func.isRequired,
  rowsStructure: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
};

AdvancedSearchModal.defaultProps = {
  rowsStructure: null,
};

export default AdvancedSearchModal;
