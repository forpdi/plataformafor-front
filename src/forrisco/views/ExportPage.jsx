import React from 'react';
import PropTypes from 'prop-types';

import MainTitle from 'forpdi/src/components/typography/MainTitle';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import AppContainer from 'forpdi/src/components/AppContainer';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import InputContainer from 'forpdi/src/components/inputs/InputContainer';
import SelectSearchBox from 'forpdi/src/components/inputs/SelectSearchBox';
import MultiSelectCheckBoxes from 'forpdi/src/components/inputs/MultiSelectCheckBoxes';
import SystemInfo from 'forpdi/src/components/SystemInfo';
import Messages from 'forpdi/src/Messages';

import ExportStore from 'forpdi/src/forrisco/stores/Export';
import PolicyStore from 'forpdi/src/forrisco/stores/Policy';
import PlanRiskStore from 'forpdi/src/forrisco/stores/PlanRisk';
import UnitStore from 'forpdi/src/forrisco/stores/Unit';
import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import ProcessStore from 'forpdi/src/forrisco/stores/Process';

const topContainerHeight = 56;

const fieldBlockStyle = { marginBottom: 16 };
const helpTextStyle = { display: 'block', marginTop: 4 };

const DATA_TYPES = [
  { id: 'unidade', name: 'Unidade' },
  { id: 'subunidade', name: 'Subunidade' },
  { id: 'processo', name: 'Processo' },
  { id: 'risco', name: 'Risco' },
  { id: 'acaoPrevencao', name: 'Ação de prevenção' },
];

const TYPE_CONFIG = {
  unidade: { label: 'Unidade', chain: ['policyRisk', 'plan', 'unit'] },
  subunidade: { label: 'Subunidade', chain: ['policyRisk', 'plan', 'unit', 'subunit'] },
  processo: { label: 'Processo', chain: ['policyRisk', 'plan', 'unit', 'subunit', 'process'] },
  risco: { label: 'Risco', chain: ['policyRisk', 'plan', 'unit', 'subunit', 'risk'] },
  acaoPrevencao: { label: 'Ação de prevenção', chain: ['policyAction', 'plan', 'unit', 'subunit', 'risk', 'action'] },
};

const FIELD_DEFS = {
  policyRisk: { stateKey: 'policyId', optionsKey: 'policies', label: 'Política de risco' },
  policyAction: { stateKey: 'policyId', optionsKey: 'policies', label: 'Política de Ação de prevenção' },
  plan: { stateKey: 'planId', optionsKey: 'plans', label: 'Plano de gestão' },
  unit: { stateKey: 'unitId', optionsKey: 'units', label: 'Unidade' },
  subunit: { stateKey: 'subunitId', optionsKey: 'subunits', label: 'Subunidade' },
  process: { stateKey: 'processId', optionsKey: 'processes', label: 'Processo' },
  risk: { stateKey: 'riskId', optionsKey: 'risks', label: 'Risco' },
  action: { stateKey: 'actionId', optionsKey: 'actions', label: 'Ações de prevenção' },
};

const MULTI_BY_FIELD = {
  unit: 'selectedUnits',
  subunit: 'selectedSubunits',
  process: 'selectedProcesses',
  risk: 'selectedRisks',
  action: 'selectedActions',
};

const PLURAL_PARAM_BY_TYPE = {
  unidade: 'unitIds',
  subunidade: 'subunitIds',
  processo: 'processIds',
  risco: 'riskIds',
  acaoPrevencao: 'actionIds',
};

const SELECT_ALL_SENTINEL = -1;

class ExportPage extends React.Component {
  constructor(props) {
    super(props);

    ExportStore.on('export-success', this.onExportSuccess, this);
    ExportStore.on('export-fail', this.onExportFail, this);

    this.state = {
      selectedDataTypeId: '',
      selections: {
        policyId: '',
        planId: '',
        unitId: '',
        subunitId: '',
        processId: '',
        riskId: '',
        actionId: '',
        selectedUnits: [],
        selectedSubunits: [],
        selectedProcesses: [],
        selectedRisks: [],
        selectedActions: [],
      },
      options: {
        policies: [],
        plans: [],
        units: [],
        subunits: [],
        processes: [],
        risks: [],
        actions: [],
      },
      loading: {
        policies: false,
        plans: false,
        units: false,
        subunits: false,
        processes: false,
        risks: false,
        actions: false,
      },
      resetTick: 0,
    };
  }

