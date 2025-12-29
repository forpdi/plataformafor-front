import React from 'react';
import PropTypes from 'prop-types';

import IconButton from 'forpdi/src/components/buttons/IconButton';

import Messages from 'forpdi/src/Messages';

const ExportReportButtons = ({ onExportPdf, onExportCsv }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'row',
      gap: '1rem',
      alignSelf: 'flex-end',
    }}
  >
    <IconButton
      title={Messages.get('label.exportPDF')}
      icon="file-pdf"
      onClick={onExportPdf}
      size="25px"
      style={{ margin: '0 0 1rem' }}
    />
    <IconButton
      title={Messages.get('label.exportCSV')}
      icon="file-csv"
      onClick={onExportCsv}
      size="25px"
      style={{ margin: '0 0 1rem' }}
    />
  </div>
);

ExportReportButtons.propTypes = {
  onExportPdf: PropTypes.func.isRequired,
  onExportCsv: PropTypes.func.isRequired,
};

export default ExportReportButtons;
