import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import ReactQuill from 'react-quill';

import TertiaryButton from 'forpdi/src/components/buttons/TertiaryButton';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import IconButton from 'forpdi/src/components/buttons/IconButton';
import SelectBox from 'forpdi/src/components/inputs/SelectBox';
import itemFieldChoices from 'forpdi/src/forrisco/enums/itemFields';
import ErrorControl from 'forpdi/src/components/ErrorControl';
import TextField from 'forpdi/src/components/inputs/TextField';
import Text from 'forpdi/src/components/typography/Text';

import Messages from 'forpdi/src/Messages';


const ItemFieldsForm = ({
  fields,
  minRows,
  maxRows,
  errors,
  onNew,
  onDelete,
  onChangeItemField,
  onChangeFormattedText,
  onAnexFileButtonClick,
}, { theme }) => {
  function handleNewRow() {
    if (fields.length < maxRows && fields.length >= 0) {
      onNew([...fields, {}]);
    }
  }

  function handleDeleteRow(idx) {
    onDelete(_.filter(fields, (value, fieldsIdx) => fieldsIdx !== idx));
  }

  function renderNewFieldButton() {
    return (
      <div style={{
        display: 'flex', marginBottom: '10px', alignItems: 'center',
      }}
      >
        {
          fields.length < maxRows && (
            <TertiaryButton
              title={Messages.get('label.addNewField')}
              text={Messages.get('label.addNewField')}
              onClick={() => handleNewRow()}
              icon="plus"
              style={{ marginTop: '30px', border: '1px solid' }}
            />
          )
        }
      </div>
    );
  }

  function renderFieldContent(value, idx) {
    const { fieldId, description } = value;

    return (
      <div key={`component-${idx}-field`}>
        { fieldId && (fieldId === String(itemFieldChoices.text.id)
          ? (
            <ReactQuill
              name="Quill"
              id="replyMessage"
              onChange={e => onChangeFormattedText(e, idx)}
              value={value.description || ''}
              style={{
                marginTop: '30px',
                maxHeight: '200px',
                overflow: 'auto',
                width: '96.5%',
              }}
              modules={{
                toolbar: [
                  [{ font: [] }],
                  [{ header: [1, 2, 3, 4, 5, 6, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ color: [] }, { background: [] }],
                  [{ align: [] }],
                  [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
                  ['link', 'image'],
                  ['blockquote', 'code-block'],
                  ['clean'],
                  [{ script: 'sub' }, { script: 'super' }],
                  [{ direction: 'rtl' }],
                ],
              }}
            />
          ) : (
            <div>
              <Text
                style={{ margin: '28px 0px 0px 5px' }}
                fontSize="14px"
              >
                <b className={`${theme}-primary-color`}>
                  {description}
                </b>
              </Text>
              <PrimaryButton
                title={Messages.get('label.attachFiles')}
                text={Messages.get('label.attachFiles')}
                onClick={() => onAnexFileButtonClick(idx)}
                key={`uploadField${idx}`}
                style={{ marginTop: '30px' }}
              />
            </div>
          )
        )}
      </div>
    );
  }

  function renderFieldNameAndType(value, idx) {
    return (
      <div
        className="multi-fields__row"
        key={`component-${idx}`}
        id={idx}
        style={{ marginTop: '20px', flexWrap: 'wrap' }}
      >
        <div className="multi-fields__col">
          <ErrorControl errorMsg={errors.message}>
            <TextField
              label={Messages.get('label.field.name')}
              name="name"
              onChange={e => onChangeItemField(e, idx)}
              value={value.name}
              errorMsg={errors[`itemFields${idx}name`]}
              placeholder={Messages.get('label.title')}
              maxLength={400}
              required
            />
          </ErrorControl>
        </div>
        <div className="multi-fields__col">
          <ErrorControl errorMsg={errors.message}>
            <SelectBox
              label={Messages.get('label.title.selectTypeField')}
              name="fieldId"
              onChange={e => onChangeItemField(e, idx)}
              value={value.fieldId}
              errorMsg={errors[`itemFields${idx}fieldId`]}
              options={itemFieldChoices.list}
              showChooseOption
              optionLabelName="label"
              required
            />
          </ErrorControl>
        </div>
        {idx >= minRows && renderDeleteIcon(idx)}
      </div>
    );
  }

  function renderDeleteIcon(idx) {
    return (
      <div className="multi-fields__icon" style={{ position: 'relative' }}>
        <IconButton
          title={Messages.get('label.delete')}
          icon="trash"
          key={`delete-${idx}`}
          onClick={() => handleDeleteRow(idx)}
          style={{ position: 'absolute', right: '0', marginTop: '-20px' }}
        />
      </div>
    );
  }

  return (
    <div className="multi-fields">
      {
        _.map(fields, (value, idx) => (
          <div key={`field-${idx}`}>
            <div
              style={{ borderWidth: '1px', borderStyle: 'solid', marginTop: '40px' }}
              className={`${theme}-border-color-2`}
            />
            {renderFieldNameAndType(value, idx)}
            {renderFieldContent(value, idx)}
          </div>
        ))
      }
      {renderNewFieldButton()}
    </div>
  );
};

ItemFieldsForm.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onChangeItemField: PropTypes.func.isRequired,
  errors: PropTypes.shape({}).isRequired,
  maxRows: PropTypes.number,
  minRows: PropTypes.number,
  onDelete: PropTypes.func.isRequired,
  onNew: PropTypes.func.isRequired,
  onChangeFormattedText: PropTypes.func.isRequired,
  onAnexFileButtonClick: PropTypes.func.isRequired,
};

ItemFieldsForm.defaultProps = {
  maxRows: Number.MAX_SAFE_INTEGER,
  minRows: 1,
};

ItemFieldsForm.contextTypes = {
  theme: PropTypes.string,
};

export default ItemFieldsForm;
