import React from 'react';
import _ from 'underscore';
import PropTypes from 'prop-types';

import Table from 'forpdi/src/components/Table';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';
import Modal from 'forpdi/src/components/modals/Modal';
import UnitStore from 'forpdi/src/forrisco/stores/Unit';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import SubunitsTable from 'forpdi/src/forrisco/components/unit/SubunitsTable';

import Messages from 'forpdi/src/Messages';

class UnitsTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      subunitsMap: {},
      loadedNestedRowIds: [],
    };
  }

  componentDidMount() {
    UnitStore.on('subunitsListed', ({ data }, { loadedNestedRowIds, parentUnitId }) => {
      const { subunitsMap } = this.state;
      subunitsMap[`${parentUnitId}`] = data;

      this.setState({ subunitsMap, loadedNestedRowIds });
    }, this);

    UnitStore.on('subunitDeleted', ({ data }) => {
      const { toastr } = this.context;
      const { parent } = data;
      const { subunitsMap } = this.state;
      const { id: parentId } = parent;
      const subunits = subunitsMap[parentId];
      const updatedSubunits = _.filter(subunits, ({ id }) => id !== data.id);
      this.setState({
        subunitsMap: {
          ...subunitsMap,
          [`${parentId}`]: updatedSubunits,
        },
      });
      toastr.addAlertSuccess(Messages.get('notification.subunit.delete'));
    }, this);
  }

  componentWillUnmount() {
    UnitStore.off(null, null, this);
  }

  deleteUnit = (unit) => {
    UnitStore.dispatch({
      data: unit,
      action: UnitStore.ACTION_DELETE_UNIT,
    });
  }

  onEdit = (unit) => {
    const { router } = this.context;

    router.push(`/forrisco/unit/edit/${unit.id}`);
  }

  onHandleRedirect = (data) => {
    const { router } = this.context;
    router.push(`/forrisco/unit/${data.id}`);
  }

  onHandleRenderDeleteModal = (data) => {
    const modalText = Messages.get('label.deleteUnitConfirmation');
    const confirmModal = (
      <ConfirmModal
        text={modalText}
        onConfirm={() => this.deleteUnit(data)}
      />
    );
    Modal.show(confirmModal);
  };

  onToggleNestedRow = (loadedNestedRowIds, parentUnitId) => {
    const { subunitsMap } = this.state;

    if (!subunitsMap[parentUnitId]) {
      UnitStore.dispatch({
        action: UnitStore.ACTION_LIST_SUBUNIT,
        data: {
          unitId: parentUnitId,
        },
        opts: {
          loadedNestedRowIds,
          parentUnitId,
        },
      });
    }
  }

  nestedComponentRender = ({ id: parentUnitId }) => {
    const { subunitsMap } = this.state;
    return (
      <SubunitsTable
        subunits={subunitsMap[parentUnitId]}
        isNested
      />
    );
  }

  renderTable() {
    const {
      units,
      isTabbedPanelContent,
      sortedBy,
      onSort,
    } = this.props;
    const { loadedNestedRowIds } = this.state;
    const { hasForriscoManageUnitPermission } = this.context;

    const renderResponsible = (data) => {
      const { user } = data;
      return <span>{user.name}</span>;
    };

    const renderPlanRisk = (data) => {
      const { planRisk } = data;
      return <span>{planRisk.name}</span>;
    };

    const columns = [
      {
        name: Messages.get('label.unityName'),
        field: 'name',
        width: '40%',
        sort: true,
      },
      {
        name: Messages.get('label.risk.managementPlan'),
        render: renderPlanRisk,
        field: 'planRisk.name',
        width: '30%',
        sort: true,
      },
      {
        name: Messages.get('label.responsible'),
        render: renderResponsible,
        field: 'user.name',
        width: '30%',
        sort: true,
      },
    ];

    const actionColumnItems = [
      {
        icon: 'pen',
        title: Messages.get('label.editUnit'),
        action: this.onEdit,
        disabled: !hasForriscoManageUnitPermission,
      },
      {
        icon: 'trash',
        title: Messages.get('label.deleteUnit'),
        action: this.onHandleRenderDeleteModal,
        disabled: !hasForriscoManageUnitPermission,
      },
      {
        icon: 'chevron-right',
        title: Messages.get('label.viewMore'),
        expandNestedRow: true,
        disabled: false,
      },
    ];

    return (
      <Table
        data={units}
        columns={columns}
        sortedBy={sortedBy}
        onSort={onSort}
        actionColumnItems={actionColumnItems}
        nestedComponentRender={this.nestedComponentRender}
        loadedNestedRowIds={loadedNestedRowIds}
        onToggleNestedRow={this.onToggleNestedRow}
        redirect={this.onHandleRedirect}
        stickyTopHead={isTabbedPanelContent ? TabbedPanel.nextTopSticky : 0}
      />
    );
  }

  render() {
    const { units } = this.props;

    return units ? this.renderTable() : <LoadingGauge />;
  }
}

UnitsTable.propTypes = {
  units: PropTypes.arrayOf(PropTypes.shape({})),
  isTabbedPanelContent: PropTypes.bool,
  onSort: PropTypes.func.isRequired,
  sortedBy: PropTypes.shape({}),
};

UnitsTable.defaultProps = {
  units: null,
  isTabbedPanelContent: false,
  sortedBy: [],
};

UnitsTable.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  hasForriscoManageUnitPermission: PropTypes.bool.isRequired,
  hasForriscoEditUnitPermission: PropTypes.bool.isRequired,
};

export default UnitsTable;
