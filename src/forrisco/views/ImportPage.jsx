import React from 'react';
import PropTypes from 'prop-types';

import MainTitle from 'forpdi/src/components/typography/MainTitle';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import AppContainer from 'forpdi/src/components/AppContainer';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';
import Modal from 'forpdi/src/components/modals/Modal';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import InputContainer from 'forpdi/src/components/inputs/InputContainer';
import SelectSearchBox from 'forpdi/src/components/inputs/SelectSearchBox';
import SystemInfo from 'forpdi/src/components/SystemInfo';
import Messages from 'forpdi/src/Messages';
import dataImportEnum from 'forpdi/src/forrisco/enums/importData';
import Icon from 'forpdi/src/components/Icon';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';

import PolicyStore from 'forpdi/src/forrisco/stores/Policy';
import PlanRiskStore from 'forpdi/src/forrisco/stores/PlanRisk';
import UnitStore from 'forpdi/src/forrisco/stores/Unit';
import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import ImportStore from 'forpdi/src/forrisco/stores/Import';

const topContainerHeight = 56;
const MAX_FILE_MB = 5;

const fieldBlockStyle = { marginBottom: 16 };
const helpTextStyle = { display: 'block', marginTop: 4 };

const ID = {
  unit: String(dataImportEnum.unit.id),
  subunit: String(dataImportEnum.subunit.id),
  process: String(dataImportEnum.process.id),
  risk: String(dataImportEnum.risk.id),
  preventiveAction: String(dataImportEnum.preventiveAction.id),
};

const STORE_TYPE_BY_ID = {
  [ID.unit]: 'unidade',
  [ID.subunit]: 'subunidade',
  [ID.process]: 'processo',
  [ID.risk]: 'risco',
  [ID.preventiveAction]: 'preventiveaction',
};

const VISIBLE_FIELDS_BY_ID = {
  [ID.unit]: ['policyId', 'planId'],
  [ID.subunit]: ['policyId', 'planId', 'unitId'],
  [ID.process]: ['policyId', 'planId', 'unitId', 'subunitId'],
  [ID.risk]: ['policyId', 'planId', 'unitId', 'subunitId'],
  [ID.preventiveAction]: ['policyId', 'planId', 'unitId', 'subunitId', 'riskId'],
};

const REQUIRED_FIELDS_BY_ID = {
  [ID.unit]: ['policyId', 'planId'],
  [ID.subunit]: ['policyId', 'planId', 'unitId'],
  [ID.process]: ['policyId', 'planId', 'unitId'],
  [ID.risk]: ['policyId', 'planId', 'unitId'],
  [ID.preventiveAction]: ['policyId', 'planId', 'unitId', 'riskId'],
};

const REQUIRE_FILE_IDS = new Set([ID.unit, ID.subunit, ID.process, ID.risk, ID.preventiveAction]);

const POST_MSG_BY_ID = {
  [ID.unit]: 'O campo de responsável técnico será preenchido com o responsável pela importação.',
  [ID.subunit]: 'O campo de responsável técnico será preenchido com o responsável pela importação.',
  [ID.risk]:
    'Atenção! Caso dados dos campos Nome do risco, Causa, Periodicidade do monitoramento e Tipo não estejam preenchidos ou estejam diferentes do padrão estabelecido pelo sistema, o risco não será importado.',
};

const FIELD_ORDER = ['policyId', 'planId', 'unitId', 'subunitId', 'processId', 'riskId'];
const FIELD_LABEL = {
  policyId: 'Política de risco',
  planId: 'Plano de gestão',
  unitId: 'Unidade',
  subunitId: 'Subunidade',
  processId: 'Processo',
  riskId: 'Risco',
};

const normArray = arr => (Array.isArray(arr) ? arr : []);

class ImportPage extends React.Component {
  constructor(props) {
    super(props);

    const raw = (dataImportEnum && typeof dataImportEnum.toArray === 'function')
      ? dataImportEnum.toArray()
      : Object.keys(dataImportEnum || {}).map(k => dataImportEnum[k]);

    this.dataTypeOptions = normArray(raw)
      .filter(opt => opt && typeof opt === 'object')
      .map(opt => ({ id: String(opt.id || ''), name: String(opt.name || '') }))
      .filter((o, i, arr) => o.id && o.name && arr.findIndex(x => x.id === o.id) === i)
      .sort((a, b) => Number(a.id) - Number(b.id));

    this.fileInputEl = null;
    this.setFileInputRef = (el) => { this.fileInputEl = el; };
    this.riskSearchDebounce = null;

    this.state = {
      selectedDataTypeId: '',
      selectedPolicyId: undefined,
      selectedPlanRiskId: undefined,
      unitId: undefined,
      subunitId: undefined,
      processId: undefined,
      riskId: undefined,

      policies: null,
      planRisks: null,
      units: [],
      subunits: [],
      risks: null,

      file: null,
      fileName: '',
      fileMsg: '',
      uiMsg: null,
      importing: false,

      riskSearchTerm: '',
      riskSearchLoading: false,

      resetTick: 0,
    };
  }

