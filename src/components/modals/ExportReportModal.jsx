import React from 'react';
import PropTypes from 'prop-types';

import Modal from 'forpdi/src/components/modals/Modal';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import TextField from 'forpdi/src/components/inputs/TextField';
import CheckBoxGroup from 'forpdi/src/components/inputs/CheckBoxGroup';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import SecondaryButton from 'forpdi/src/components/buttons/SecondaryButton';
import Text from 'forpdi/src/components/typography/Text';
import SelectBox from 'forpdi/src/components/inputs/SelectBox';

import Messages from 'forpdi/src/Messages';
import validationExportReport from 'forpdi/src/forrisco/validations/validationExportReport';

class ExportReportModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      universityName: '',
      checkedValues: [],
      errors: {},
      selectedYear: -1,
    };
  }

  onTextFieldChange = (event) => {
    const { name, value } = event.target;

    this.setState({
      [name]: value,
    });
  }

  onChangeCheckBoxHandler = (values) => {
    this.setState({
      checkedValues: values,
    });
  }

  onChangePeriod = (e) => {
    const { value } = e.target;

    this.setState({
      selectedYear: value,
    });
  }

  onExportHandler = () => {
    const { onExport, customValidation } = this.props;
    const { universityName, checkedValues, selectedYear } = this.state;

    const onSuccess = () => {
      onExport(universityName, checkedValues, selectedYear);
      Modal.hide();
    };

    validationExportReport(universityName, checkedValues, onSuccess, customValidation, this);
  }

  renderHeader() {
    return (
      <div>
        <div className="modal-header" style={{ display: 'flex', padding: '10px 30px 0px 0px' }}>
          <SecondaryTitle>
            {Messages.get('label.exportConfirmation')}
          </SecondaryTitle>
        </div>
        <hr style={{ border: '0.15px solid rgba(101,97, 98, 0.1)', margin: '10px 0px' }} />
      </div>
    );
  }

  renderTextFields() {
    const { universityName, errors, selectedYear } = this.state;
    const { years } = this.props;

    return (
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <TextField
          name="universityName"
          containerStyle={{ width: years ? '60%' : '100%' }}
          errorMsg={errors.universityName}
          onChange={this.onTextFieldChange}
          value={universityName}
          required
          label={Messages.get('label.reportTitle')}
        />
        {years && (
          <SelectBox
            name="selectedYear"
            containerStyle={{ marginTop: 0, width: '35%' }}
            options={years}
            label={Messages.get('label.period')}
            value={selectedYear}
            onChange={this.onChangePeriod}
          />
        )}
      </div>
    );
  }

  renderCheckBoxes() {
    const { options, optionLabelName, optionValueName } = this.props;
    const { checkedValues, errors } = this.state;

    return (
      <div style={{ marginTop: '2rem' }}>
        <CheckBoxGroup
          groupName="checkedValues"
          errorMsg={errors.checkedValues}
          label={Messages.get('label.checkOptions')}
          className="check-group-border"
          options={options}
          checkedValues={checkedValues}
          onChange={this.onChangeCheckBoxHandler}
          optionLabelName={optionLabelName}
          optionValueName={optionValueName}
          checksContainerStyle={{ minHeight: '200px' }}
          showCheckAll
        />
        <br />
        <Text className="fontWeightBold">{Messages.get('label.emptySectionNoExported')}</Text>
      </div>
    );
  }

  renderButtons() {
    return (
      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
        <SecondaryButton
          text={Messages.get('label.cancel')}
          onClick={Modal.hide}
          backgroundClassName="frisco-primary"
        />
        <PrimaryButton
          text={Messages.get('label.export')}
          onClick={this.onExportHandler}
        />
      </div>
    );
  }

  render() {
    return (
      <Modal width="650px" height="auto">
        {this.renderHeader()}
        {this.renderTextFields()}
        {this.renderCheckBoxes()}
        {this.renderButtons()}
      </Modal>
    );
  }
}

ExportReportModal.propTypes = {
  options: PropTypes.shape({}).isRequired,
  optionLabelName: PropTypes.string,
  optionValueName: PropTypes.string,
  onExport: PropTypes.func.isRequired,
  customValidation: PropTypes.func,
  years: PropTypes.arrayOf(PropTypes.shape({})),
};

ExportReportModal.defaultProps = {
  optionLabelName: 'name',
  optionValueName: 'id',
  customValidation: null,
  years: null,
};

export default ExportReportModal;
