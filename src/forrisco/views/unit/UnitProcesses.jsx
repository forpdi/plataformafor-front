import React from 'react';
import PropTypes from 'prop-types';

import Pagination from 'forpdi/src/components/Pagination';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import ProcessTable from 'forpdi/src/forrisco/components/process/ProcessTable';
import SearchBox from 'forpdi/src/components/inputs/SearchBox';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';

import { parseSortedByToList } from 'forpdi/src/utils/util';
import ProcessStore from 'forpdi/src/forrisco/stores/Process';
import UnitStore from 'forpdi/src/forrisco/stores/Unit';
import Messages from 'forpdi/src/Messages';


class UnitProcesses extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      processes: null,
      page: 1,
      pageSize: Pagination.defaultPageSize,
      total: null,
      searchTerm: '',
      sortedBy: null,
      waitingSubmit: false,
    };
  }

  componentDidMount() {
    const { unitData } = this.props;
    const { id: unitId } = unitData;
    const {
      page,
      pageSize,
      searchTerm,
      sortedBy,
    } = this.state;

    ProcessStore.on('processListedByUnit', (response) => {
      this.setState({
        processes: response.data,
        total: response.total,
      });
    }, this);

    ProcessStore.on('processDeleted', (deleted) => {
      const { processes, total } = this.state;
      const { toastr } = this.context;
      const updatedProcesses = processes.filter(process => process.id !== deleted.data.id);

      toastr.addAlertSuccess(Messages.get('label.notification.process.delete'));
      this.setState({ processes: updatedProcesses, total: total - 1 });
    }, this);

    this.findProcesses(unitId, page, pageSize, searchTerm, sortedBy);
  }

  findProcesses = (unitId, page, pageSize, searchTerm, sortedBy) => {
    this.setState({
      page,
      pageSize,
      sortedBy,
      processes: null,
      total: null,
    });
    ProcessStore.dispatch({
      action: ProcessStore.ACTION_LIST_BY_UNIT,
      data: {
        id: unitId,
        page,
        pageSize,
        term: searchTerm.trim(),
        sortedBy: parseSortedByToList(sortedBy),
      },
    });
  };

  onSearchTermChange = (value) => {
    this.setState({
      searchTerm: value,
    });
  }

  clearSearch = () => {
    const { pageSize, searchTerm } = this.state;
    const { unitData } = this.props;
    const { id: unitId } = unitData;

    this.setState({ searchTerm: '' });
    this.findProcesses(unitId, 1, pageSize, searchTerm);
  }


  pageChange = (page, pageSize) => {
    const { unitData } = this.props;
    const { id: unitId } = unitData;
    const { searchTerm, sortedBy } = this.state;

    this.findProcesses(unitId, page, pageSize, searchTerm, sortedBy);
    this.setState({
      page,
      pageSize,
    });
  }

  componentWillUnmount() {
    ProcessStore.off(null, null, this);
    UnitStore.off(null, null, this);
  }

  onHandleRedirect = (process) => {
    const { router } = this.context;
    router.push(`/forrisco/process/${process.id}`);
  }

  onNewProcess = () => {
    const { router } = this.context;
    const { params } = this.props;
    const { unitId } = params;

    router.push(`/forrisco/unit/${unitId}/process/new`);

    this.setState({
      waitingSubmit: true,
    });
  }

  onSort = (newSortedBy) => {
    const { unitData } = this.props;
    const { id: unitId } = unitData;
    const {
      pageSize,
      searchTerm,
    } = this.state;
    this.findProcesses(unitId, 1, pageSize, searchTerm, newSortedBy);
  }

  render() {
    const { hasForriscoManageProcessPermission } = this.context;
    const { unitData } = this.props;
    const { id: unitId } = unitData;
    const {
      processes,
      page,
      searchTerm,
      sortedBy,
      pageSize,
      total,
      waitingSubmit,
    } = this.state;

    return (
      <div style={{ overflow: 'inherit' }}>
        <TabbedPanel.TopContainer style={{ display: 'block' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <SecondaryTitle>{Messages.get('label.processes')}</SecondaryTitle>
            {
              hasForriscoManageProcessPermission && (
                <PrimaryButton
                  text={Messages.get('label.processRegister')}
                  title={Messages.get('label.processRegister')}
                  onClick={this.onNewProcess}
                  loading={waitingSubmit}
                />
              )
            }
          </div>
          <SearchBox
            value={searchTerm}
            placeholder={Messages.get('label.search')}
            onChange={this.onSearchTermChange}
            onSubmit={term => this.findProcesses(unitId, 1, pageSize, term, null)}
          />
        </TabbedPanel.TopContainer>
        <TabbedPanel.MainContainer>
          <ProcessTable
            processes={processes}
            onSort={this.onSort}
            sortedBy={sortedBy}
            showHeader
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

UnitProcesses.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
  hasForriscoManageProcessPermission: PropTypes.bool.isRequired,
};

UnitProcesses.propTypes = {
  params: PropTypes.shape({}),
  unitData: PropTypes.shape({}),
};

UnitProcesses.defaultProps = {
  params: {},
  unitData: {
    planRisk: {},
    name: null,
  },
};

export default UnitProcesses;
