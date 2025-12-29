import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import SelectBox from 'forpdi/src/components/inputs/SelectBox';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import ErrorControl from 'forpdi/src/components/ErrorControl';

import Messages from 'forpdi/src/Messages';
import { getMatrixDimensions } from 'forpdi/src/forrisco/helpers/policyHelper';
import riskLevelColors from 'forpdi/src/forrisco/enums/riskLevelColors';

const toSelectBoxOptions = data => _.map(data, ({ name, colorId }) => ({
  name,
  id: name,
  colorId,
}));

const defaultColorHex = '#F3F2F3';

const RiskMatrixForm = ({
  errors,
  policy,
  onChange,
}) => {
  const { probabilities, impacts } = policy;

  const { nRows, nCols } = getMatrixDimensions(probabilities, impacts);
  const firstColIndex = 0;
  const lastRowIndex = nRows;

  const onChangeHandler = (row, col, value) => {
    const { matrix } = { ...policy };
    matrix[row][col] = value;
    onChange({ ...policy, matrix });
  };

  const renderSelectBox = (row, col, options, placeholder) => {
    const { matrix } = policy;

    const selectedValue = matrix[row][col];
    const selectedOption = options.find(option => option.name === selectedValue);
    const backgroundColor = getCellColor(selectedOption, row, col);

    return (
      <div
        key={`matrix-${row}-${col}`}
        style={{
          gridRowStart: row + 1,
          gridColumnStart: col + 1,
          padding: '10px',
          backgroundColor,
        }}
      >
        <SelectBox
          options={options}
          value={selectedValue}
          errorMsg={errors.matrixInputs && errors.matrixInputs[row][col]}
          showErrorMsg={false}
          onChange={event => onChangeHandler(row, col, event.target.value)}
          chooseOptionLabel={placeholder}
          showChooseOption
        />
      </div>
    );
  };

  function getCellColor(selectedOption, row, col) {
    const showBackgroundColor = row !== lastRowIndex && col !== firstColIndex;
    if (!showBackgroundColor) {
      return 'transparent';
    }

    const hasColor = selectedOption && selectedOption.colorId !== undefined;

    return hasColor
      ? riskLevelColors[selectedOption.colorId].hex
      : defaultColorHex;
  }

  const renderInputMatrix = () => {
    const { riskLevels } = policy;
    const nMatrixCols = nCols + 1;
    const nMatrixRows = nRows + 1;
    const inputMatrix = [];

    for (let row = 0; row < nMatrixRows; row += 1) {
      for (let col = 0; col < nMatrixCols; col += 1) {
        const isLeftBottomInput = (row === lastRowIndex) && (col === firstColIndex);
        if (!isLeftBottomInput) {
          let selectBox;

          if (col === firstColIndex) {
            selectBox = renderSelectBox(
              row,
              col,
              toSelectBoxOptions(probabilities),
              Messages.get('label.selectProbability'),
            );
          } else if (row === lastRowIndex) {
            selectBox = renderSelectBox(
              row,
              col,
              toSelectBoxOptions(impacts),
              Messages.get('label.selectImpact'),
            );
          } else {
            selectBox = renderSelectBox(
              row,
              col,
              toSelectBoxOptions(riskLevels),
              Messages.get('label.selectRiskLevel'),
            );
          }

          inputMatrix.push(selectBox);
        }
      }
    }
    return inputMatrix;
  };

  const renderVerticalLabel = () => (
    <SecondaryTitle
      style={{
        transform: 'rotate(-90deg)',
        zIndex: '1',
        height: 'fit-content',
        marginBottom: '40px',
      }}
    >
      {Messages.get('label.probability')}
    </SecondaryTitle>
  );

  const renderHorizontalLabel = () => (
    <SecondaryTitle
      style={{
        width: 'fit-content',
        textAlign: 'center',
        marginTop: '10px',
        alignSelf: 'center',
        position: 'sticky',
        left: '50%',
      }}
    >
      {Messages.get('label.impact')}
    </SecondaryTitle>
  );

  const renderRiskMatrix = () => (
    <div className="risk-matrix-form-container">
      {renderVerticalLabel()}
      <div className="risk-matrix-form-error-control">
        <ErrorControl style={{ maxWidth: '100%' }} errorMsg={errors.matrixErrorMsg}>
          <div className="risk-matrix-form">
            {renderInputMatrix()}
          </div>
        </ErrorControl>
        {renderHorizontalLabel()}
      </div>
    </div>
  );
  return (
    renderRiskMatrix()
  );
};

RiskMatrixForm.propTypes = {
  errors: PropTypes.shape({}),
  policy: PropTypes.shape({}),
  onChange: PropTypes.func.isRequired,
};

RiskMatrixForm.defaultProps = {
  errors: {},
  policy: {},
};

export default RiskMatrixForm;
