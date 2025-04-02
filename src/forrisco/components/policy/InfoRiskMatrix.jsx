import React from 'react';
import PropTypes from 'prop-types';

import Text from 'forpdi/src/components/typography/Text';
import AxisLabel from 'forpdi/src/forrisco/components/dashboard/AxisLabel';

import Messages from 'forpdi/src/Messages';
import { getMatrixDimensions, getRiskMatrixData } from 'forpdi/src/forrisco/helpers/policyHelper';

import _ from 'underscore';

const InfoRiskMatrix = ({
  matrix,
  riskLevels,
  onClick,
  getRiskLabel,
}) => {
  const renderMatrixCell = (cellData) => {
    const {
      label, color, row, col, onClickHandler,
    } = cellData;

    const commonClassName = 'info-risk-matrix__cell';
    const textColorClassName = color ? 'frisco-secondary-color' : '';

    if (onClickHandler) {
      return (
        <div
          role="button"
          tabIndex="0"
          onClick={onClickHandler}
          onKeyPress={onclick}
          className={`${commonClassName} ${commonClassName}--clickable`}
          key={`matrix-${row}-${col}`}
          style={{
            gridRowStart: row + 1,
            gridColumnStart: col + 1,
            backgroundColor: color || 'none',
          }}
        >
          <Text
            className={`${commonClassName}-text  ${textColorClassName}`}
            text={`${label}`}
          />
        </div>
      );
    }

    return (
      <div
        className={commonClassName}
        key={`matrix-${row}-${col}`}
        style={{
          gridRowStart: row + 1,
          gridColumnStart: col + 1,
          backgroundColor: color || 'none',
        }}
      >
        <Text
          title={`${label}`}
          className={`${commonClassName}-text  ${textColorClassName}`}
          text={`${label}`}
        />
      </div>
    );
  };


  const renderRiskMatrix = () => {
    const {
      probabilities,
      impacts,
      riskMatrix,
    } = getRiskMatrixData(matrix, riskLevels);

    const { nRows: lastRowIndex } = getMatrixDimensions(probabilities, impacts);
    const firstColIndex = 0;
    const resulMatrix = [];

    _.forEach(probabilities, (probability, row) => (
      resulMatrix.push(
        renderMatrixCell({
          row, col: firstColIndex, label: probability,
        }),
      )
    ));

    _.forEach(impacts, (impact, col) => (
      resulMatrix.push(
        renderMatrixCell({
          row: lastRowIndex, col: col + 1, label: impact,
        }),
      )
    ));

    _.forEach(riskMatrix, (row, rowIndex) => (
      _.forEach(row, (element, colIndex) => (
        resulMatrix.push(
          renderMatrixCell({
            row: rowIndex,
            col: colIndex + 1,
            label: getRiskLabel(element, rowIndex, colIndex),
            color: element.color,
            ...onClick && {
              onClickHandler: () => onClick(element, rowIndex, colIndex),
            },
          }),
        )))
    ));

    return (
      <div className="info-risk-matrix frisco-background-lighten-bg">
        {resulMatrix}
      </div>
    );
  };

  const renderVerticalLabel = () => (
    <AxisLabel className="info-risk-matrix__vertical-label">
      {Messages.get('label.probability')}
    </AxisLabel>
  );

  const renderHorizontalLabel = () => (
    <AxisLabel className="info-risk-matrix__horizontal-label">
      {Messages.get('label.impact')}
    </AxisLabel>
  );

  return (
    <div className="info-risk-matrix-container">
      {renderVerticalLabel()}
      {renderRiskMatrix()}
      {renderHorizontalLabel()}
    </div>
  );
};

InfoRiskMatrix.propTypes = {
  riskLevels: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onClick: PropTypes.func,
  matrix: PropTypes.string.isRequired,
  getRiskLabel: PropTypes.func,
};

InfoRiskMatrix.defaultProps = {
  onClick: null,
  getRiskLabel: ({ riskLevel }) => riskLevel,
};

export default InfoRiskMatrix;