  componentDidMount() {
    PolicyStore.on('list-to-select', this.onPoliciesLoaded, this);
    PlanRiskStore.on('list-to-select', this.onPlanRisksLoaded, this);
    UnitStore.on('listToSelect', this.onUnitsLoaded, this);
    RiskStore.on('risks-filtered', this.onRisksFiltered, this);

    ImportStore.on('import-success', this.onImportSuccess, this);
    ImportStore.on('import-fail', this.onImportFail, this);

    PolicyStore.dispatch({ action: PolicyStore.ACTION_LIST_TO_SELECT });
  }

  componentWillUnmount() {
    PolicyStore.off(null, null, this);
    PlanRiskStore.off(null, null, this);
    UnitStore.off(null, null, this);
    RiskStore.off(null, null, this);
    if (this.riskSearchDebounce) { clearTimeout(this.riskSearchDebounce); }
    ImportStore.off(null, null, this);
  }

  onPoliciesLoaded = ({ data }) => {
    const list = (data && Array.isArray(data.list)) ? data.list : [];
    this.setState({ policies: list });
  };

  onPlanRisksLoaded = ({ data }) => {
    const list = (data && Array.isArray(data.list)) ? data.list : [];
    this.setState({ planRisks: list });
  };

  onUnitsLoaded = ({ data }) => {
    const list = (data && Array.isArray(data.list)) ? data.list : [];
    const units = list.filter(({ parentId }) => !parentId);
    const subunits = list.filter(({ parentId }) => !!parentId);
    this.setState({ units, subunits }, this.maybeFetchRisks);
  };

  onRisksFiltered = (response) => {
    let dataArr = [];
    if (response && Array.isArray(response.list)) dataArr = response.list;
    else if (response && Array.isArray(response.data)) dataArr = response.data;
    this.setState({ risks: dataArr, riskSearchLoading: false });
  };

  // -------- Helpers --------
  mustShowRisk = () => {
    const { selectedDataTypeId } = this.state;
    const visible = VISIBLE_FIELDS_BY_ID[selectedDataTypeId] || [];
    return visible.indexOf('riskId') !== -1;
  };

  buildUnitIds = () => {
    const { unitId, subunitId } = this.state;
    if (subunitId != null && !Number.isNaN(subunitId)) return [subunitId];
    if (unitId != null && !Number.isNaN(unitId)) return [unitId];
    return [];
  };