  componentDidMount() {
    PolicyStore.on('list-to-select', this.onPoliciesLoaded, this);
    PlanRiskStore.on('list-to-select', this.onPlanRisksLoaded, this);
    UnitStore.on('listToSelect', this.onUnitsLoaded, this);
    ProcessStore.on('processListedByUnit', this.onProcessesListed, this);
    RiskStore.on('risks-filtered', this.onRisksFiltered, this);
    RiskStore.on('preventiveActionsListed', this.onActionsListed, this);

    PolicyStore.dispatch({ action: PolicyStore.ACTION_LIST_TO_SELECT });
  }

  componentWillUnmount() {
    ExportStore.off(null, null, this);
    PolicyStore.off(null, null, this);
    PlanRiskStore.off(null, null, this);
    UnitStore.off(null, null, this);
    ProcessStore.off(null, null, this);
    RiskStore.off(null, null, this);
  }

  onPoliciesLoaded = ({ data }) => {
    const list = (data && Array.isArray(data.list)) ? data.list : [];
    this.setOptions('policies', list);
  };

  onPlanRisksLoaded = ({ data }) => {
    const list = (data && Array.isArray(data.list)) ? data.list : [];
    this.setOptions('plans', list);
  };

  onUnitsLoaded = ({ data }) => {
    const list = (data && Array.isArray(data.list)) ? data.list : [];
    const units = list.filter(({ parentId }) => !parentId);

    const { selections } = this.state;
    const currentUnitId = Number(selections.unitId) || 0;
    const subunits = currentUnitId
      ? list.filter(({ parentId }) => !!parentId && Number(parentId) === currentUnitId)
      : [];

    this.setOptions('units', units);
    this.setOptions('subunits', subunits);
    this.maybeFetchRisks();
    this.maybeFetchProcesses();
  };

  onProcessesListed = ({ list, data } = {}) => {
    let arr = [];
    if (Array.isArray(list)) arr = list;
    else if (data && Array.isArray(data.list)) arr = data.list;
    else if (Array.isArray(data)) arr = data;
    this.setOptions('processes', arr);
  };

  onRisksFiltered = (response) => {
    let arr = [];
    if (response && Array.isArray(response.list)) arr = response.list;
    else if (response && Array.isArray(response.data)) arr = response.data;
    this.setOptions('risks', arr);
  };

  onActionsListed = (response = {}) => {
    let src = [];
    if (Array.isArray(response.data)) src = response.data;
    else if (response.data && Array.isArray(response.data.data)) src = response.data.data;

    const mapped = src
      .filter(it => it && typeof it === 'object')
      .map((it) => {
        const id = it.id
          ?? it.actionId
          ?? it.preventiveActionId
          ?? (it.action && it.action.id);

        const name = it.name
          ?? it.actionName
          ?? it.action
          ?? it.description
          ?? it.title
          ?? it.label
          ?? (it.action && (it.action.name || it.action.description || it.action.title));

        return { id, name };
      })
      .filter(it => `${it.id}`.trim() && `${it.name}`.trim());

    this.setOptions('actions', mapped);
  };

  getFlowChain() {
    const { selectedDataTypeId } = this.state;
    return TYPE_CONFIG[selectedDataTypeId]?.chain || [];
  }

  isLastField(fieldKey) {
    const chain = this.getFlowChain();
    return chain[chain.length - 1] === fieldKey;
  }

  buildUnitIds = () => {
    const { selections } = this.state;
    const { unitId, subunitId } = selections;
    const isValid = v => v != null && `${v}`.trim() && !Number.isNaN(Number(v));
    if (isValid(subunitId)) return [Number(subunitId)];
    if (isValid(unitId)) return [Number(unitId)];
    return [];
  };

