import React from 'react';
import PropTypes from 'prop-types';

import TextArea from 'forpdi/src/components/inputs/TextArea';
import RadioButtonGroup from 'forpdi/src/components/inputs/RadioButtonGroup';
import ResponsibleSelectors from 'forpdi/src/forrisco/components/risk/ResponsibleSelectors';
import DatePickerRange from 'forpdi/src/components/inputs/DatePickerRange';
import FileUploadModal from 'forpdi/src/components/modals/FileUploadModal';
import Modal from 'forpdi/src/components/modals/Modal';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';
import InfoDisplay from 'forpdi/src/components/info/InfoDisplay';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import ErrorControl from 'forpdi/src/components/ErrorControl';

import Messages from 'forpdi/src/Messages';
import radioButtonOptions from 'forpdi/src/enums/yesNoOptions';
import { isResponsibleOrHasPermission } from 'forpdi/src/forrisco/helpers/permissionHelper';

const PreventiveActionForm = ({
  onChange,
  preventiveAction,
  risk,
  errors,
}, { hasForriscoManageRiskItemsPermission, toastr }) => {
  function onChangeHandler(event) {
    const { name, value } = event.target;
    onChange({
      ...preventiveAction,
      [name]: value,
    });
  }

  function onChangeRadioButtonHandler(value, name) {
    onChange({
      ...preventiveAction,
      [name]: value,
    });
  }

  function onValidityChange(validityBegin, validityEnd) {
    onChange({
      ...preventiveAction,
      validityBegin,
      validityEnd,
    });
  }

  function onAnexButtonClick() {
    const { file } = preventiveAction;

    const onSuccess = (fileLink, { fileName }) => {
      onChange({
        ...preventiveAction,
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

  function renderForm() {
    const {
      action,
      accomplished,
      userId,
      validityBegin,
      validityEnd,
      managerId,
      user,
      manager,
      file,
    } = preventiveAction;

    return (
      <div>
        <TextArea
          id="action"
          name="action"
          label={Messages.get('label.action')}
          onChange={onChangeHandler}
          value={action}
          errorMsg={errors.action}
          maxLength={4000}
          required
        />
        <DatePickerRange
          beginValue={validityBegin}
          endValue={validityEnd}
          id="validity"
          label={Messages.get('label.planRiskValidity')}
          onChange={onValidityChange}
          beginErrorMsg={errors.validityBegin}
          endErrorMsg={errors.validityEnd}
        />
        <ResponsibleSelectors
          onChange={onChangeHandler}
          defaultUser={user}
          defaultManager={manager}
          selectedUserId={userId}
          selectedManagerId={managerId}
          errors={errors}
          hasPermission={isResponsibleOrHasPermission(risk, hasForriscoManageRiskItemsPermission)}
        />
        <RadioButtonGroup
          groupName="accomplished"
          options={radioButtonOptions.list}
          label={Messages.get('label.accomplished')}
          checkedValue={accomplished}
          onChange={onChangeRadioButtonHandler}
          className="horizontal-radio-group"
          errorMsg={errors.accomplished}
          required
        />
        <ErrorControl errorMsg={errors.file} style={{ display: 'inline-block' }}>
          <div style={{ height: '92px', width: '188px', marginLeft: '2px' }}>
            <InfoDisplay
              label={Messages.get('label.anex')}
              info={file ? file.name : Messages.get('label.noRegister')}
              required={accomplished}
            />
            <PrimaryButton
              title={Messages.get('label.attachFiles')}
              text={Messages.get('label.attachFiles')}
              onClick={onAnexButtonClick}
            />
          </div>
        </ErrorControl>
      </div>
    );
  }

  return renderForm();
};

PreventiveActionForm.contextTypes = {
  hasForriscoManageRiskItemsPermission: PropTypes.bool.isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

PreventiveActionForm.propTypes = {
  preventiveAction: PropTypes.shape({}),
  onChange: PropTypes.func.isRequired,
  errors: PropTypes.shape({}),
};

PreventiveActionForm.defaultProps = {
  preventiveAction: {},
  errors: {},
};

export default PreventiveActionForm;
