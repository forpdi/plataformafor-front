import React from 'react';
import PropTypes from 'prop-types';

import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import SearchBox from 'forpdi/src/components/inputs/SearchBox';
import SubunitsTable from 'forpdi/src/forrisco/components/unit/SubunitsTable';
import Pagination from 'forpdi/src/components/Pagination';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';

import UnitStore from 'forpdi/src/forrisco/stores/Unit';
import Messages from 'forpdi/src/Messages';
import { parseSortedByToList } from 'forpdi/src/utils/util';


class UnitSubunits extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      subunits: null,
      page: 1,
      pageSize: Pagination.defaultPageSize,
      total: null,
      searchTerm: '',
      sortedBy: null,
      waitingSubmit: false,
    };
  }

  componentDidMount() {
    const { pageSize, searchTerm, sortedBy } = this.state;

    UnitStore.on('subunitsListed', (response) => {
      this.setState({
        subunits: response.data,
        total: response.total,
      });
    }, this);

    UnitStore.on('subunitDeleted', (deleted) => {
      const { subunits, total } = this.state;
      const { toastr } = this.context;
      const updatedSubunits = subunits.filter(unit => unit.id !== deleted.data.id);

      toastr.addAlertSuccess(Messages.get('notification.subunit.delete'));
      this.setState({ subunits: updatedSubunits, total: total - 1 });
    }, this);

    this.findUnits(1, pageSize, searchTerm, sortedBy);
  }

  findUnits = (page, pageSize, searchTerm, sortedBy) => {
    const { params } = this.props;
    const { unitId } = params;

    this.setState({
      page,
      pageSize,
      sortedBy,
      subunits: null,
      total: null,
    });

    UnitStore.dispatch({
      action: UnitStore.ACTION_LIST_SUBUNIT,
      data: {
        unitId,
        page,
        pageSize,
        term: searchTerm.trim(),
        sortedBy: parseSortedByToList(sortedBy),
      },
    });
  }

  pageChange = (page, pageSize) => {
    const { searchTerm, sortedBy } = this.state;
    this.findUnits(page, pageSize, searchTerm, sortedBy);
    this.setState({
      page,
      pageSize,
    });
  }

  componentWillUnmount() {
    UnitStore.off(null, null, this);
  }

  onNew = () => {
    const { router } = this.context;
    const { params } = this.props;
    const { unitId } = params;

    router.push(`forrisco/unit/${unitId}/subunit/new`);
  }

  onSearchTermChange = (value) => {
    this.setState({
      searchTerm: value,
    });
  }

  onSort = (newSortedBy) => {
    const {
      pageSize,
      searchTerm,
    } = this.state;
    this.findUnits(1, pageSize, searchTerm, newSortedBy);
  }

  render() {
    const { hasForriscoManageUnitPermission } = this.context;
    const {
      subunits,
      page,
      pageSize,
      sortedBy,
      total,
      searchTerm,
      waitingSubmit,
    } = this.state;

    return (
      <div style={{ overflow: 'inherit' }}>
        <TabbedPanel.TopContainer style={{ display: 'block' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <SecondaryTitle>{Messages.get('label.subunitys')}</SecondaryTitle>
            {
              hasForriscoManageUnitPermission && (
                <PrimaryButton
                  text={Messages.get('label.subunitRegister')}
                  title={Messages.get('label.subunitRegister')}
                  onClick={this.onNew}
                  loading={waitingSubmit}
                />
              )
            }
          </div>
          <SearchBox
            value={searchTerm}
            placeholder={Messages.get('label.search')}
            onChange={this.onSearchTermChange}
            onSubmit={term => this.findUnits(1, pageSize, term, null)}
          />
        </TabbedPanel.TopContainer>
        <TabbedPanel.MainContainer>
          <SubunitsTable
            subunits={subunits}
            onSort={this.onSort}
            sortedBy={sortedBy}
            isTabbedPanelContent
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

UnitSubunits.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
  hasForriscoManageUnitPermission: PropTypes.bool.isRequired,
};

UnitSubunits.propTypes = {
  params: PropTypes.shape({}),
};

UnitSubunits.defaultProps = {
  params: {},
};

export default UnitSubunits;