  fetchRisks = () => {
    const { selectedPlanRiskId, riskSearchTerm } = this.state;
    const unitIds = this.buildUnitIds();
    if (!selectedPlanRiskId || unitIds.length === 0) {
      this.setState({ risks: [], riskSearchLoading: false });
      return;
    }

    this.setState({ riskSearchLoading: true });

    RiskStore.dispatch({
      action: RiskStore.ACTION_FILTER_RISKS,
      data: {
        planRiskId: selectedPlanRiskId,
        page: 1,
        pageSize: 9999,
        filters: {
          nameOrCode: (riskSearchTerm || '').trim(),
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
    if (this.mustShowRisk()) this.fetchRisks();
  };

  getValueFromChange = (arg) => {
    if (arg && typeof arg === 'object') {
      if (arg.target && 'value' in arg.target) return String(arg.target.value ?? '');
      if ('id' in arg && arg.id != null) return String(arg.id);
      if ('value' in arg && arg.value != null) return String(arg.value);
    }
    return String(arg ?? '');
  };

  computeResetKey(field) {
    const {
      selectedDataTypeId, selectedPolicyId, selectedPlanRiskId, unitId, subunitId, resetTick,
    } = this.state;

    let base;
    switch (field) {
    case 'policyId':
      base = `${selectedDataTypeId}`;
      break;
    case 'planId':
      base = `${selectedDataTypeId}|pol:${selectedPolicyId}`;
      break;
    case 'unitId':
      base = `plan:${selectedPlanRiskId}`;
      break;
    case 'subunitId':
      base = `plan:${selectedPlanRiskId}|unit:${unitId}`;
      break;
    case 'processId':
      base = `plan:${selectedPlanRiskId}|unit:${unitId}|sub:${subunitId}`;
      break;
    case 'riskId':
      base = `plan:${selectedPlanRiskId}|unit:${unitId}|sub:${subunitId}`;
      break;
    default:
      base = `${selectedDataTypeId}`;
    }
    return `${base}|v:${resetTick}`;
  }

  // -------- Handlers de cadeia --------
  onDataTypeChange = (val) => {
    const value = this.getValueFromChange(val);

    this.setState(prev => ({
      selectedDataTypeId: value,
      selectedPolicyId: undefined,
      selectedPlanRiskId: undefined,
      unitId: undefined,
      subunitId: undefined,
      processId: undefined,
      riskId: undefined,

      planRisks: null,
      units: [],
      subunits: [],
      risks: null,

      file: null,
      fileName: '',
      fileMsg: '',
      uiMsg: null,

      riskSearchTerm: '',
      resetTick: prev.resetTick + 1,
    }), () => {
      if (this.fileInputEl) this.fileInputEl.value = '';
    });
  };

  onPolicyChange = (val) => {
    const id = parseInt(this.getValueFromChange(val), 10);
    const valid = Number.isFinite(id);

    this.setState(prev => ({
      selectedPolicyId: valid ? id : undefined,

      selectedPlanRiskId: undefined,
      unitId: undefined,
      subunitId: undefined,
      processId: undefined,
      riskId: undefined,

      planRisks: null,
      units: [],
      subunits: [],
      risks: null,

      riskSearchTerm: '',
      resetTick: prev.resetTick + 1,
    }), () => {
      if (valid) {
        PlanRiskStore.dispatch({
          action: PlanRiskStore.ACTION_LIST_TO_SELECT,
          data: { policyId: id },
        });
      }
    });
  };

  onPlanRiskChange = (val) => {
    const id = parseInt(this.getValueFromChange(val), 10);
    const valid = Number.isFinite(id);

    this.setState(prev => ({
      selectedPlanRiskId: valid ? id : undefined,

      unitId: undefined,
      subunitId: undefined,
      processId: undefined,
      riskId: undefined,

      units: [],
      subunits: [],
      risks: null,

      riskSearchTerm: '',
      resetTick: prev.resetTick + 1,
    }), () => {
      this.resetFileSelection();
      if (valid) {
        UnitStore.dispatch({
          action: UnitStore.ACTION_LIST_TO_SELECT,
          data: { planRiskId: id },
        });
        this.maybeFetchRisks();
      }
    });
  };

  onUnitChange = (val) => {
    const id = parseInt(this.getValueFromChange(val), 10);
    const valid = Number.isFinite(id);

    this.setState(prev => ({
      unitId: valid ? id : undefined,

      subunitId: undefined,
      processId: undefined,
      riskId: undefined,

      risks: null,
      riskSearchTerm: '',
      resetTick: prev.resetTick + 1,
    }), () => {
      this.resetFileSelection();
      this.maybeFetchRisks();
    });
  };

  onSubunitChange = (val) => {
    const id = parseInt(this.getValueFromChange(val), 10);
    const valid = Number.isFinite(id);

    this.setState(prev => ({
      subunitId: valid ? id : undefined,

      processId: undefined,
      riskId: undefined,

      risks: null,
      riskSearchTerm: '',
      resetTick: prev.resetTick + 1,
    }), () => {
      this.resetFileSelection();
      this.maybeFetchRisks();
    });
  };

  onProcessChange = (val) => {
    const id = parseInt(this.getValueFromChange(val), 10);
    const valid = Number.isFinite(id);
    this.setState({ processId: valid ? id : undefined });
  };

  onRiskChange = (val) => {
    const n = Number(this.getValueFromChange(val));
    this.setState({
      riskId: Number.isFinite(n) ? n : undefined,
      riskSearchTerm: '',
    });
  };

  onRiskSearchChange = (val) => {
    let term = '';
    if (typeof val === 'string') term = val;
    else if (val && val.target) term = String(val.target.value || '');

    this.setState({ riskSearchTerm: term });

    if (this.riskSearchDebounce) clearTimeout(this.riskSearchDebounce);
    this.riskSearchDebounce = setTimeout(() => {
      if (this.mustShowRisk()) this.fetchRisks();
    }, 350);
  };

  clearRiskSearch = () => {
    this.setState({ riskSearchTerm: '' }, () => this.fetchRisks());
  };

  openFileDialog = () => {
    if (this.fileInputEl) {
      this.fileInputEl.value = '';
      this.fileInputEl.click();
    }
  };

  onFileSelected = (e) => {
    const { target } = e || {};
    const files = (target && target.files) || [];
    const [file] = files;
    if (!file) return;

    const isCsv = (/\.csv$/i).test(file.name || '') || ((file.type || '').indexOf('csv') !== -1);
    const sizeOk = file.size <= MAX_FILE_MB * 1024 * 1024;

    if (!isCsv) {
      this.setState({ file: null, fileName: '', fileMsg: 'Somente arquivos .csv são aceitos.' });
      if (this.fileInputEl) this.fileInputEl.value = '';
      return;
    }
    if (!sizeOk) {
      this.setState({ file: null, fileName: '', fileMsg: `Tamanho máximo permitido é ${MAX_FILE_MB}MB.` });
      if (this.fileInputEl) this.fileInputEl.value = '';
      return;
    }
    this.setState({ file, fileName: file.name, fileMsg: 'Arquivo adicionado com sucesso.' });
  };

  removeFile = () => {
    this.setState({ file: null, fileName: '', fileMsg: '' });
    if (this.fileInputEl) this.fileInputEl.value = '';
  };

  // -------- Import --------
  confirmAndRunImport = (payload) => {
    const { selectedDataTypeId } = this.state;
    const { onImport } = this.props;

    const type = (STORE_TYPE_BY_ID?.[selectedDataTypeId] || 'itens').toLowerCase();
    const pretty = (type === 'preventiveaction' ? 'Ação de Prevenção' : type);
    const extra = POST_MSG_BY_ID?.[selectedDataTypeId];
    const modalText = extra
      ? `Confirmar importação de ${pretty}?\n\n${extra}`
      : `Confirmar importação de ${pretty}?`;

    const runImport = () => (typeof onImport === 'function' ? onImport(payload) : this.dispatchImport(payload));

    Modal.show(
      <ConfirmModal
        text={modalText}
        onConfirm={() => Modal.hide(() => runImport())}
      />,
    );
  };

  safeShowModal = (jsx) => {
    const { $ } = window;
    const div = Modal.modalDiv;

    const cleanup = () => {
      if ($) {
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
      }
    };

    if ($ && $('body').hasClass('modal-open')) {
      $(div).one('hidden.bs.modal', () => {
        cleanup();
        Modal.show(jsx);
      });
      Modal.hide();
    } else {
      cleanup();
      Modal.show(jsx);
    }
  };

  makeKey = (str, prefix) => {
    const base = String(str || '').toLowerCase().replace(/\s+/g, '-').slice(0, 80);
    return `${prefix}-${base || 'k'}`;
  };

  renderWarningItem = (warning, index) => {
    const raw = String(warning ?? '').trim();
    const MAPPED_HEADERS_RE = /^cabeçalhos mapeados:\s*/i;
    const IMPORT_SUMMARY_RE = /^importação concluída:\s*/i;

    const safeKey = (str, pref) => this.makeKey(`${str}-${index}`, pref);

    const card = {
      background: '#ffffff',
      border: '1px solid #e5e5e5',
      borderRadius: 6,
      padding: '12px 16px',
    };
    const gridRow = {
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
      gap: '0 12px',
      alignItems: 'start',
      margin: '4px 0',
    };
    const label = {
      fontWeight: 600,
      whiteSpace: 'nowrap',
      fontSize: '14px',
      color: '#333',
    };

    const prettify = s => s
      .replace(/\s*,\s*/g, ', ')
      .replace(/"([^"]+)"/g, '“$1”')
      .replace(/'([^']+)'/g, '“$1”')
      .replace(/indentificação/gi, 'identificação')
      .replace(/→/g, ' — ')
      .replace(/campo gravado em branco/gi, 'o campo foi mantido em branco')
      .trim()
      .replace(/\.\s*$/, '.');

    if (MAPPED_HEADERS_RE.test(raw)) {
      const body = raw.replace(MAPPED_HEADERS_RE, '').replace(/\.\s*$/, '');
      const pairs = body
        .split(';')
        .map(s => s.trim())
        .filter(Boolean)
        .map((s) => {
          const m = s.match(/['“]([^'”]+)['”]\s*=\s*["“]([^"”]+)["”]?/);
          return m ? { system: m[1], csv: m[2] } : null;
        })
        .filter(Boolean);

      return (
        <li
          key={safeKey('mapped-headers', 'w')}
          style={{
            listStyle: 'none',
            marginLeft: 0,
            marginBottom: '12px',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            fontWeight: 600,
            marginBottom: '8px',
            fontSize: '14px',
            color: '#333',
          }}
          >
            <Icon
              icon="columns"
              style={{
                fontSize: '18px',
                color: '#6c757d',
                marginRight: '8px',
              }}
            />
            <span>Como interpretamos sua planilha</span>
          </div>
          <div style={card}>
            <ul style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
            }}
            >
              {pairs.map(({ system, csv }) => (
                <li key={safeKey(`${system}:${csv}`, 'pair')} style={gridRow}>
                  <span style={label}>
                    {system}
                    :
                  </span>
                  <span style={{
                    fontSize: '14px',
                    color: '#555',
                  }}
                  >
                    {csv}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </li>
      );
    }

    if (IMPORT_SUMMARY_RE.test(raw)) return null;

    const pretty = prettify(raw);
    return (
      <li
        key={safeKey(pretty, 'w')}
        style={{
          whiteSpace: 'pre-line',
          marginBottom: '8px',
          fontSize: '14px',
          color: '#555',
          display: 'flex',
          alignItems: 'flex-start',
        }}
      >
        <Icon
          icon="info-circle"
          style={{
            fontSize: '16px',
            color: '#6c757d',
            marginRight: '8px',
            marginTop: '2px',
            flexShrink: 0,
          }}
        />
        <span>{pretty}</span>
      </li>
    );
  };

  showImportSummaryModal = ({
    imported, skipped, errorsCount = 0, warnings = [],
  }) => {
    const { selectedDataTypeId } = this.state;
    const isRisk = String(selectedDataTypeId) === String(ID.risk);
    const nounPlural = isRisk ? 'riscos' : 'itens';
    const nounSing = isRisk ? 'risco' : 'item';
    const processed = Number(imported || 0) + Number(skipped || 0);

    const procLabel = processed === 1 ? `${nounSing} processado` : `${nounPlural} processados`;
    const importedLabel = imported === 1 ? `${nounSing} importado com sucesso.` : `${nounPlural} importados com sucesso.`;
    const skippedLabel = skipped === 1 ? `${nounSing} não importado por dados inválidos ou incompletos.` : `${nounPlural} não importados por dados inválidos ou incompletos.`;

    const warningsToRender = normArray(warnings)
      .map(w => String(w))
      .filter(w => !/^importação concluída:/i.test(w.trim()));

    this.safeShowModal(
      <Modal width="650px">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px 16px 24px',
          borderBottom: '1px solid #e5e5e5',
          marginBottom: '20px',
        }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
          >
            <Icon
              icon="check-circle"
              style={{
                fontSize: '24px',
                color: '#28a745',
              }}
            />
            <SecondaryTitle style={{
              fontWeight: 600,
              fontSize: '20px',
              margin: 0,
              color: '#333',
            }}
            >
              Resumo da importação
            </SecondaryTitle>
          </div>
        </div>
        <div style={{
          padding: '0 24px 24px 24px',
        }}
        >
          <p style={{
            marginBottom: '12px',
            fontWeight: 600,
            fontSize: '16px',
            color: '#333',
          }}
          >
            Importação concluída com sucesso!
          </p>
          <p style={{
            marginBottom: '16px',
            fontSize: '14px',
            color: '#555',
          }}
          >
            <b style={{
              fontWeight: 600,
            }}
            >
              {processed}
            </b>
            {' '}
            {procLabel}
          </p>
          <ul style={{
            marginLeft: '20px',
            marginBottom: '20px',
            padding: 0,
            listStyle: 'none',
          }}
          >
            <li style={{
              marginBottom: '8px',
              fontSize: '14px',
              color: '#555',
            }}
            >
              <b style={{
                fontWeight: 600,
              }}
              >
                {imported}
              </b>
              {' '}
              {importedLabel}
            </li>
            {skipped > 0 && (
              <li style={{
                marginBottom: '8px',
                fontSize: '14px',
                color: '#555',
              }}
              >
                <b style={{
                  fontWeight: 600,
                }}
                >
                  {skipped}
                </b>
                {' '}
                {skippedLabel}
              </li>
            )}
          </ul>
          {warningsToRender.length > 0 && (
            <div style={{
              marginTop: '20px',
              background: '#f8f9fa',
              border: '1px solid #e5e5e5',
              borderRadius: '6px',
              padding: '16px',
            }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                fontWeight: 600,
                marginBottom: '12px',
                fontSize: '14px',
                color: '#333',
              }}
              >
                <Icon
                  icon="info-circle"
                  style={{
                    fontSize: '18px',
                    color: '#6c757d',
                    marginRight: '8px',
                  }}
                />
                <span>Avisos e observações</span>
              </div>
              <ul style={{
                margin: 0,
                paddingLeft: '20px',
                listStyle: 'none',
              }}
              >
                {warningsToRender.map(this.renderWarningItem)}
              </ul>
            </div>
          )}
          {errorsCount > 0 && (
            <p style={{
              marginTop: '16px',
              fontSize: '14px',
              color: '#555',
            }}
            >
              Erros técnicos reportados pela importação:
              {' '}
              <b style={{
                fontWeight: 600,
              }}
              >
                {errorsCount}
              </b>
.
            </p>
          )}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid #e5e5e5',
          }}
          >
            <button
              type="button"
              onClick={() => Modal.hide()}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#5a6268';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#6c757d';
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      </Modal>,
    );
  };

