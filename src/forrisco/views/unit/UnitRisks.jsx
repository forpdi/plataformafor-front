import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import Pagination from 'forpdi/src/components/Pagination';
import RisksTable from 'forpdi/src/forrisco/components/risk/RisksTable';
import RiskFilters from 'forpdi/src/forrisco/components/risk/RiskFilters';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';

import ProcessStore from 'forpdi/src/forrisco/stores/Process';
import StructureStore from 'forpdi/src/forpdi/planning/store/Structure';
import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import Messages from 'forpdi/src/Messages';
import riskArchivedStatus from 'forpdi/src/forrisco/enums/riskArchivedStatus';
import { parseSortedByToList } from 'forpdi/src/utils/util';

class UnitRisks extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      risks: null,
      processes: [],
      linkedPdi: [],
      selectedProcesses: [],
      selectedLinkedPdi: [],
      selectedRiskStatus: riskArchivedStatus.unarchived.id,
      page: 1,
      pageSize: Pagination.defaultPageSize,
      total: null,
      searchTerm: '',
      sortedBy: null,
    };
  }

  componentDidMount() {
    const { unitData } = this.props;
    const { id: unitId } = unitData;
    const {
      page,
      pageSize,
      searchTerm,
      selectedProcesses,
      selectedLinkedPdi,
      selectedRiskStatus,
      sortedBy,
    } = this.state;

    ProcessStore.on('listProcessesLinkedToRisks', ({ data }) => {
      this.setState({
        processes: data.list,
      });
    }, this);

    StructureStore.on('listPdiLinkedToRisks', ({ data }) => {
      this.setState({
        linkedPdi: data.list,
      });
    });

    RiskStore.on('risks-filtered', (response) => {
      this.setState({
        risks: response.data,
        total: response.total,
      });
    }, this);

    RiskStore.on('riskDelete', (deleted) => {
      const { risks, total } = this.state;
      const { toastr } = this.context;
      const updatedrisks = risks.filter(risk => risk.id !== deleted.data.id);

      toastr.addAlertSuccess(Messages.get('label.notification.risk.delete'));
      this.setState({ risks: updatedrisks, total: total - 1 });
    }, this);

    RiskStore.on('riskarchived', (archived) => {
      const riskArchived = archived.data;
      const { risks, total } = this.state;
      const { toastr } = this.context;

      const updatedRisks = risks.filter(risk => risk.id !== riskArchived.id);
      this.setState({ risks: updatedRisks, total: total - 1 });
      toastr.addAlertSuccess(Messages.get('label.notification.risk.archive'));
    }, this);

    RiskStore.on('riskunarchived', (unarchived) => {
      const riskUnarchived = unarchived.data;
      const { risks, total } = this.state;
      const { toastr } = this.context;

      const updatedRisks = risks.filter(risk => risk.id !== riskUnarchived.id);
      this.setState({ risks: updatedRisks, total: total - 1 });
      toastr.addAlertSuccess(Messages.get('label.notification.risk.unarchive'));
    }, this);

    ProcessStore.dispatch({
      action: ProcessStore.ACTION_LIST_BY_UNIT_LINKED_TO_RISKS,
      data: {
        id: unitId,
      },
    });

    StructureStore.dispatch({
      action: StructureStore.ACTION_LIST_BY_UNIT_LINKED_TO_RISKS,
      data: {
        id: unitId,
      },
    });

    this.findRisks(page, pageSize, searchTerm, selectedProcesses, selectedLinkedPdi, sortedBy, selectedRiskStatus);
  }

  findRisks = (page, pageSize, searchTerm, selectedProcesses, selectedLinkedPdi, sortedBy, selectedRiskStatus) => {
    const { unitData } = this.props;
    const { id: unitId } = unitData;
    const { planRisk } = unitData;

    this.setState({
      page,
      pageSize,
      sortedBy,
      risks: null,
      total: null,
    });
    RiskStore.dispatch({
      action: RiskStore.ACTION_FILTER_RISKS,
      data: {
        planRiskId: planRisk.id,
        page,
        pageSize,
        filters: {
          unitIds: [unitId],
          term: searchTerm.trim(),
          processesId: _.map(selectedProcesses, ({ id }) => id),
          linkedPdiIds: _.map(selectedLinkedPdi, ({ id }) => id),
          archived: selectedRiskStatus,
        },
        sortedBy: parseSortedByToList(sortedBy),
      },
    });
  };

  onSearchTermChange = (value) => {
    this.setState({
      searchTerm: value,
    });
  }

  onProcessChange = (newSelectedProcesses) => {
    this.setState({ selectedProcesses: newSelectedProcesses });
  }

  onLinkedToPdiChange = (newSelectedLinkedToPdi) => {
    this.setState({ selectedLinkedPdi: newSelectedLinkedToPdi });
  }

  onChangeStateRisks = (newSelectedRiskStatus) => {
    const { value } = newSelectedRiskStatus.target ? newSelectedRiskStatus.target : 'false';
    this.setState({ selectedRiskStatus: value === 'true' });
  }

  pageChange = (page, pageSize) => {
    const {
      searchTerm,
      selectedProcesses,
      selectedLinkedPdi,
      sortedBy,
      selectedRiskStatus,
    } = this.state;

    this.findRisks(page, pageSize, searchTerm, selectedProcesses, selectedLinkedPdi, sortedBy, selectedRiskStatus);
    this.setState({
      page,
      pageSize,
    });
  }

  componentWillUnmount() {
    RiskStore.off(null, null, null);
    ProcessStore.off(null, null, null);
    StructureStore.off(null, null, null);
  }

  onEdit = (risk) => {
    const { router } = this.context;
    router.push(`/forrisco/risk/edit/${risk.id}`);
  }

  onHandleRedirect = (risk) => {
    const { router } = this.context;
    router.push(`/forrisco/risk/${risk.id}`);
  }

  onNew = () => {
    const { router } = this.context;
    const { unitData } = this.props;
    const { id: unitId } = unitData;

    router.push(`forrisco/unit/${unitId}/risk/new`);
  }

  onSort = (newSortedBy) => {
    const {
      pageSize,
      searchTerm,
      selectedProcesses,
      selectedLinkedPdi,
      selectedRiskStatus,
    } = this.state;
    this.findRisks(1, pageSize, searchTerm, selectedProcesses, selectedLinkedPdi, newSortedBy, selectedRiskStatus);
  }

  render() {
    const { hasForriscoManageRiskPermission } = this.context;
    const {
      risks,
      page,
      searchTerm,
      processes,
      linkedPdi,
      selectedProcesses,
      selectedLinkedPdi,
      selectedRiskStatus,
      sortedBy,
      pageSize,
      total,
    } = this.state;

    return (
      <div style={{ overflow: 'inherit' }}>
        <TabbedPanel.TopContainer style={{ display: 'block', height: '160px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <SecondaryTitle>{Messages.get('label.risks')}</SecondaryTitle>
            {
              hasForriscoManageRiskPermission && (
                <PrimaryButton
                  text={Messages.get('label.riskRegister')}
                  title={Messages.get('label.riskRegister')}
                  onClick={this.onNew}
                />
              )
            }
          </div>
          <RiskFilters
            searchValue={searchTerm}
            selectedProcesses={selectedProcesses}
            selectedLinkedPdi={selectedLinkedPdi}
            selectedRiskStatus={selectedRiskStatus}
            processOptions={processes}
            linkedPdiOptions={linkedPdi}
            onChangeSearch={this.onSearchTermChange}
            onChangeProcesses={this.onProcessChange}
            onChangeLinkedToPdi={this.onLinkedToPdiChange}
            onChangeStateRisks={this.onChangeStateRisks}
            onSubmit={
              (term, newSelectedProcesses, newSelectedLinkedPdi, newSelectedRiskStatus) => this.findRisks(
                1, pageSize, term, newSelectedProcesses, newSelectedLinkedPdi, null, newSelectedRiskStatus,
              )
            }
          />
        </TabbedPanel.TopContainer>
        <TabbedPanel.MainContainer>
          <RisksTable
            risks={risks}
            onSort={this.onSort}
            sortedBy={sortedBy}
          />
        </TabbedPanel.MainContainer>
        <Pagination
          total={total}
          onChange={this.pageChange}
          page={page}
          pageSize={pageSize}
        />
      </div>
    );
  }
}

UnitRisks.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
  hasForriscoManageRiskPermission: PropTypes.bool.isRequired,
};

UnitRisks.propTypes = {
  params: PropTypes.shape({}),
  unitData: PropTypes.shape({}),
};

UnitRisks.defaultProps = {
  params: {},
  unitData: null,
};

export default UnitRisks;