  computeResetKey(fieldKey) {
    const { selectedDataTypeId, selections, resetTick } = this.state;
    const s = selections;
    let base;
    switch (fieldKey) {
    case 'policyRisk':
    case 'policyAction':
      base = `${selectedDataTypeId}|policy:${s.policyId}`;
      break;
    case 'plan':
      base = `${selectedDataTypeId}|policy:${s.policyId}`;
      break;
    case 'unit':
      base = `plan:${s.planId}`;
      break;
    case 'subunit':
      base = `plan:${s.planId}|unit:${s.unitId}`;
      break;
    case 'process':
      base = `plan:${s.planId}|unit:${s.unitId}|sub:${s.subunitId}`;
      break;
    case 'risk':
      base = `plan:${s.planId}|unit:${s.unitId}|sub:${s.subunitId}`;
      break;
    case 'action':
      base = `plan:${s.planId}|unit:${s.unitId}|sub:${s.subunitId}|risk:${s.riskId}`;
      break;
    default:
      base = `${selectedDataTypeId}`;
    }
    return `${base}|v:${resetTick}`;
  }

  fetchProcesses = () => {
    const { selections } = this.state;
    const unitIds = this.buildUnitIds();
    const id = unitIds[0];
    if (!selections.planId || !id) {
      this.setOptions('processes', []);
      return;
    }
    ProcessStore.listProcessByUnit({
      id, page: 1, pageSize: 200, term: '', sortedBy: '',
    });
  };

  maybeFetchProcesses = () => {
    const { selectedDataTypeId, selections } = this.state;
    if (selectedDataTypeId !== 'processo') return;
    const unitIds = this.buildUnitIds();
    const hasContext = selections.planId && unitIds.length > 0;
    if (hasContext) this.fetchProcesses();
    else this.setOptions('processes', []);
  };

  fetchRisks = () => {
    const { selections } = this.state;
    const unitIds = this.buildUnitIds();
    if (!selections.planId || unitIds.length === 0) {
      this.setOptions('risks', []);
      return;
    }
    RiskStore.dispatch({
      action: RiskStore.ACTION_FILTER_RISKS,
      data: {
        planRiskId: Number(selections.planId),
        page: 1,
        pageSize: 9999,
        filters: {
          nameOrCode: '',
          type: null,
          typologies: [],
          responses: [],
          levels: [],
          riskClassifications: [],
          startCreation: null,
          endCreation: null,
          unitIds,
        },
      },
      opts: { filtering: true },
    });
  };

  maybeFetchRisks = () => {
    const { selectedDataTypeId, selections } = this.state;
    const shouldLoad = selectedDataTypeId === 'risco' || selectedDataTypeId === 'acaoPrevencao';
    if (!shouldLoad) return;
    const unitIds = this.buildUnitIds();
    const hasContext = selections.planId && unitIds.length > 0;
    if (hasContext) this.fetchRisks();
    else this.setOptions('risks', []);
  };

  fetchActions = () => {
    const { selections } = this.state;
    const { riskId } = selections;
    if (!riskId || Number.isNaN(Number(riskId))) {
      this.setOptions('actions', []);
      return;
    }
    RiskStore.dispatch({
      action: RiskStore.ACTION_LIST_PREVENTIVE_ACTIONS,
      data: {
        riskId: Number(riskId), page: 1, pageSize: 200, term: '', sortedBy: '',
      },
    });
  };

  maybeFetchActions = () => {
    const { selectedDataTypeId, selections } = this.state;
    if (selectedDataTypeId !== 'acaoPrevencao') return;
    if (selections.riskId != null && `${selections.riskId}`.trim()) this.fetchActions();
    else this.setOptions('actions', []);
  };

  // ---------- Utils ----------
  notify = (msg, kind = 'info') => {
    const { toastr } = this.context || {};
    if (!toastr) return;
    const text = `${msg || ''}`.trim() || 'Operação concluída.';
    if (kind === 'success') toastr.addAlertSuccess(text);
    else if (kind === 'error') toastr.addAlertError(text);
    else if (kind === 'warning' && toastr.addAlertWarning) toastr.addAlertWarning(text);
    else if (toastr.addAlertInfo) toastr.addAlertInfo(text);
    else toastr.addAlertSuccess(text);
  };