  showImportErrorModal = ({
    message, errors = [], imported = 0, skipped = 0,
  }) => {
    const { selectedDataTypeId } = this.state;
    const isRisk = String(selectedDataTypeId) === String(ID.risk);
    const noun = isRisk ? 'riscos' : 'itens';
    const processed = Number(imported) + Number(skipped);

    const formatMessage = (msg) => {
      if (!msg || typeof msg !== 'string') return '';
      let formatted = msg.trim()
        .replace(/\[|\]/g, '')
        .replace(/(Cabeçalhos obrigatórios ausentes:)/i, '**$1**')
        .replace(/(Encontrados:)/i, '**$1**')
        .replace(/(ausentes:[^.]*\.)\s*(\*\*Encontrados:\s*)/i, '$1\n$2')
        .replace(/\s*,\s*/g, ', ')
        .replace(/\s{2,}/g, ' ')
        .replace(/indentificação/gi, 'identificação');
      formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
      return formatted;
    };

    const renderFormattedText = (text) => {
      const parts = text.split(/(\*\*.*?\*\*)/g);
      return parts.map(part => (
        part.startsWith('**') && part.endsWith('**')
          ? <b key={this.makeKey(part, 'b')}>{part.replace(/\*\*/g, '')}</b>
          : <span key={this.makeKey(part, 's')}>{part}</span>
      ));
    };

    const prettyMessage = formatMessage(message);

    this.safeShowModal(
      <Modal width="650px">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px 16px 24px',
          borderBottom: '1px solid #e5e5e5',
          marginBottom: '20px',
        }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
          >
            <Icon
              icon="exclamation-triangle"
              style={{
                fontSize: '24px',
                color: '#dc3545',
              }}
            />
            <SecondaryTitle
              style={{
                fontWeight: 600,
                fontSize: '20px',
                margin: 0,
                color: '#333',
              }}
            >
              Relatório da importação (falha)
            </SecondaryTitle>
          </div>
        </div>
        <div style={{
          padding: '0 24px 24px 24px',
        }}
        >
          <p style={{
            marginBottom: '12px',
            fontWeight: 600,
            fontSize: '16px',
            color: '#333',
          }}
          >
            Importação não realizada.
          </p>
          {processed > 0 && (
            <p style={{
              marginBottom: '16px',
              fontSize: '14px',
              color: '#555',
            }}
            >
              <b style={{
                fontWeight: 600,
              }}
              >
                {processed}
              </b>
              {' '}
              {noun}
              {' '}
              processados
            </p>
          )}
          {prettyMessage && (
            <div style={{
              background: '#fff3cd',
              padding: '16px',
              borderRadius: '6px',
              lineHeight: 1.6,
              border: '1px solid #ffc107',
              marginBottom: '20px',
            }}
            >
              <p style={{
                margin: 0,
                whiteSpace: 'pre-line',
                fontSize: '14px',
                color: '#856404',
              }}
              >
                {renderFormattedText(prettyMessage)}
              </p>
            </div>
          )}
          {!!errors.length && (
            <div style={{
              marginTop: '16px',
            }}
            >
              <p style={{
                fontWeight: 600,
                fontSize: '14px',
                color: '#333',
                marginBottom: '12px',
              }}
              >
                Erros:
              </p>
              <ul style={{
                marginLeft: '20px',
                marginBottom: 0,
                padding: 0,
                listStyle: 'none',
              }}
              >
                {errors.map((e) => {
                  const text = typeof e === 'string' ? e : String(e);
                  const key = this.makeKey(text, 'err');
                  return (
                    <li
                      key={key}
                      style={{
                        whiteSpace: 'pre-line',
                        marginBottom: '8px',
                        fontSize: '14px',
                        color: '#555',
                      }}
                    >
                      {renderFormattedText(formatMessage(text))}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid #e5e5e5',
          }}
          >
            <button
              type="button"
              onClick={() => Modal.hide()}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#5a6268';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#6c757d';
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      </Modal>,
    );
  };

  dispatchImport = (payload) => {
    const { selectedDataTypeId, unitId, subunitId } = this.state;
    const type = STORE_TYPE_BY_ID[selectedDataTypeId];

    const supported = ['unidade', 'subunidade', 'processo', 'risco', 'preventiveaction'];
    if (!supported.includes(type)) {
      this.setState({ uiMsg: { kind: 'error', text: 'Importação para este tipo ainda não está disponível.' } });
      return;
    }

    const { file } = payload;
    const planRiskId = Number(payload?.filters?.planId);
    const data = { type, planRiskId, file };

    if (type === 'subunidade') data.parentId = Number(unitId);

    if (type === 'processo' || type === 'risco') {
      const effectiveUnitId = (subunitId != null) ? Number(subunitId) : Number(unitId);
      data.unitId = effectiveUnitId;
    }

    if (type === 'preventiveaction') {
      const riskId = Number(payload?.filters?.riskId);
      if (!riskId) {
        this.setState({ uiMsg: { kind: 'error', text: 'Selecione o risco-alvo para importar as ações de prevenção.' } });
        return;
      }
      data.riskId = riskId;
    }

    this.setState(
      { importing: true, uiMsg: { kind: 'info', text: 'Importação iniciada...' } },
      () => ImportStore.dispatch({ action: ImportStore.ACTION_RUN, data }),
    );
  };

  onImportSuccess = (payload) => {
    const res = payload?.result?.data ?? payload?.data?.data ?? payload?.data ?? payload?.result ?? payload ?? {};
    const toNum = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
    const imported = toNum(res.imported ?? res.success ?? res.ok);
    const skipped = toNum(res.skipped ?? res.ignored ?? res.failed);
    const errors = Array.isArray(res.errors) ? res.errors : [];
    const warnings = Array.isArray(res.warnings) ? res.warnings : [];

    this.setState({ importing: false, uiMsg: null });
    this.resetFileSelection();

    this.showImportSummaryModal({
      imported, skipped, errorsCount: errors.length, warnings,
    });
  };

  onImportFail = (payload) => {
    const res = payload?.data ?? payload?.result ?? payload ?? {};
    const toNum = v => (Number.isFinite(Number(v)) ? Number(v) : 0);
    const imported = toNum(res.imported ?? 0);
    const skipped = toNum(res.skipped ?? 0);
    const errors = Array.isArray(res.errors) ? res.errors : [];
    const message = payload?.message
      || res?.message
      || payload?.error
      || payload?.data?.detail
      || payload?.response?.data?.message
      || 'Falha ao importar.';

    this.setState({ importing: false, uiMsg: null });
    this.resetFileSelection();
    this.showImportErrorModal({
      message, errors, imported, skipped,
    });
  };

  resetFileSelection = () => {
    this.setState({ file: null, fileName: '', fileMsg: '' });
    if (this.fileInputEl) this.fileInputEl.value = '';
  };

  isReadyToImport = () => {
    const {
      selectedDataTypeId,
      selectedPolicyId, selectedPlanRiskId, unitId, subunitId, processId, riskId, file,
    } = this.state;

    if (!selectedDataTypeId) return false;

    const required = REQUIRED_FIELDS_BY_ID[selectedDataTypeId] || [];
    const presence = {
      policyId: selectedPolicyId, planId: selectedPlanRiskId, unitId, subunitId, processId, riskId,
    };
    const fieldsOk = required.every(f => String(presence[f] || '').trim() !== '');
    const fileOk = REQUIRE_FILE_IDS.has(selectedDataTypeId) ? !!file : true;

    return fieldsOk && fileOk;
  };

  handleImportClick = () => {
    const {
      selectedDataTypeId,
      selectedPolicyId, selectedPlanRiskId, unitId, subunitId, processId, riskId, file,
    } = this.state;

    if (!this.isReadyToImport()) {
      this.setState({ uiMsg: { kind: 'error', text: 'Preencha os campos obrigatórios antes de importar.' } });
      return;
    }

    const payload = {
      dataTypeId: selectedDataTypeId,
      filters: {
        policyId: selectedPolicyId, planId: selectedPlanRiskId, unitId, subunitId, processId, riskId,
      },
      file,
    };

    this.confirmAndRunImport(payload);
  };

  // -------- Render --------
  renderInfo() {
    const { uiMsg } = this.state;
    return (
      <div>
        <SystemInfo iconAlign="flex-start">
          <div>
            Esta tela permite
            {' '}
            <b>importar dados</b>
            {' '}
para o sistema. Selecione o tipo de dado e preencha a hierarquia.
            Os campos
            {' '}
            <b>(*)</b>
            {' '}
garantem o vínculo correto antes da importação.
          </div>
        </SystemInfo>

        {uiMsg && uiMsg.text ? <SystemInfo iconAlign="flex-start">{uiMsg.text}</SystemInfo> : null}
      </div>
    );
  }

  renderDataTypeSelect() {
    const { selectedDataTypeId, resetTick } = this.state;
    const { dataTypeOptions } = this;
    const hasOptions = dataTypeOptions.length > 0;

    return (
      <InputContainer className="row">
        <div className="col col-sm-6" style={fieldBlockStyle}>
          <SelectSearchBox
            key={`dataType-${selectedDataTypeId}|v:${resetTick}`}
            id="dataType"
            label="Tipo de dado"
            options={dataTypeOptions}
            optionValueName="id"
            optionLabelName="name"
            value={selectedDataTypeId || ''}
            onChange={this.onDataTypeChange}
            required
            disabled={!hasOptions}
            placeholderButtonLabel="Selecione"
            placeholderToEmpty="Nenhum tipo de dado disponível."
            searchPlaceholder="Pesquisar tipo de dado…"
            noResultsText="Nenhum tipo encontrado"
          />
          {!hasOptions && (
            <small className="text-muted" style={helpTextStyle}>Nenhum tipo de dado disponível.</small>
          )}
        </div>
      </InputContainer>
    );
  }

  renderDependentFields() {
    const {
      selectedDataTypeId,
      selectedPolicyId, selectedPlanRiskId, unitId, subunitId, processId, riskId,
      policies, planRisks, units, subunits, risks, riskSearchTerm, riskSearchLoading,
    } = this.state;

    if (!selectedDataTypeId) return null;
    const isPreventiveAction = String(selectedDataTypeId) === String(ID.preventiveAction);
    const visibleFields = VISIBLE_FIELDS_BY_ID[selectedDataTypeId] || [];
    const requiredFields = REQUIRED_FIELDS_BY_ID[selectedDataTypeId] || [];
    if (!visibleFields.length) return null;

    const { processOptions = [], riskOptions = [] } = this.props;

    const subunitOptions = (unitId != null && Array.isArray(subunits))
      ? subunits.filter(({ parentId }) => Number(parentId) === Number(unitId))
      : [];

    const optionsByField = {
      policyId: normArray(policies),
      planId: normArray(planRisks),
      unitId: normArray(units),
      subunitId: subunitOptions,
      processId: normArray(processOptions),
      riskId: Array.isArray(risks) ? risks : normArray(riskOptions),
    };

    const valueByField = {
      policyId: selectedPolicyId, planId: selectedPlanRiskId, unitId, subunitId, processId, riskId,
    };
    const requiredSet = new Set(requiredFields);

    const disabledByChain = (field) => {
      const idx = FIELD_ORDER.indexOf(field);
      if (idx <= 0) return false;
      const prevVisible = FIELD_ORDER.slice(0, idx).filter(f => visibleFields.indexOf(f) !== -1);
      const gating = prevVisible.filter(f => requiredSet.has(f));
      return gating.some(f => !valueByField[f]);
    };

    const handlerByField = {
      policyId: this.onPolicyChange,
      planId: this.onPlanRiskChange,
      unitId: this.onUnitChange,
      subunitId: this.onSubunitChange,
      processId: this.onProcessChange,
      riskId: this.onRiskChange,
    };

    return (
      <InputContainer className="row">
        {visibleFields.map((field) => {
          const options = optionsByField[field] || [];
          const hasOptions = Array.isArray(options) && options.length > 0;
          const isRequired = requiredSet.has(field);
          const onChange = handlerByField[field];
          const isRiskField = field === 'riskId' && isPreventiveAction;
          const disabled = isRiskField
            ? disabledByChain(field)
            : (disabledByChain(field) || !hasOptions);

          const label = FIELD_LABEL[field] || field;
          const common = {
            id: field,
            label,
            options,
            optionValueName: 'id',
            optionLabelName: 'name',
            value:
              valueByField[field] != null && String(valueByField[field]).trim() !== ''
                ? String(valueByField[field])
                : '',
            onChange,
            required: isRequired,
            disabled,
            placeholderButtonLabel: isRequired ? 'Selecione *' : 'Selecione',
            placeholderToEmpty: `Nenhuma opção para ${label}.`,
            searchPlaceholder: `Pesquisar ${label}…`,
            noResultsText: `Nenhum ${label} encontrado`,
          };

          const key = `ssb-${field}-${this.computeResetKey(field)}`;

          if (field === 'riskId' && isPreventiveAction) {
            return (
              <div key={field} className="col col-sm-6" style={fieldBlockStyle}>
                <SelectSearchBox
                  key={key}
                  {...common}
                  searchValue={riskSearchTerm}
                  onSearchChange={this.onRiskSearchChange}
                  onSearchClear={this.clearRiskSearch}
                  searchLoading={riskSearchLoading}
                />
                {!hasOptions && (
                  <small className="text-muted" style={{ display: 'block', marginTop: 4 }}>
                    Nenhuma opção para
                    {' '}
                    {label}
.
                  </small>
                )}
              </div>
            );
          }

          return (
            <div key={field} className="col col-sm-6" style={fieldBlockStyle}>
              <SelectSearchBox key={key} {...common} />
              {!hasOptions && (
                <small className="text-muted" style={{ display: 'block', marginTop: 4 }}>
                  Nenhuma opção para
                  {' '}
                  {label}
.
                </small>
              )}
            </div>
          );
        })}
      </InputContainer>
    );
  }

  renderFileSection() {
    const { selectedDataTypeId, fileName, fileMsg } = this.state;
    const { csvTemplateUrl } = this.props;
    if (!REQUIRE_FILE_IDS.has(selectedDataTypeId)) return null;

    return (
      <InputContainer className="row">
        <div className="col col-sm-6" style={fieldBlockStyle}>
          <PrimaryButton title="Adicionar arquivo" text="Adicionar arquivo" onClick={this.openFileDialog} />
          <input
            ref={this.setFileInputRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={this.onFileSelected}
          />
          {fileName && (
            <div style={{ marginTop: 8 }}>
              <strong>Arquivo:</strong>
              {' '}
              {fileName}
              {' '}
              <button type="button" className="btn btn-link btn-sm" onClick={this.removeFile} style={{ paddingLeft: 0 }}>
                Remover
              </button>
            </div>
          )}
          {fileMsg && <div style={{ marginTop: 8 }}>{fileMsg}</div>}
          {csvTemplateUrl && (
            <div style={{ marginTop: 8 }}>
              <a href={csvTemplateUrl} target="_blank" rel="noopener noreferrer">Baixar modelo CSV</a>
            </div>
          )}
        </div>
      </InputContainer>
    );
  }

  renderMainContent = () => (
    <TabbedPanel.MainContainer>
      {this.renderInfo()}
      {this.renderDataTypeSelect()}
      {this.renderDependentFields()}
      {this.renderFileSection()}
    </TabbedPanel.MainContainer>
  );

  render() {
    const { importing } = this.state;
    const canImport = this.isReadyToImport() && !importing;

    return (
      <AppContainer.Content>
        <AppContainer.TopContent>
          <MainTitle label={Messages.get('label.importData')} />
          <div>
            <PrimaryButton
              title={Messages.get('label.importData')}
              text={importing ? 'Importando...' : Messages.get('label.importData')}
              onClick={this.handleImportClick}
              disabled={!canImport}
            />
          </div>
        </AppContainer.TopContent>

        <AppContainer.MainContent>
          <TabbedPanel
            tabs={[{ label: Messages.get('label.importData') }]}
            topContainerContent={{ height: topContainerHeight }}
          >
            {this.renderMainContent()}
          </TabbedPanel>
        </AppContainer.MainContent>
      </AppContainer.Content>
    );
  }
}

const optionShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  name: PropTypes.string.isRequired,
});

ImportPage.propTypes = {
  processOptions: PropTypes.arrayOf(optionShape),
  riskOptions: PropTypes.arrayOf(optionShape),
  csvTemplateUrl: PropTypes.string,
  onImport: PropTypes.func,
};

ImportPage.defaultProps = {
  processOptions: [],
  riskOptions: [],
  csvTemplateUrl: undefined,
  onImport: undefined,
};

export default ImportPage;
