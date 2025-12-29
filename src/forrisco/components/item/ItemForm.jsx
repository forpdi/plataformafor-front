import $ from 'jquery';
import React from 'react';
import PropTypes from 'prop-types';

import TextField from 'forpdi/src/components/inputs/TextField';
import ItemFieldsForm from 'forpdi/src/components/ItemFieldsForm';
import FileUploadModal from 'forpdi/src/components/modals/FileUploadModal';
import Modal from 'forpdi/src/components/modals/Modal';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';

import Messages from 'forpdi/src/Messages';


const ItemForm = ({
  onChange,
  errors,
  item,
  maxTexFieldLength,
}, { toastr }) => {
  function onChangeHandler(e) {
    const { name, value } = e.target;
    onChange({
      ...item,
      [name]: value,
    });
  }

  function onNewField(data) {
    onChange({
      ...item,
      itemFields: data,
    });
  }

  function onRemoveField(data) {
    onChange({
      ...item,
      itemFields: data,
    });
  }

  function onAnexButtonClick(idx) {
    const { itemFields } = item;
    const newItemFields = [...itemFields];

    const onSuccess = (fileLink, { fileName }) => {
      newItemFields[idx] = { ...newItemFields[idx], fileLink, description: fileName };
      onChange({
        ...item,
        itemFields: newItemFields,
      });
      toastr.addAlertSuccess(Messages.get('label.uploadSuccessful'));
    };

    const fileUploadModal = (
      <FileUploadModal onSuccess={onSuccess} />
    );

    if (newItemFields[idx].fileLink) {
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

  function onChangeFormattedText(e, idx) {
    const { itemFields } = item;
    const newItemFields = [...itemFields];

    $(e).text().length < maxTexFieldLength && (
      newItemFields[idx] = { ...newItemFields[idx], description: e }
    );

    onChange({
      ...item,
      itemFields: newItemFields,
    });
  }

  function onChangeItemField(event, idx) {
    const { name, value } = event.target;
    const { itemFields } = item;

    itemFields[idx] = { ...itemFields[idx], [name]: value };
    onChange({
      ...item,
      itemFields: [...itemFields],
    });
  }

  function renderItemField() {
    const { itemFields } = item;


    return (
      <ItemFieldsForm
        errors={errors}
        minRows={0}
        fields={itemFields}
        onNew={onNewField}
        onDelete={onRemoveField}
        onChangeItemField={onChangeItemField}
        onChangeFormattedText={onChangeFormattedText}
        onAnexFileButtonClick={onAnexButtonClick}
      />
    );
  }

  return (
    <div>
      <TextField
        id="name"
        name="name"
        label={Messages.get('label.title')}
        onChange={onChangeHandler}
        value={item.name}
        errorMsg={errors.name}
        placeholder={Messages.get('label.title')}
        maxLength={255}
        required
      />
      {renderItemField()}
    </div>
  );
};

ItemForm.contextTypes = {
  toastr: PropTypes.shape({}).isRequired,
};

ItemForm.propTypes = {
  onChange: PropTypes.func.isRequired,
  maxTexFieldLength: PropTypes.number,
  planRisk: PropTypes.shape({}),
  errors: PropTypes.shape({}),
  item: PropTypes.shape({}),
};

ItemForm.defaultProps = {
  maxTexFieldLength: 4000,
  planRisk: {},
  errors: {},
  item: {},
};

export default ItemForm;