  setOptions = (optionsKey, rows) => {
    const normalized = Array.isArray(rows)
      ? rows
        .filter(it => it && typeof it === 'object')
        .map(it => ({ id: `${it.id ?? it.value ?? ''}`, name: `${it.name ?? it.label ?? ''}` }))
        .filter(it => it.id && it.name)
      : [];
    this.setState(prev => ({ options: { ...prev.options, [optionsKey]: normalized } }));
  };

  filterOutSelectAll(arr) {
    return (Array.isArray(arr) ? arr : []).filter(x => `${x.id}` !== `${SELECT_ALL_SENTINEL}`);
  }

  clearMultiSelections(obj) {
    return {
      ...obj,
      selectedUnits: [],
      selectedSubunits: [],
      selectedProcesses: [],
      selectedRisks: [],
      selectedActions: [],
    };
  }

  clearFromField(fieldKey) {
    const chain = this.getFlowChain();
    const startIdx = chain.indexOf(fieldKey);
    if (startIdx < 0) return;

    this.setState((prev) => {
      const newSelections = { ...prev.selections };
      const newOptions = { ...prev.options };
      const newLoading = { ...prev.loading };

      chain.slice(startIdx + 1).forEach((key) => {
        const def = FIELD_DEFS[key];
        if (def?.stateKey) newSelections[def.stateKey] = '';
        if (def?.optionsKey) {
          newOptions[def.optionsKey] = [];
          newLoading[def.optionsKey] = false;
        }
      });

      return {
        selections: this.clearMultiSelections(newSelections),
        options: newOptions,
        loading: newLoading,
        resetTick: prev.resetTick + 1,
      };
    });
  }

  // ---------- Handlers ----------
  getValueFromChange = (arg) => {
    if (arg && typeof arg === 'object') {
      if (arg.target && 'value' in arg.target) return `${arg.target.value ?? ''}`;
      if ('id' in arg && arg.id != null) return `${arg.id}`;
      if ('value' in arg && arg.value != null) return `${arg.value}`;
    }
    return `${arg ?? ''}`;
  };

  onDataTypeChange = (valueOrEventOrOption) => {
    const selectedDataTypeId = this.getValueFromChange(valueOrEventOrOption);

    this.setState(prev => ({
      selectedDataTypeId,
      selections: this.clearMultiSelections({
        policyId: '',
        planId: '',
        unitId: '',
        subunitId: '',
        processId: '',
        riskId: '',
        actionId: '',
      }),
      options: {
        policies: prev.options.policies,
        plans: [],
        units: [],
        subunits: [],
        processes: [],
        risks: [],
        actions: [],
      },
      resetTick: prev.resetTick + 1,
    }));
  };

  onSelectChange = (fieldKey, valueOrEventOrOption) => {
    const value = this.getValueFromChange(valueOrEventOrOption);
    const def = FIELD_DEFS[fieldKey];
    if (!def) return;

    this.clearFromField(fieldKey);

    this.setState(
      prev => ({ selections: { ...prev.selections, [def.stateKey]: value } }),
      () => {
        const { selections } = this.state;
        const policyId = Number(selections.policyId);
        const planRiskId = Number(selections.planId);

        switch (fieldKey) {
        case 'policyRisk':
        case 'policyAction': {
          if (policyId) {
            PlanRiskStore.dispatch({
              action: PlanRiskStore.ACTION_LIST_TO_SELECT,
              data: { policyId },
            });
          }
          break;
        }
        case 'plan': {
          if (planRiskId) {
            UnitStore.dispatch({
              action: UnitStore.ACTION_LIST_TO_SELECT,
              data: { planRiskId },
            });
            this.maybeFetchRisks();
            this.maybeFetchProcesses();
            this.maybeFetchActions();
          }
          break;
        }
        case 'unit': {
          this.maybeFetchRisks();
          if (planRiskId) {
            UnitStore.dispatch({
              action: UnitStore.ACTION_LIST_TO_SELECT,
              data: { planRiskId },
            });
          }
          this.maybeFetchProcesses();
          this.maybeFetchActions();
          break;
        }
        case 'subunit': {
          this.maybeFetchRisks();
          this.maybeFetchProcesses();
          this.maybeFetchActions();
          break;
        }
        case 'risk': {
          this.maybeFetchActions();
          break;
        }
        default:
          break;
        }
      },
    );
  };

