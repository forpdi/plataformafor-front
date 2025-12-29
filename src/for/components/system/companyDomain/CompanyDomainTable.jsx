import React from 'react';
import PropTypes from 'prop-types';

import Table from 'forpdi/src/components/Table';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';
import Modal from 'forpdi/src/components/modals/Modal';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';

import Messages from 'forpdi/src/Messages';
import CompanyDomainStore from 'forpdi/src/forpdi/core/store/CompanyDomain';


const CompanyDomainTable = (
  {
    companyDomains,
    onSort,
    sortedBy,
  }, { theme, router },
) => {
  function onHandleRenderDeleteModal(data) {
    const modalText = Messages.get('label.domainDeleteConfirmation');

    const confirmModal = (
      <ConfirmModal
        text={modalText}
        onConfirm={() => deleteDomain(data)}
      />
    );
    Modal.show(confirmModal, theme);
  }

  function onEdit({ id }) {
    router.push(`/system/domains/edit/${id}`);
  }

  function deleteDomain(data) {
    CompanyDomainStore.dispatch({
      action: CompanyDomainStore.ACTION_REMOVE_DOMAIN,
      data: data.id,
    });
  }

  function renderCompanyName(domain) {
    const { name: institutionName } = domain.company;
    return <span>{institutionName}</span>;
  }

  function renderCompanyInitials(domain) {
    const { initials: institutionInitials } = domain.company;
    return <span>{institutionInitials}</span>;
  }

  function renderTable() {
    const columns = [
      {
        name: Messages.get('label.host'),
        field: 'host',
        width: '20%',
        sort: true,
      },
      {
        name: Messages.get('label.institutionName'),
        field: 'company.name',
        width: '25%',
        render: renderCompanyName,
        sort: true,
      },
      {
        name: Messages.get('label.initials'),
        field: 'company.initials',
        width: '15%',
        render: renderCompanyInitials,
        sort: true,
      },
      {
        name: Messages.get('label.acessLink'),
        field: 'baseUrl',
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
        data={companyDomains}
        columns={columns}
        onSort={onSort}
        sortedBy={sortedBy}
        stickyTopHead={TabbedPanel.nextTopSticky}
        actionColumnItems={actionColumnItems}
      />
    );
  }

  return renderTable();
};

CompanyDomainTable.contextTypes = {
  theme: PropTypes.string.isRequired,
  router: PropTypes.shape({}).isRequired,
};

CompanyDomainTable.propTypes = {
  companyDomains: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onSort: PropTypes.func,
  sortedBy: PropTypes.shape({}),
};

CompanyDomainTable.defaultProps = {
  onSort: null,
  sortedBy: [],
};

export default CompanyDomainTable;
