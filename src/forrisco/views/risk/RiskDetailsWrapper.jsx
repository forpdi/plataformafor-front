import React from 'react';
import PropTypes from 'prop-types';

import PageHeader from 'forpdi/src/components/PageHeader';
import SecondaryIconButton from 'forpdi/src/components/buttons/SecondaryIconButton';
import AppContainer from 'forpdi/src/components/AppContainer';
import Modal from 'forpdi/src/components/modals/Modal';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';
import { isResponsible } from 'forpdi/src/forrisco/helpers/permissionHelper';
import riskArchivedStatus from 'forpdi/src/forrisco/enums/riskArchivedStatus';

import Messages from 'forpdi/src/Messages';
import RiskStore from 'forpdi/src/forrisco/stores/Risk';

class RiskDetailsWrapper extends React.Component {
  componentDidMount() {
    const { toastr, router } = this.context;
    const { risk } = this.props;
    const { unit } = risk;

    RiskStore.on('riskDelete', () => {
      toastr.addAlertSuccess(Messages.get('label.notification.risk.delete'));
      router.push(`/forrisco/unit/${unit.id}/risks`);
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
    const { location } = this.props;
    const { risk } = this.props;
    const { unit } = risk;

    location.pathname.match('details')
      ? router.push(`/forrisco/unit/${unit.id}/risks`)
      : router.goBack();
  }

  archiveRiskHandler = () => {
    const { risk } = this.props;

    if (risk.archived) {
      RiskStore.dispatch({
        action: RiskStore.ACTION_UNARCHIVE,
        data: risk.id,
      });
    } else {
      RiskStore.dispatch({
        action: RiskStore.ACTION_ARCHIVE,
        data: risk.id,
      });
    }
  };

  onHandleEdit = () => {
    const { router } = this.context;
    const { risk } = this.props;
    router.push(`/forrisco/risk/edit/${risk.id}`);
  };

  deleteRisk = () => {
    const { risk } = this.props;
    const { id: riskId } = risk;

    RiskStore.dispatch({
      action: RiskStore.ACTION_DELETE,
      data: riskId,
    });
  }

  renderTopContent() {
    const { hasForriscoManageRiskPermission } = this.context;
    const { risk } = this.props;
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
      const status = archived ? 'publicado' : 'arquivado';
      const modalText = `O risco '${name}' será ${status}. Deseja continuar?`;
      const confirmModal = (
        <ConfirmModal
          text={modalText}
          onConfirm={() => this.archiveRiskHandler()}
        />
      );
      Modal.show(confirmModal);
    };

    return (
      <AppContainer.TopContent>
        <PageHeader pageTitle={name} goBack={this.goBack} />
        <AppContainer.Column>
          <span style={{
            display: 'flex',
            gap: '10px',
            marginRight: '10px',
          }}
          >
            {
              hasForriscoManageRiskPermission && (
                <SecondaryIconButton
                  title={riskArchivedStatus[archived].action}
                  icon={riskArchivedStatus[archived].iconName}
                  onClick={onHandleRenderArchiveModal}
                />
              )
            }
            {
              (hasForriscoManageRiskPermission || isResponsible(risk)) && (
                <SecondaryIconButton
                  title={Messages.get('label.editRisk')}
                  icon="pen"
                  onClick={this.onHandleEdit}
                />
              )
            }
            {
              hasForriscoManageRiskPermission && (
                <SecondaryIconButton
                  title={Messages.get('label.deleteRisk')}
                  icon="trash"
                  onClick={onHandleRenderDeleteModal}
                />
              )
            }
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
        {React.cloneElement(children, { risk })}
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
  risk: PropTypes.shape({}),
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
