import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import Table from 'forpdi/src/components/Table';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';
import Modal from 'forpdi/src/components/modals/Modal';
import { cutPhrase } from 'forpdi/src/utils/stringUtil';

import Messages from 'forpdi/src/Messages';
import ProcessStore from 'forpdi/src/forrisco/stores/Process';

const ProcessTable = (
  {
    processes,
    onSort,
    sortedBy,
    showHeader,
  },
  { router, hasForriscoManageProcessPermission },
) => {
  function deleteProcess(process) {
    ProcessStore.dispatch({
      action: ProcessStore.ACTION_DELETE,
      data: { processId: process.id },
    });
  }

  function onRedirect(rowData) {
    const { id } = rowData;
    router.push(`/forrisco/process/${id}/info`);
  }

  function onEdit(process) {
    router.push(`/forrisco/process/edit/${process.id}`);
  }

  function renderResponsibleUnit(process) {
    const { unitCreator } = process;
    return (
      <span>
        {unitCreator.name}
      </span>
    );
  }

  function renderRelatedUnits(process) {
    return (
      <div>
        {
          _.map(process.relatedUnits, relatedUnit => (
            <span key={relatedUnit.id}>
              { relatedUnit.name }
              <br />
            </span>
          ))
        }
      </div>
    );
  }

  function renderTable() {
    const onHandleRenderDeleteModal = (data) => {
      const modalText = Messages.get('label.deleteProcessConfirmation');
      const confirmModal = (
        <ConfirmModal
          text={modalText}
          onConfirm={() => deleteProcess(data)}
        />
      );
      Modal.show(confirmModal);
    };

    const renderName = data => (
      <span style={{ wordBreak: 'break-all' }}>
        {cutPhrase(data.name, 100)}
      </span>
    );

    const renderAnex = data => (
      data.file && (
        <span style={{ wordBreak: 'break-all' }}>
          {cutPhrase(data.file.name, 100)}
        </span>
      )
    );

    function renderObjective(process) {
      return (
        <div>
          {
            _.map(process.allObjectives, objective => (
              <span key={objective.id}>
                { cutPhrase(objective.description, 100)}
                <br />
              </span>
            ))
          }
        </div>
      );
    }

    const columns = [
      {
        name: Messages.get('label.process.name'),
        field: 'process.name',
        render: renderName,
        width: '15%',
        sort: true,
      },
      {
        name: Messages.get('label.objectives'),
        field: 'objectives',
        render: renderObjective,
        width: '25%',
      },
      {
        name: Messages.get('label.responsibleUnit'),
        field: 'unitCreator.name',
        render: renderResponsibleUnit,
        width: '15%',
        sort: true,
      },
      {
        name: Messages.get('label.relatedUnits'),
        field: 'relatedUnits',
        render: renderRelatedUnits,
        width: '15%',
      },
      {
        name: Messages.get('label.anex'),
        field: 'file.name',
        render: renderAnex,
        width: '20%',
        sort: true,
      },
    ];

    const actionColumnItems = [
      { icon: 'pen', title: Messages.get('label.editProcess'), action: onEdit },
      { icon: 'trash', title: Messages.get('label.deleteProcess'), action: onHandleRenderDeleteModal },
    ];

    return (
      <Table
        data={processes}
        columns={columns}
        onSort={onSort}
        sortedBy={sortedBy}
        actionColumnItems={hasForriscoManageProcessPermission ? actionColumnItems : null}
        showHeader={showHeader}
        stickyTopHead={TabbedPanel.nextTopSticky}
        redirect={onRedirect}
      />
    );
  }

  return processes ? renderTable() : <LoadingGauge />;
};

ProcessTable.propTypes = {
  processes: PropTypes.arrayOf(PropTypes.shape({})),
  onSort: PropTypes.func.isRequired,
  sortedBy: PropTypes.shape({}),
  showHeader: PropTypes.bool,
};

ProcessTable.defaultProps = {
  processes: null,
  sortedBy: null,
  showHeader: true,
};

ProcessTable.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  hasForriscoManageProcessPermission: PropTypes.bool.isRequired,
};

export default ProcessTable;
