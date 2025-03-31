import React from 'react';
import PropTypes from 'prop-types';

import SecondaryIconButton from 'forpdi/src/components/buttons/SecondaryIconButton';
import TextField from 'forpdi/src/components/inputs/TextField';
import MultiSelectWithSelectAll from 'forpdi/src/components/inputs/MultiSelectWithSelectAll';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import SelectBox from 'forpdi/src/components/inputs/SelectBox';
import riskArchivedStatus from 'forpdi/src/forrisco/enums/riskArchivedStatus';

import Messages from 'forpdi/src/Messages';

const RiskFilters = ({
  searchValue,
  selectedProcesses,
  selectedLinkedPdi,
  selectedRiskStatus,
  processOptions,
  linkedPdiOptions,
  style,
  onChangeSearch,
  onChangeProcesses,
  onChangeLinkedToPdi,
  onChangeStateRisks,
  onSubmit,
  className,
}, { theme }) => {
  function onSubmitKey(key) {
    if (key === 'Enter') {
      onSubmit(searchValue, selectedProcesses, selectedLinkedPdi, selectedRiskStatus);
    }
  }

  function onClearSearchAndFilters() {
    onChangeSearch('');
    onChangeProcesses([]);
    onChangeLinkedToPdi([]);
    onChangeStateRisks({});
    onSubmit('', [], [], riskArchivedStatus.unarchived.id);
  }

  return (
    <div className={`advanced-search-box ${className}`}>
      <TextField
        label={Messages.get('label.research')}
        type="text"
        value={searchValue}
        maxLength={2025}
        containerStyle={{
          ...style,
          width: '100%',
          minWidth: '150px',
        }}
        className={`text-field ${theme}-text-color ${theme}-secondary-2-bg ${theme}-border-color-1 ${className}`}
        onChange={e => onChangeSearch(e.target.value)}
        placeholder={Messages.get('label.search')}
        onKeyPress={e => onSubmitKey(e.key)}
      />
      <MultiSelectWithSelectAll
        label={Messages.get('label.processes')}
        onChange={onChangeProcesses}
        options={processOptions}
        selectedOptions={selectedProcesses}
        className="multi-select-check-boxes__lists"
        placeholderButtonLabel={Messages.get('label.selectProcess')}
        placeholderToEmpty={Messages.get('label.noLinkedProcesses')}
        style={{ margin: '0 6px 0.5px 15px' }}
      />
      <MultiSelectWithSelectAll
        label={Messages.get('label.linkedToPdi')}
        onChange={onChangeLinkedToPdi}
        options={linkedPdiOptions}
        selectedOptions={selectedLinkedPdi}
        className="multi-select-check-boxes__lists"
        placeholderButtonLabel={Messages.get('label.selectLinkedLevel')}
        placeholderToEmpty={Messages.get('label.noLinkedPdi')}
        style={{ margin: '0 6px 0.5px 15px', minWidth: '240px' }}
        hideSearchField={false}
      />
      <div>
        <SelectBox
          options={riskArchivedStatus.list}
          label={Messages.get('label.stateOfRisk')}
          value={selectedRiskStatus}
          onChange={onChangeStateRisks}
          style={{ minWidth: '240px' }}
          containerStyle={{ margin: '0 6px 0.5px 15px', width: '240px' }}
        />
      </div>
      <SecondaryIconButton
        title={Messages.get('label.clean')}
        style={{ marginRight: '7px', marginBottom: '4px' }}
        icon="times"
        onClick={() => onClearSearchAndFilters()}
        theme={theme}
      />
      <PrimaryButton
        title={Messages.get('label.research')}
        text={Messages.get('label.research')}
        style={{ marginBottom: '1.5px' }}
        onClick={() => onSubmit(searchValue, selectedProcesses, selectedLinkedPdi, selectedRiskStatus)}
        theme={theme}
      />
    </div>
  );
};

RiskFilters.contextTypes = {
  theme: PropTypes.string.isRequired,
};

RiskFilters.propTypes = {
  processOptions: PropTypes.arrayOf(PropTypes.shape({})),
  linkedPdiOptions: PropTypes.arrayOf(PropTypes.shape({})),
  onChangeSearch: PropTypes.func.isRequired,
  onChangeProcesses: PropTypes.func.isRequired,
  onChangeLinkedToPdi: PropTypes.func.isRequired,
  onChangeStateRisks: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  searchValue: PropTypes.string,
  selectedProcesses: PropTypes.arrayOf(PropTypes.shape({})),
  selectedLinkedPdi: PropTypes.arrayOf(PropTypes.shape({})),
  selectedRiskStatus: PropTypes.bool,
  style: PropTypes.shape({}),
  className: PropTypes.string,
};

RiskFilters.defaultProps = {
  processOptions: [],
  linkedPdiOptions: [],
  searchValue: '',
  selectedProcesses: [],
  selectedLinkedPdi: [],
  selectedRiskStatus: riskArchivedStatus.unarchived.id,
  style: {},
  className: '',
};

export default RiskFilters;