  addSelectAllOption(arr) {
    const base = Array.isArray(arr) ? arr : [];
    return base.length > 0
      ? [{ id: SELECT_ALL_SENTINEL, name: 'Selecionar todos' }, ...base]
      : base;
  }

  onMultiSelectChange = (fieldKey, selectedOptions) => {
    const multiKey = MULTI_BY_FIELD[fieldKey];
    if (!multiKey) return;

    const def = FIELD_DEFS[fieldKey];
    this.setState((prev) => {
      const baseOpts = def ? (prev.options[def.optionsKey] || []) : [];
      const prevArr = prev.selections[multiKey] || [];

      const isAll = x => `${x?.id}` === `${SELECT_ALL_SENTINEL}`;
      const arr = Array.isArray(selectedOptions) ? selectedOptions : [];
      const hasAllNow = arr.some(isAll);
      const hadAllBefore = prevArr.some(isAll);
      const arrWithoutAll = arr.filter(x => !isAll(x));

      if (hasAllNow && !hadAllBefore) {
        return { selections: { ...prev.selections, [multiKey]: [{ id: SELECT_ALL_SENTINEL, name: 'Selecionar todos' }, ...baseOpts] } };
      }
      if (hasAllNow && hadAllBefore) {
        return { selections: { ...prev.selections, [multiKey]: arrWithoutAll } };
      }
      if (!hasAllNow && hadAllBefore) {
        return { selections: { ...prev.selections, [multiKey]: [] } };
      }
      return { selections: { ...prev.selections, [multiKey]: arrWithoutAll } };
    });
  };

  isFieldRequired(fieldKey) {
    const chain = this.getFlowChain();
    const lastField = chain[chain.length - 1];
    if (fieldKey === 'subunit' && (lastField === 'risk' || lastField === 'process' || lastField === 'action')) {
      return false;
    }
    return chain.indexOf(fieldKey) < chain.length - 1;
  }

  isExportTemplateEnabled() {
    const { selectedDataTypeId } = this.state;
    return !!selectedDataTypeId;
  }

  isExportEnabled() {
    const { selectedDataTypeId, selections } = this.state;
    if (!selectedDataTypeId) return false;

    const chain = this.getFlowChain();
    if (chain.length === 0) return false;

    const requiredParentsOk = chain.slice(0, chain.length - 1).every((fieldKey) => {
      if (!this.isFieldRequired(fieldKey)) return true;
      const stateKey = FIELD_DEFS[fieldKey]?.stateKey;
      return stateKey ? !!selections[stateKey] : true;
    });
    if (!requiredParentsOk) return false;

    const lastField = chain[chain.length - 1];
    const multiKey = MULTI_BY_FIELD[lastField];

    const selectedArrRaw = selections[multiKey] || [];
    const selectedArr = this.filterOutSelectAll(selectedArrRaw);
    const hasSelectAllSentinel = selectedArrRaw.some(x => `${x.id}` === `${SELECT_ALL_SENTINEL}`);

    return selectedArr.length > 0 || hasSelectAllSentinel;
  }

  buildExportQuery() {
    const { selectedDataTypeId, selections, options } = this.state;

    const chain = this.getFlowChain();
    const lastField = chain[chain.length - 1];
    const lastLabel = FIELD_DEFS[lastField]?.label || 'final';
    const lastOptsKey = FIELD_DEFS[lastField]?.optionsKey;

    const {
      policyId, planId, unitId, subunitId, processId, riskId, actionId,
      selectedUnits, selectedSubunits, selectedProcesses, selectedRisks, selectedActions,
    } = selections;

    const selectedMap = {
      unit: selectedUnits,
      subunit: selectedSubunits,
      process: selectedProcesses,
      risk: selectedRisks,
      action: selectedActions,
    };

    const selectedArrRaw = selectedMap[lastField] || [];
    const selectedArr = this.filterOutSelectAll(selectedArrRaw);
    const allOptions = options[lastOptsKey] || [];
    const total = allOptions.length;

    const hasSelectAllSentinel = selectedArrRaw.some(x => `${x.id}` === `${SELECT_ALL_SENTINEL}`);
    const allIds = allOptions.map(o => o.id);

    const idsForPlural = (hasSelectAllSentinel || (selectedArr.length === total && total > 0))
      ? allIds
      : selectedArr.map(x => x.id);

    const base = {
      type: selectedDataTypeId,
      policyId: policyId || undefined,
      planId: planId || undefined,
      unitId: selectedDataTypeId === 'unidade' ? undefined : (unitId || undefined),
      subunitId: subunitId || undefined,
      processId: processId || undefined,
      riskId: riskId || undefined,
      actionId: actionId || undefined,
    };

    const pluralParam = PLURAL_PARAM_BY_TYPE[selectedDataTypeId];
    if (pluralParam) base[pluralParam] = idsForPlural.join(',') || undefined;

    if (hasSelectAllSentinel || (selectedArr.length === total && total > 0)) {
      base.exportAllAtLevel = lastLabel;
      if (selectedDataTypeId === 'acaoPrevencao') base.riskId = undefined;
    }

    return base;
  }

