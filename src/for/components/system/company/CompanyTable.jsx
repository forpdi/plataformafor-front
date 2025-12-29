import React from 'react';
import PropTypes from 'prop-types';

import Table from 'forpdi/src/components/Table';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';
import Modal from 'forpdi/src/components/modals/Modal';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';

import Messages from 'forpdi/src/Messages';
import CompanyStore from 'forpdi/src/forpdi/core/store/Company';
import { concatCompanyLocalization } from 'forpdi/src/utils/stringUtil';

const CompanyTable = (
  {
    companies,
    onSort,
    sortedBy,
  }, { router, theme },
) => {
  function onHandleRenderDeleteModal(data) {
    const modalText = Messages.get('label.institutionDeleteConfirmation');

    const confirmModal = (
      <ConfirmModal
        text={modalText}
        onConfirm={() => deleteCompany(data)}
      />
    );
    Modal.show(confirmModal, theme);
  }

  function onEdit({ id }) {
    router.push(`/system/companies/edit/${id}`);
  }

  function deleteCompany(data) {
    CompanyStore.dispatch({
      action: CompanyStore.ACTION_REMOVE_COMPANY,
      data: data.id,
    });
  }

  function renderTable() {
    const columns = [
      {
        name: Messages.get('label.institutionName'),
        field: 'name',
        width: '35%',
        sort: true,
      },
      {
        name: Messages.get('label.initials'),
        field: 'initials',
        width: '30%',
        sort: true,
      },
      {
        name: Messages.get('label.cityState'),
        field: 'county.name',
        render: company => concatCompanyLocalization(company),
        width: '30%',
        sort: true,
      },
    ];

    const actionColumnItems = [
      { icon: 'pen', title: Messages.get('label.editCompany'), action: onEdit },
      { icon: 'trash', title: Messages.get('label.delete'), action: onHandleRenderDeleteModal },
    ];

    return (
      <Table
        data={companies}
        columns={columns}
        onSort={newSortedBy => onSort(newSortedBy)}
        sortedBy={sortedBy}
        stickyTopHead={TabbedPanel.nextTopSticky}
        actionColumnItems={actionColumnItems}
        redirect={({ id }) => router.push(`/system/companies/info/${id}`)}
      />
    );
  }

  return renderTable();
};

CompanyTable.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  theme: PropTypes.string.isRequired,
};

CompanyTable.propTypes = {
  companies: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onSort: PropTypes.func.isRequired,
  sortedBy: PropTypes.shape({}),
};

CompanyTable.defaultProps = {
  sortedBy: null,
};

export default CompanyTable;
