import React from 'react';
import PropTypes from 'prop-types';

import Modal from 'forpdi/src/components/modals/Modal.jsx';
import AppStyledButton from 'forpdi/src/components/buttons/AppStyledButton.jsx';
import LoadingGauge from 'forpdi/src/components/LoadingGauge.jsx';
import StructureStore from 'forpdi/src/forpdi/planning/store/Structure.jsx';
import Messages from 'forpdi/src/Messages.jsx';

const dupStyles = {
  headerIcon: { fontSize: 18, verticalAlign: 'text-bottom', marginRight: 6 },
  headerSub: { color: '#6b7280', fontSize: 12, marginTop: 4 },
  infoAlert: {
    background: '#eef6ff',
    border: '1px solid #cfe6ff',
    borderRadius: 6,
    padding: '8px 8px',
    marginBottom: 12,
    color: '#0b4a87'
  },
  badge: {
    background: '#667085', color: '#fff', borderRadius: 10,
    padding: '0 6px', marginLeft: 10, fontSize: 11
  },
  well: {
    background: '#f7f9fc', border: '1px solid #e5e7eb',
    borderRadius: 6, padding: '8px 10px', marginBottom: 12
  },
  inputGroup: {
    display: 'flex', alignItems: 'center', marginBottom: 10
  },
  inputGroupAddon: {
    padding: '4px 8px', border: '1px solid #ced4da', borderRight: 'none',
    borderRadius: '4px 0 0 4px', background: '#f8f9fa', color: '#6b7280'
  },
  input: {
    flex: 1, padding: '6px 8px', border: '1px solid #ced4da',
    borderRadius: '0 4px 4px 0', fontSize: 12, outline: 'none'
  },
  select: {
    width: '100%', minHeight: 120, border: '1px solid #ced4da',
    borderRadius: 4, padding: 6, fontSize: 12
  },
  label: { display: 'block', marginBottom: 4, fontWeight: 600 },
  preview: { marginTop: 6, color: '#6b7280', fontSize: 12 },
  helpText: { marginTop: 10, color: '#6b7280', fontSize: 12 },
  footer: { display: 'flex', justifyContent: 'flex-end', gap: 4 },

  cancel: (s) => ({
    background: s.activeCancel ? '#eceff3' : (s.hoverCancel ? '#f2f4f7' : '#f6f8fa'),
    border: '1px solid #d0d7de',
    color: s.submitting ? '#57606a' : '#24292f',
    borderRadius: 6,
    padding: '6px 12px',
    fontSize: 12,
    lineHeight: '20px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    cursor: s.submitting ? 'not-allowed' : 'pointer',
    opacity: s.submitting ? 0.8 : 1,
    transition: 'background .15s ease, box-shadow .15s ease, transform .02s ease',
    boxShadow: s.focusCancel ? '0 0 0 3px rgba(9,105,218,.3)' : 'none',
    transform: s.activeCancel ? 'translateY(1px)' : 'none',
    userSelect: 'none'
  }),
  cancelIcon: { fontSize: 16, lineHeight: '16px' }
};