  onExportSuccess = (payload) => {
    const name = payload?.filename ? ` (${payload.filename})` : '';
    this.notify(`Exportação concluída${name}.`, 'success');
  };

  onExportFail = ({ message } = {}) => {
    this.notify(message || 'Falha na exportação.', 'error');
  };

  handleExportClick = () => {
    if (!this.isExportEnabled()) {
      this.notify('Preencha os campos obrigatórios antes de exportar os dados.');
      return;
    }
    const { selectedDataTypeId } = this.state;
    const params = this.buildExportQuery();
    const pluralParamKey = PLURAL_PARAM_BY_TYPE[selectedDataTypeId];
    const idString = params[pluralParamKey];
    const idsList = idString ? idString.split(',').map(Number) : [];
    ExportStore.dispatch({ action: ExportStore.ACTION_RUN, data: { type: selectedDataTypeId, ids: idsList } });
  };

  handleExportTemplate = () => {
    if (!this.isExportTemplateEnabled()) {
      this.notify('Selecione um tipo de dado antes de exportar a estrutura.');
      return;
    }
    const { selectedDataTypeId } = this.state;
    ExportStore.dispatch({
      action: ExportStore.ACTION_TEMPLATE,
      data: { type: selectedDataTypeId },
    });
  };

  renderInfoText() {
    return (
      <SystemInfo iconAlign="flex-start">
        <div>
          Esta tela permite
          {' '}
          <strong>exportar dados</strong>
          {' '}
do sistema. Selecione o tipo de dado e
          preencha a hierarquia. O arquivo seguirá a estrutura padrão utilizada para a importação
          dos dados.
        </div>
      </SystemInfo>
    );
  }

  renderTypeAndTemplateRow() {
    const { selectedDataTypeId, resetTick } = this.state;

    return (
      <InputContainer className="row" style={{ display: 'flex', alignItems: 'flex-end' }}>
        <div className="col col-sm-6" style={fieldBlockStyle}>
          <SelectSearchBox
            key={`dataType-${selectedDataTypeId}|v:${resetTick}`}
            id="dataType"
            options={DATA_TYPES}
            optionValueName="id"
            optionLabelName="name"
            label="Tipo de dado"
            value={selectedDataTypeId}
            onChange={this.onDataTypeChange}
            required
            placeholderButtonLabel="Selecione"
            placeholderToEmpty="Nenhum tipo de dado disponível."
            searchPlaceholder="Pesquisar tipo de dado…"
            noResultsText="Nenhum tipo encontrado"
          />
        </div>

        <div className="col col-sm-6" style={fieldBlockStyle}>
          <PrimaryButton
            text="Exportar Estrutura Padrão"
            title="Exportar Estrutura Padrão"
            onClick={this.handleExportTemplate}
            disabled={!this.isExportTemplateEnabled()}
          />
        </div>
      </InputContainer>
    );
  }

