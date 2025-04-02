import React from 'react';
import PropTypes from 'prop-types';

import Label from 'forpdi/src/components/typography/Label';
import InputContainer from 'forpdi/src/components/inputs/InputContainer';
import Toastr from 'toastr';
import ReactQuill from 'react-quill';
import ErrorControl from 'forpdi/src/components/ErrorControl';

export const RichTextArea = ({
  label,
  id,
  required,
  name,
  value,
  onChange,
  maxLength,
  errorMsg,
  isSimple,
}) => {
  function renderLabel() {
    return (
      label && (
        <Label
          htmlFor={id}
          required={required}
          className="label-vertical"
        >
          {label}
        </Label>
      )
    );
  }

  const onChangeQuill = (content, delta, source, editor) => {
    const length = editor.getLength();
    if (length > maxLength) {
      Toastr.error(`Limite de ${ maxLength } caracteres atingido!`);
    } else {
      onChange({
        target: {
          value: content,
          name,
        },
      });
    }
  };

  const getCustomToolbar = () => {
    const basicTools = [
      [{ font: [] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      [
        { list: 'ordered' },
        { list: 'bullet' },
        { indent: '-1' },
        { indent: '+1' },
      ],
    ];
    const advancedTools = [['link', 'image'],
      ['blockquote', 'code-block'],
      ['clean'],
      [{ script: 'sub' }, { script: 'super' }],
      [{ direction: 'rtl' }]];

    return (isSimple ? basicTools : basicTools.concat(advancedTools));
  };

  return (
    <InputContainer>
      {renderLabel()}
      <ErrorControl errorMsg={errorMsg}>
        <ReactQuill
          name="Quill"
          onChange={onChangeQuill}
          value={value}
          modules={{
            toolbar: getCustomToolbar(),
          }}
          id={id}
          maxLen
        />
      </ErrorControl>
    </InputContainer>
  );
};

RichTextArea.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string.isRequired,
  required: PropTypes.bool,
  name: PropTypes.string,
  value: PropTypes.string,
  errorMsg: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  maxLength: PropTypes.number,
  isSimple: PropTypes.bool,
};

RichTextArea.defaultProps = {
  label: '',
  required: false,
  name: '',
  value: '',
  maxLength: null,
  errorMsg: null,
  isSimple: false,
};

RichTextArea.contextTypes = {
  theme: PropTypes.string,
};

export default RichTextArea;
