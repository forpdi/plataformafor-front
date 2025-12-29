import React from 'react';
import PropTypes from 'prop-types';

import PageHeader from 'forpdi/src/components/PageHeader';
import SecondaryIconButton from 'forpdi/src/components/buttons/SecondaryIconButton';
import AppContainer from 'forpdi/src/components/AppContainer';
import Modal from 'forpdi/src/components/modals/Modal';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';
import { isResponsible } from 'forpdi/src/forrisco/helpers/permissionHelper';
import riskStatusOptions from 'forpdi/src/forrisco/enums/riskStatusOptions';

import Messages from 'forpdi/src/Messages';
import RiskStore from 'forpdi/src/forrisco/stores/Risk';

// ===== Enum helpers (compatível com createEnum => usa .list) =====
const STATUS_BY_ID = Array.isArray(riskStatusOptions.list)
  ? riskStatusOptions.list.reduce((acc, opt) => {
    acc[opt.id] = opt; // { published, archived, imported, deleted }
    return acc;
  }, {})
  : {};

// Para o botão de arquivar/desarquivar, o que importa é o boolean `archived`
const resolveMetaFromArchived = archivedBool => (archivedBool ? (STATUS_BY_ID.archived || {}) : (STATUS_BY_ID.published || {}));

class RiskDetailsWrapper extends React.Component {
  componentDidMount() {
    const { toastr, router } = this.context;
    const { risk } = this.props;
    const { unit } = risk || {};

    RiskStore.on('riskDelete', () => {
      toastr.addAlertSuccess(Messages.get('label.notification.risk.delete'));
      if (unit && unit.id) {
        router.push(`/forrisco/unit/${unit.id}/risks`);
      }
    }, this);

    RiskStore.on('riskarchived', (archiverRisk) => {
      const { data } = archiverRisk;
      toastr.addAlertSuccess(Messages.get('label.notification.risk.archive'));
      router.push(`forrisco/risk/${data.id}/details/info/`);
    }, this);

    RiskStore.on('riskunarchived', (unarchiverRisk) => {
      const { data } = unarchiverRisk;
      toastr.addAlertSuccess(Messages.get('label.notification.risk.unarchive'));
      router.push(`forrisco/risk/${data.id}/details/info/`);
    }, this);
  }

  componentWillUnmount() {
    RiskStore.off(null, null, this);
  }

  goBack = () => {
    const { router } = this.context;
    const { location, risk } = this.props;
    const unitId = risk?.unit?.id;

    // se estamos em /details, volta para a lista da unidade; senão, histórico
    if (location.pathname.match('details') && unitId) {
      router.push(`/forrisco/unit/${unitId}/risks`);
    } else {
      router.goBack();
    }
  };

  archiveRiskHandler = () => {
    const { risk } = this.props;

    if (!risk) return;
    if (risk.archived) {
      RiskStore.dispatch({ action: RiskStore.ACTION_UNARCHIVE, data: risk.id });
    } else {
      RiskStore.dispatch({ action: RiskStore.ACTION_ARCHIVE, data: risk.id });
    }
  };

  onHandleEdit = () => {
    const { router } = this.context;
    const { risk } = this.props;
    if (!risk) return;
    router.push(`/forrisco/risk/edit/${risk.id}`);
  };

  deleteRisk = () => {
    const { risk } = this.props;
    const riskId = risk?.id;
    if (!riskId) return;

    RiskStore.dispatch({
      action: RiskStore.ACTION_DELETE,
      data: riskId,
    });
  };

  renderTopContent() {
    const { hasForriscoManageRiskPermission } = this.context;
    const { risk } = this.props;

    if (!risk) return null;

    const { name, archived } = risk;

    const onHandleRenderDeleteModal = () => {
      const modalText = Messages.get('label.deleteRiskConfirmation');
      const confirmModal = (
        <ConfirmModal
          text={modalText}
          onConfirm={() => this.deleteRisk()}
        />
      );
      Modal.show(confirmModal);
    };

    const onHandleRenderArchiveModal = () => {
      // mensagens localizadas para manter consistência i18n
      const statusLabel = archived
        ? Messages.get('label.stateOfRiskPublished').toLowerCase()
        : Messages.get('label.stateOfRiskArchived').toLowerCase();

      const modalText = `${Messages.get('label.risk')} '${name}' ${Messages.get('label.willBe')} ${statusLabel}. ${Messages.get('label.doYouWantToContinue')}`;

      const confirmModal = (
        <ConfirmModal
          text={modalText}
          onConfirm={() => this.archiveRiskHandler()}
        />
      );
      Modal.show(confirmModal);
    };

    // meta para o botão de alternar estado (arquivar/desarquivar)
    const meta = resolveMetaFromArchived(archived);
    const archiveIcon = meta.iconName || (archived ? 'frisk-unarchive' : 'frisk-archive');
    const archiveTitle = meta.action || Messages.get(archived ? 'label.unarchiveRisk' : 'label.archiveRisk');

    return (
      <AppContainer.TopContent>
        <PageHeader pageTitle={name} goBack={this.goBack} />
        <AppContainer.Column>
          <span
            style={{
              display: 'flex',
              gap: '10px',
              marginRight: '10px',
            }}
          >
            {hasForriscoManageRiskPermission && (
              <SecondaryIconButton
                title={archiveTitle}
                icon={archiveIcon}
                onClick={onHandleRenderArchiveModal}
              />
            )}
            {(hasForriscoManageRiskPermission || isResponsible(risk)) && (
              <SecondaryIconButton
                title={Messages.get('label.editRisk')}
                icon="pen"
                onClick={this.onHandleEdit}
              />
            )}
            {hasForriscoManageRiskPermission && (
              <SecondaryIconButton
                title={Messages.get('label.deleteRisk')}
                icon="trash"
                onClick={onHandleRenderDeleteModal}
              />
            )}
          </span>
        </AppContainer.Column>
      </AppContainer.TopContent>
    );
  }

  render() {
    const { children, risk } = this.props;

    return (
      <div style={{ height: '100%' }}>
        {this.renderTopContent()}
        {risk ? React.cloneElement(children, { risk }) : null}
      </div>
    );
  }
}

RiskDetailsWrapper.propTypes = {
  params: PropTypes.shape({
    riskId: PropTypes.string.isRequired,
  }).isRequired,
  location: PropTypes.shape({}).isRequired,
  children: PropTypes.node,
  risk: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    archived: PropTypes.bool,
    imported: PropTypes.bool,
    unit: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  }),
};

RiskDetailsWrapper.defaultProps = {
  children: null,
  risk: null,
};

RiskDetailsWrapper.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
  hasForriscoManageRiskPermission: PropTypes.bool.isRequired,
};

export default RiskDetailsWrapper;