  renderField(fieldKey, isLast) {
    const { selections, options, loading } = this.state;
    const def = FIELD_DEFS[fieldKey];
    const opts = options[def.optionsKey] || [];
    const resetKey = this.computeResetKey(fieldKey);

    if (!isLast) {
      return (
        <div>
          <SelectSearchBox
            key={`single-${fieldKey}-${resetKey}`}
            id={fieldKey}
            options={opts}
            optionValueName="id"
            optionLabelName="name"
            label={def.label}
            value={selections[def.stateKey] || ''}
            onChange={val => this.onSelectChange(fieldKey, val)}
            required={this.isFieldRequired(fieldKey)}
            disabled={!!loading[def.optionsKey] || opts.length === 0}
            placeholderButtonLabel="Selecione"
            placeholderToEmpty={`Nenhuma opção para ${def.label}.`}
            searchPlaceholder={`Pesquisar ${def.label.toLowerCase()}…`}
            noResultsText={`Nenhum ${def.label.toLowerCase()} encontrado`}
          />
          {loading[def.optionsKey] ? (
            <small className="text-muted" style={helpTextStyle}>
              Carregando
              {' '}
              {def.label.toLowerCase()}
...
            </small>
          ) : null}
          {!loading[def.optionsKey] && opts.length === 0 ? (
            <small className="text-muted" style={helpTextStyle}>Nenhum registro disponível.</small>
          ) : null}
        </div>
      );
    }

    const multiKey = MULTI_BY_FIELD[fieldKey];
    const selectedOptions = selections[multiKey] || [];
    const needsUnitForSubunit = fieldKey === 'subunit' && !selections.unitId;
    const needsRiskForAction = fieldKey === 'action' && !selections.riskId;
    const disabled = needsUnitForSubunit || needsRiskForAction || !!loading[def.optionsKey] || opts.length === 0;

    return (
      <div>
        <MultiSelectCheckBoxes
          key={`multi-${fieldKey}-${resetKey}`}
          name={multiKey}
          id={fieldKey}
          label={def.label}
          options={this.addSelectAllOption(opts)}
          value={selectedOptions}
          onChange={arr => this.onMultiSelectChange(fieldKey, arr)}
          placeholderButtonLabel={Messages.get('label.select')}
          hideSearchField={false}
          required
          disabled={disabled}
        />
        {needsUnitForSubunit ? (
          <small className="text-muted" style={helpTextStyle}>Selecione uma unidade antes.</small>
        ) : null}
        {needsRiskForAction ? (
          <small className="text-muted" style={helpTextStyle}>Selecione um risco antes.</small>
        ) : null}
      </div>
    );
  }

  renderCascadeSelectors() {
    const chain = this.getFlowChain();
    if (chain.length === 0) return null;

    return (
      <InputContainer className="row">
        {chain.map((key) => {
          const isLast = this.isLastField(key);
          return (
            <div key={`col-${key}`} className="col col-sm-6" style={fieldBlockStyle}>
              {this.renderField(key, isLast)}
            </div>
          );
        })}
      </InputContainer>
    );
  }

  renderMainContent = () => (
    <TabbedPanel.MainContainer>
      {this.renderInfoText()}
      {this.renderTypeAndTemplateRow()}
      {this.renderCascadeSelectors()}
    </TabbedPanel.MainContainer>
  );

  render() {
    return (
      <AppContainer.Content>
        <AppContainer.TopContent>
          <MainTitle label={Messages.get('label.exportData')} />
          <div>
            <PrimaryButton
              title={Messages.get('label.exportData')}
              text={Messages.get('label.exportData')}
              onClick={this.handleExportClick}
              disabled={!this.isExportEnabled()}
            />
          </div>
        </AppContainer.TopContent>

        <AppContainer.MainContent>
          <TabbedPanel
            tabs={[{ label: Messages.get('label.exportData') }]}
            topContainerContent={{ height: topContainerHeight }}
          >
            {this.renderMainContent()}
          </TabbedPanel>
        </AppContainer.MainContent>
      </AppContainer.Content>
    );
  }
}

ExportPage.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }),
  dataProvider: PropTypes.shape({
    listPolicies: PropTypes.func,
    listPlans: PropTypes.func,
    listUnits: PropTypes.func,
    listSubunits: PropTypes.func,
    listProcesses: PropTypes.func,
    listRisks: PropTypes.func,
    listActions: PropTypes.func,
  }),
};

ExportPage.defaultProps = {
  location: { pathname: '' },
  dataProvider: null,
};

ExportPage.contextTypes = {
  toastr: PropTypes.shape({}).isRequired,
};

export default ExportPage;
