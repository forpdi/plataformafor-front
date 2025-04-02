import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import IconButton from 'forpdi/src/components/buttons/IconButton';
import Label from 'forpdi/src/components/typography/Label';
import ErrorControl from 'forpdi/src/components/ErrorControl';


const MultiFields = ({
  data,
  componentRenderers,
  minRows,
  maxRows,
  onNew,
  onDelete,
  label,
  required,
  errorMsg,
}) => {
  function handleNewRow() {
    if (data.length < maxRows && data.length > 0) {
      const newRowData = { ...data[0] };
      const keys = _.keys(newRowData);
      _.forEach(keys, (key) => {
        newRowData[key] = undefined;
      });
      onNew([...data, newRowData]);
    }
  }

  function handleDeleteRow(idx) {
    onDelete(_.filter(data, (value, dataIdx) => dataIdx !== idx));
  }

  function renderLabel() {
    return (
      <div style={{
        display: 'flex', marginBottom: '10px', alignItems: 'center',
      }}
      >
        <Label required={required} style={{ padding: '5px 0' }}>
          {label}
        </Label>
        {
          data.length < maxRows && (
            <IconButton
              icon="plus"
              onClick={handleNewRow}
              style={{ margin: '0 10px' }}
            />
          )
        }
      </div>
    );
  }

  function renderComponents(value, idx) {
    return (
      _.map(componentRenderers, (componentRender, componentId) => (
        <div key={`component-${componentId}`} className="multi-fields__col">
          {componentRender(value, idx)}
        </div>
      ))
    );
  }

  function renderDeleteIcon(idx) {
    return (
      <div className="multi-fields__icon">
        <IconButton
          icon="trash"
          onClick={() => handleDeleteRow(idx)}
          style={{ margin: '0 0.8rem' }}
        />
      </div>
    );
  }

  return (
    <div className="multi-fields">
      {renderLabel()}
      <ErrorControl errorMsg={errorMsg}>
        {
          _.map(data, (value, idx) => (
            <div key={`field-${idx}`} className="multi-fields__row" id={idx}>
              {renderComponents(value, idx)}
              {idx >= minRows && renderDeleteIcon(idx)}
            </div>
          ))
        }
      </ErrorControl>
    </div>
  );
};

MultiFields.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  componentRenderers: PropTypes.arrayOf(PropTypes.func).isRequired,
  maxRows: PropTypes.number,
  minRows: PropTypes.number,
  label: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
  onNew: PropTypes.func.isRequired,
  required: PropTypes.bool,
  errorMsg: PropTypes.string,
};

MultiFields.defaultProps = {
  maxRows: Number.MAX_SAFE_INTEGER,
  minRows: 1,
  required: false,
  errorMsg: '',
};

export default MultiFields;
