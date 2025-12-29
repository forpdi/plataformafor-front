import React from 'react';
import PropTypes from 'prop-types';
import _, { result } from 'underscore';

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

const progressStatusIdList = [
	{ name: Messages.get('label.goals.belowMinimum'), id: 1 },
	{ name: Messages.get('label.goals.belowExpected'), id: 2 },
	{ name: Messages.get('label.goals.reached'), id: 3 },
	{ name: Messages.get('label.goals.aboveExpected'), id: 4 },
	{ name: Messages.get('label.goals.notFilled'), id: 6 },
];

const labels = {
  name: 'Nome da meta',
  responsible: Messages.get('label.responsible'),
  maturity: Messages.get('label.maturity'),
  expected: 'Valor esperado',
  reached: 'Valor alcançado',
  progressStatusId: 'Desempenho das metas',
};

const filtersState = {
  name: '',
  responsible: '',
  maturity: '',
  expected: '',
  reached: '',
  progressStatusId: '',
};

class GoalsAdvancedSearchModal extends React.Component {
  constructor(props) {
    super(props);
  
    this.state = filtersState;
  }

  clearFields = () => {
    this.setState(filtersState, () => {
      this.forceUpdate();
    });
  }

  renderSelectBox(values, selectedValue, onChange) {
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
        showChooseOption
        label={label}
        options={[{ name: Messages.get('label.all'), id: -1 }, ...cuttedOptions]}
        name={name}
        onChange={({ target }) => onChange(target.name, target.value)}
      />
    );
  }

  renderTextField(values, selectedValue, onChange) {
    const {
      name,
      label,
      width,
      type,
      placeholder,
      minValue,
    } = values;
    return (
      <TextField
        id={name}
        type={type}
        placeholder={placeholder}
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

  renderDate(values, selectedValue, onChange) {
    const {
      label,
      name,
      width,
    } = values;

    return (
      <DatePicker
        name={name}
        containerStyle={{ ...rowStyle, width }}
        className="custom-label"
        value={selectedValue}
        label={label}
        onChange={dateStr => onChange(name, dateStr)}
      />
    );
  }

  onTextFieldChange = (event) => {
    const { name, value } = event.target;

    this.setState({
      [name]: value,
    });
  }

  onSelectBoxChange = (event) => {
    const { name, value } = event.target;

    this.setState({
      [name]: parseInt(value, 10),
    }, this.refreshData);
  }

  onDatePickerChange = (name, dateStr) => {
    this.setState({ [name]: dateStr });
  } 

  onSubmit = () => {
    Modal.hide();
    const result = {};

    Object.keys(this.state).forEach((key) => {
      if (this.state[key] !== '' && this.state[key] !== null && this.state[key] !== undefined) {
        result[key] = this.state[key];
      }
    });

    this.props.onSubmit(result);
  }

  render() {
    const { users } = this.props;
    const { name, responsible, maturity, expected, reached, progressStatusId } = this.state;

    return (
      <Modal width="400px">
        <div className="modal-header" style={{ display: 'flex', padding: '10px 30px 10px 0px' }}>
          <SecondaryTitle>
            {Messages.get('label.advancedSearch')}
          </SecondaryTitle>
        </div>
        <div>
          <div style={{ padding: '10px 0px 20px 0px' }}>
          <div style={{ marginBottom: '25px' }}>
          <TextField
            name="name"
            id="name"
            value={name}
            onChange={this.onTextFieldChange}
            placeholder='Informe o nome da meta'
            label={labels.name}
          />
          </div>
          <div style={{ marginBottom: '25px' }}>
          <SelectBox
            label={labels.responsible}
            name="responsible"
            id="responsible"
            value={responsible}
            showChooseOption
            initialValue=''
            onChange={this.onSelectBoxChange}
            options={users}
          />
          </div>
          <div style={{ marginBottom: '25px' }}>
          <DatePicker
            name="maturity"
            id="maturity"
            value={maturity}
            onChange={(dateStr) => this.onDatePickerChange("maturity", dateStr)}
            className='custom-label'
            label={labels.maturity}
          />
          </div>
          <div style={{ marginBottom: '25px' }}>
          <TextField
            name="expected"
            id="expected"
            onChange={this.onTextFieldChange}
            value={expected}
            placeholder="Informe o valor esperado"
            type="number"
            minValue={0} 
            label={labels.expected}
          />
          </div>
          <div style={{ marginBottom: '-25px' }}>
          <TextField
            name="reached"
            id="reached"
            value={reached}
            onChange={this.onTextFieldChange}
            placeholder="Informe o valor alcançado"
            type="number"
            minValue={0} 
            label={labels.reached}
          />
          </div>
          <SelectBox
            label={labels.progressStatusId}
            name="progressStatusId"
            value={progressStatusId}
            showChooseOption
            onChange={this.onSelectBoxChange}
            initialValue=''
            options={progressStatusIdList}
          />
        </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <SecondaryButton text={Messages.get('label.clean')} onClick={this.clearFields}/>
          <PrimaryButton
            text={Messages.get('label.research')}
            onClick={ this.onSubmit }
          />
        </div>
      </Modal>
    );
  }
}

GoalsAdvancedSearchModal.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default GoalsAdvancedSearchModal;


