import React from 'react';
import _ from 'underscore';

import Modal from 'forpdi/src/components/modals/Modal';
import ExportReportModal from 'forpdi/src/components/modals/ExportReportModal';

import Messages from 'forpdi/src/Messages';

export function exportItemsReport(items, baseUrl) {
  const itemsTopic = Messages.get('label.items');
  const options = {
    [itemsTopic]: [],
  };
  const allSubItems = [];

  const generalInfoId = 0;
  options[itemsTopic].push({ id: generalInfoId, name: Messages.get('label.generalInfo') });

  _.forEach(items, ({ id, name, subitems }) => {
    options[itemsTopic].push({ id, name });
    _.forEach(subitems, ({ id: subitemId, name: subitemName, itemId }) => {
      allSubItems.push({ id: subitemId, name: subitemName, itemId });
    });
  });

  const onExport = (universityName, checkedValues) => {
    const checkedItems = formatValuesToExport(options[itemsTopic], checkedValues);
    const checkedSubitems = formatValuesToExport(allSubItems, checkedValues, 'itemId');
    const url = `${baseUrl}&title=${encodeURIComponent(universityName)}&itens=${encodeURIComponent(checkedItems)}&subitens=${encodeURIComponent(checkedSubitems)}`;
    window.open(url, universityName);
  };

  const modal = (
    <ExportReportModal
      onExport={onExport}
      options={options}
    />
  );

  Modal.show(modal);
}

export function formatValuesToExport(values, checkedValues, idFieldName = 'id') {
  const checkedItems = _.filter(
    values, value => checkedValues.includes(value[idFieldName]),
  );

  return _.map(checkedItems, ({ id }) => id).join(',');
}
