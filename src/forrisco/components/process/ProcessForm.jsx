import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';

import CheckBoxGroup from 'forpdi/src/components/inputs/CheckBoxGroup';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import TextField from 'forpdi/src/components/inputs/TextField';
import FileUploadModal from 'forpdi/src/components/modals/FileUploadModal';
import Modal from 'forpdi/src/components/modals/Modal';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';
import InfoDisplay from 'forpdi/src/components/info/InfoDisplay';
import MultiFields from 'forpdi/src/components/MultiFields';
import InputContainer from 'forpdi/src/components/inputs/InputContainer';

import Messages from 'forpdi/src/Messages';
import UnitStore from 'forpdi/src/forrisco/stores/Unit';

const objectivesMaxRows = 10;
const objectivesMinRows = 1;
const inputContainerStyle = { margin: 0 };

class ProcessForm extends React.Component {
  constructor(props) {
    super(props);

    this.onChangeHandler = this.onChangeHandler.bind(this);

    this.state = {
      units: [],
      checkedOptions: [],
    };
  }

  componentDidMount() {
    const { unit, process } = this.props;
    const { planRisk, id: unitId } = unit;
    const { relatedUnits } = process;

    UnitStore.on('unitbyplan', ({ data }) => {
      this.setState({
        units: _.filter(data, ({ id }) => id !== unitId),
        checkedOptions: this.toCheckedOptions(relatedUnits),
      });
    }, this);

    UnitStore.dispatch({
      action: UnitStore.ACTION_FIND_BY_PLAN,
      data: planRisk.id,
    });
  }

  toCheckBoxOptions = data => (
    _.map(data, element => (
      { label: element.name, value: element.id }
    ))
  );

  toCheckedOptions = data => (
    _.map(data, element => (
      element.id
    ))
  );

  componentWillUnmount() {
    UnitStore.off(null, null, this);
  }

  onChangeHandler = (e) => {
    const { process, onChange } = this.props;
    const { name, value } = e.target;

    onChange({
      ...process,
      [name]: value,
    });
  }

  onChangeCheckBoxHandler = (values) => {
    const { process, onChange } = this.props;
    const { units } = this.state;

    this.setState({
      checkedOptions: values,
    }, () => (
      onChange({
        ...process,
        relatedUnits: units.filter(unit => values.includes(unit.id)),
      })
    ));
  }

  onChangeAllObjectives = (event, idx) => {
    const { onChange, process } = this.props;

    const { name, value } = event.target;
    const { allObjectives } = process;
    allObjectives[idx] = { ...allObjectives[idx], [name]: value };

    onChange({ ...process, allObjectives });
  }

  onAnexButtonClick = () => {
    const { toastr } = this.context;
    const { process, onChange } = this.props;
    const { file } = process;

    const onSuccess = (fileLink, { fileName }) => {
      onChange({
        ...process,
        fileLink,
        file: { ...file, name: fileName },
      });
      toastr.addAlertSuccess(Messages.get('label.uploadSuccessful'));
    };

    const fileUploadModal = (
      <FileUploadModal onSuccess={onSuccess} />
    );

    if (file) {
      const confirmModal = (
        <ConfirmModal
          text={Messages.get('label.overwriteAttachment')}
          onConfirm={() => Modal.hide(() => Modal.show(fileUploadModal))}
        />
      );

      Modal.show(confirmModal);
    } else {
      Modal.show(fileUploadModal);
    }
  }

  render() {
    const {
      errors, process, unit, onChange,
    } = this.props;
    const { units, checkedOptions } = this.state;
    const {
      name, allObjectives, file,
    } = process;

    const componentRenderers = [
      (value, idx) => (
        <TextField
          containerStyle={inputContainerStyle}
          name="description"
          onChange={e => this.onChangeAllObjectives(e, idx)}
          value={value.description}
          placeholder={Messages.get('label.objective')}
        />
      ),
    ];

    return (
      <div>
        <TextField
          id="name"
          name="name"
          label={Messages.get('label.process.name')}
          onChange={this.onChangeHandler}
          value={name}
          errorMsg={errors.name}
          containerStyle={{ flex: '1' }}
          maxLength={255}
          required
        />
        <InputContainer>
          <MultiFields
            componentRenderers={componentRenderers}
            data={allObjectives}
            maxRows={objectivesMaxRows}
            minRows={objectivesMinRows}
            onNew={data => onChange({ ...process, allObjectives: data })}
            onDelete={data => onChange({ ...process, allObjectives: data })}
            label={Messages.get('label.objective')}
            errorMsg={errors.allObjectives}
            required
          />
        </InputContainer>
        <div style={{
          display: 'flex',
          gap: '50px',
          marginBottom: '3rem',
        }}
        >
          <InfoDisplay
            containerStyle={{ maxWidth: '50%', wordWrap: 'break-word' }}
            label={Messages.get('label.responsibleUnit')}
            info={unit.name}
          />
          <CheckBoxGroup
            groupName="relatedUnits"
            label={Messages.get('label.relatedUnits')}
            onChange={this.onChangeCheckBoxHandler}
            errorMsg={errors.relatedUnits}
            style={{ minWidth: '30%', maxWidth: '500px' }}
            className="check-group-border"
            options={this.toCheckBoxOptions(units)}
            checkedValues={checkedOptions}
          />
        </div>
        <InfoDisplay
          label={Messages.get('label.anex')}
          info={file ? file.name : Messages.get('label.noRegister')}
        />
        <PrimaryButton
          title={Messages.get('label.attachFiles')}
          text={Messages.get('label.attachFiles')}
          onClick={this.onAnexButtonClick}
        />
      </div>
    );
  }
}

ProcessForm.contextTypes = {
  toastr: PropTypes.shape({}).isRequired,
};

ProcessForm.propTypes = {
  unit: PropTypes.shape({}).isRequired,
  onChange: PropTypes.func.isRequired,
  process: PropTypes.shape({}),
  errors: PropTypes.shape({}),
};

ProcessForm.defaultProps = {
  process: {},
  errors: {},
};

export default ProcessForm;