export default React.createClass({
  propTypes: {
    levelInstanceId: PropTypes.number.isRequired,
    onSuccess: PropTypes.func,
  },

  getInitialState() {
    return {
      loading: true,
      submitting: false,
      needsParent: true,
      options: [],
      destinationParentId: null,
      filterQuery: "",
      selectedLabel: null,
      hoverCancel: false,
      focusCancel: false,
      activeCancel: false
    };
  },

  componentDidMount() {
    StructureStore.on("duplicateOptionsRetrieved", this.onOptions, this);
    StructureStore.on("levelInstanceDuplicated", this.onDuplicated, this);
    StructureStore.duplicateOptions(this.props.levelInstanceId);
  },

  componentWillUnmount() {
    StructureStore.off(null, null, this);
  },

  onOptions(model) {
    const data = model.data || {};
    const options = (data.options || []).map(opt => ({
      id: opt.id,
      label: opt.path || opt.label
    }));
    const firstId = options.length ? options[0].id : null;

    this.setState({
      loading: false,
      needsParent: !!data.needsParent,
      options,
      destinationParentId: firstId,
      selectedLabel: firstId ? options.find(o => o.id === firstId)?.label : null
    }, () => {
      if (this.filterInput && this.state.needsParent) {
        try { this.filterInput.focus(); } catch (e) {}
      }
    });
  },

  onDuplicated(model, ctx) {
    const newId = (model.data && model.data.id) ? model.data.id : null;
    const { destinationParentId } = ctx || {};
    const { onSuccess } = this.props;

    Modal.hide(() => {
      if (onSuccess) onSuccess(newId, destinationParentId);
    });
  },

  onConfirm() {
    const { needsParent, destinationParentId } = this.state;
    if (needsParent && !destinationParentId) return;

    this.setState({ submitting: true }, () => {
      StructureStore.duplicateLevelInstance({
        id: this.props.levelInstanceId,
        destinationParentId: needsParent ? destinationParentId : null
      });
    });
  },

  onChangeDestination(e) {
    const id = parseInt(e.target.value, 10);
    const opt = this.state.options.find(o => o.id === id);
    this.setState({
      destinationParentId: id || null,
      selectedLabel: opt ? opt.label : null
    });
  },

  renderHeader() {
    return (
      <div className="modal-header" style={{ padding: '20px 20px 12px 20px', borderBottom: 'none' }}>
        <h4 className="modal-title" style={{ margin: 0, fontSize: 18, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          <i className="mdi mdi-content-copy" style={dupStyles.headerIcon} aria-hidden="true"></i>
          {Messages.get("label.duplicateStructure") || "Duplicar Estrutura"}
        </h4>
        <div style={{ ...dupStyles.headerSub, marginTop: 8 }}>
          {Messages.get("label.duplicateStructureIntro") ||
            "Crie uma cópia desta estrutura e de todos os seus níveis filhos dentro do mesmo Plano de Ação."}
        </div>
      </div>
    );
  },

  renderRules() {
    return (
      <div style={dupStyles.infoAlert} role="note">
        <strong>{Messages.get("label.rulesCloneTitle") || "Regras de duplicação"}</strong>
        <ul style={{ margin: '2px 0 0 6px' }}>
          <li>{Messages.get("label.ruleClonePrefix") || "O título recebe o prefixo [CLONE]."}</li>
          <li>{Messages.get("label.ruleCloneResponsibilities") || "Responsável, Gestor e Responsável Técnico não são copiados."}</li>
          <li>{Messages.get("label.ruleCloneBudget") || "Orçamentos vinculados a Objetivos não são copiados."}</li>
          <li>{Messages.get("label.ruleCloneScope") || "Toda a estrutura filha é copiada (por exemplo, duplicar um Objetivo copia também Indicadores e Metas)."}</li>
        </ul>
      </div>
    );
  },

  renderDestination() {
    const { needsParent, options, destinationParentId, filterQuery } = this.state;

    if (!needsParent) {
      return (
        <div style={dupStyles.well}>
          <i className="mdi mdi-map-marker-outline" style={{ marginRight: 6 }} aria-hidden="true"></i>
          {Messages.get("label.cloneInThisPlan") || "O clone será criado neste Plano de Ação."}
        </div>
      );
    }

    const q = (filterQuery || "").toLowerCase();
    const filtered = !q ? options : options.filter(o => (o.label || "").toLowerCase().indexOf(q) > -1);
    const listSize = Math.min(8, Math.max(4, filtered.length || 4));

    return (
      <div>
        <label className="control-label" style={dupStyles.label}>
          {Messages.getEditable("label.selectDestination", "fpdi-nav-label") || "Selecione o destino"}
          {filtered.length > 0 && <span style={dupStyles.badge}>{filtered.length}</span>}
        </label>

        <div style={dupStyles.inputGroup}>
          <span style={dupStyles.inputGroupAddon}><i className="mdi mdi-magnify" aria-hidden="true"></i></span>
          <input
            type="text"
            ref={el => (this.filterInput = el)}
            style={dupStyles.input}
            placeholder={Messages.get("label.destinationFilterPlaceholder") || "Filtrar opções por nome ou caminho..."}
            value={filterQuery}
            onChange={(e) => this.setState({ filterQuery: e.target.value })}
            aria-label={Messages.get("label.destinationFilterPlaceholder") || "Filtrar opções por nome ou caminho..."}
          />
        </div>

        <select
          style={dupStyles.select}
          size={listSize}
          value={destinationParentId || ''}
          onChange={this.onChangeDestination}
          aria-live="polite"
        >
          {filtered.length === 0 ? (
            <option value="">{Messages.get("label.noOptions") || "Sem opções disponíveis"}</option>
          ) : filtered.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.label}</option>
          ))}
        </select>

        {destinationParentId && this.state.selectedLabel ? (
          <div style={dupStyles.preview}>
            <i className="mdi mdi-chevron-right-circle-outline" style={{ marginRight: 6 }} aria-hidden="true"></i>
            <strong>{Messages.get("label.destinationSelected") || "Destino selecionado:"}</strong>
            &nbsp;{this.state.selectedLabel}
          </div>
        ) : null}

        {filtered.length === 0 && (
          <div style={dupStyles.helpText}>
            {Messages.get("label.noOptionsHelp") ||
              "Nenhum destino compatível encontrado neste Plano de Ação. Verifique se existem itens do nível pai."}
          </div>
        )}
      </div>
    );
  },

  renderFooter() {
    const { needsParent, destinationParentId, submitting } = this.state;
    const canConfirm = (!needsParent || !!destinationParentId) && !submitting;

    const buttonBaseStyle = {
      borderRadius: "8px",
      padding: '8px 20px',
      fontSize: 14,
      fontWeight: 500,
      minWidth: '110px',
      height: '36px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      lineHeight: '20px',
      boxSizing: 'border-box'
    };

    return (
      <div className="modal-footer" style={{ ...dupStyles.footer, padding: '16px 20px', borderTop: 'none', marginTop: 8 }}>
        <button
          type="button"
          className="btn btn-danger"
          style={buttonBaseStyle}
          disabled={submitting}
          onClick={() => !submitting && Modal.hide()}
          onMouseEnter={() => this.setState({ hoverCancel: true })}
          onMouseLeave={() => this.setState({ hoverCancel: false, activeCancel: false })}
          onMouseDown={() => this.setState({ activeCancel: true })}
          onMouseUp={() => this.setState({ activeCancel: false })}
          onFocus={() => this.setState({ focusCancel: true })}
          onBlur={() => this.setState({ focusCancel: false })}
        >
          Cancelar
        </button>

        <AppStyledButton
          appName="fpdi"
          className="btn btn-primary"
          style={{ ...buttonBaseStyle, marginLeft: 10, border: 'none' }}
          disabled={!canConfirm}
          onClick={this.onConfirm}
          text={
            submitting
              ? (Messages.get("label.duplicating") || "Duplicando...")
              : (Messages.get("label.duplicate") || "Duplicar")
          }
        />
      </div>
    );
  },

  renderBody() {
    const { loading } = this.state;
    if (loading) return <LoadingGauge />;

    return (
      <div className="modal-body" style={{ padding: '0 20px' }}>
        {this.renderRules()}
        {this.renderDestination()}
      </div>
    );
  },

  render() {
    return (
      <Modal>
        {this.renderHeader()}
        {this.renderBody()}
        {this.renderFooter()}
      </Modal>
    );
  }
});
