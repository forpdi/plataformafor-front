import React from 'react';
import PropTypes from 'prop-types';

import AccessLevels from 'forpdi/src/forpdi/core/store/AccessLevels';
import Table from 'forpdi/src/components/Table';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';

import Messages from 'forpdi/src/Messages';

const SystemUsersTable = (
  {
    users,
    onSort,
    sortedBy,
  },
) => {
  function renderTable() {
    function renderAccountType(user) {
      const { accessLevel } = user;
      const accountType = AccessLevels.mapped[accessLevel];

      return <span>{accountType}</span>;
    }

    function renderCompany(user) {
      const { company } = user;
      const companyName = company.name;

      return <span>{companyName}</span>;
    }

    function renderName(user) {
      const { name } = user;
      return <span>{name}</span>;
    }

    const columns = [
      {
        name: Messages.get('label.name'),
        field: 'user.name',
        render: renderName,
        width: '30%',
        sort: true,
      },
      {
        name: Messages.get('label.typeLegend'),
        field: 'accessLevel',
        render: renderAccountType,
        width: '30%',
        sort: true,
      },
      {
        name: Messages.get('label.institution'),
        field: 'company.name',
        render: renderCompany,
        width: '30%',
        sort: true,
      },
    ];

    return (
      <Table
        data={users}
        columns={columns}
        onSort={onSort}
        sortedBy={sortedBy}
        stickyTopHead={TabbedPanel.nextTopSticky}
      />
    );
  }

  return renderTable();
};

SystemUsersTable.propTypes = {
  users: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onSort: PropTypes.func.isRequired,
  sortedBy: PropTypes.shape({}),
};

SystemUsersTable.defaultProps = {
  sortedBy: null,
};

SystemUsersTable.contextTypes = {
  toastr: PropTypes.shape({}).isRequired,
};

export default SystemUsersTable;
