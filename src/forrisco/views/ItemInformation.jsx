import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import InfoDisplayHtml from 'forpdi/src/components/info/InfoDisplayHtml';
import InfoDisplayLink from 'forpdi/src/components/info/InfoDisplayLink';
import IconButton from 'forpdi/src/components/buttons/IconButton';
import Messages from 'forpdi/src/Messages';
import FileStore from 'forpdi/src/forpdi/core/store/File';
import HistoryTable from 'forpdi/src/forrisco/components/HistoryTable';
import SegmentedSwitch from 'forpdi/src/forrisco/components/controls/SegmentedSwitch';

class ItemInformation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      viewMode: 'info',
    };
  }

  onViewModeChange = (newViewMode) => {
    this.setState({ viewMode: newViewMode });
  };

  handleFileDownload = (fileIdentifier, fileName) => {
    fetch(`${FileStore.url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: fileIdentifier }),
    })
      .then((response) => {
        if (!response.ok) {
          return Promise.reject(new Error('Falha no download'));
        }
        return response.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      });
  };

  renderFields() {
    const { fields } = this.props;

    return _.map(fields, ({
      id, name, description, isText, fileLink,
    }) => {
      if (isText) {
        return (
          <InfoDisplayHtml
            key={id}
            label={name}
            htmlInfo={description}
          />
        );
      }
      return (
        <InfoDisplayLink
          key={id}
          label={name}
          onClick={() => this.handleFileDownload(fileLink, description)}
          style={{ wordBreak: 'break-all', cursor: 'pointer' }}
          info={description}
        />
      );
    });
  }

  extractIdFromHash(keyword) {
    if (typeof window === 'undefined' || !window.location || !window.location.hash) return null;
    const { hash } = window.location;
    const re = new RegExp(`${keyword}\\/(\\d+)`, 'i');
    const m = hash.match(re);
    return m && m[1] ? m[1] : null;
  }

  isPolicyRoute() {
    if (typeof window === 'undefined' || !window.location || !window.location.hash) return false;
    return /\/policy\//i.test(window.location.hash);
  }

  resolveHistoryTarget() {
    const { params } = this.props;
    const policy = this.isPolicyRoute();

    const subId = params.subitemId
      || params.subItemId
      || this.extractIdFromHash('subitem')
      || this.extractIdFromHash('subItem')
      || ((params.id && !params.itemId) ? params.id : null);

    if (subId) {
      return { entityId: subId, entityName: policy ? 'SubItem' : 'PlanRiskSubItem' };
    }

    const itemId = params.itemId || this.extractIdFromHash('item');
    if (itemId) {
      return { entityId: itemId, entityName: policy ? 'Item' : 'PlanRiskItem' };
    }

    return { entityId: null, entityName: null };
  }

  renderHistoryView() {
    const { entityId, entityName } = this.resolveHistoryTarget();
    if (!entityId || !entityName) {
      return null;
    }
    const tableKey = `${entityName}-${entityId}`;

    return (
      <TabbedPanel.MainContainer>
        <HistoryTable key={tableKey} entityId={entityId} entityName={entityName} />
      </TabbedPanel.MainContainer>
    );
  }

  renderMainContent() {
    return (
      <TabbedPanel.MainContainer>
        {this.renderFields()}
      </TabbedPanel.MainContainer>
    );
  }

  renderTopContent() {
    const { viewMode } = this.state;
    const { itemName, hasPermission, onEdit } = this.props;

    return (
      <TabbedPanel.TopContainer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SecondaryTitle>
          {viewMode === 'info' ? itemName : `HISTÓRICO DE ALTERAÇÕES - ${itemName.toUpperCase()}`}
        </SecondaryTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {viewMode === 'info' && hasPermission && (
            <IconButton
              icon="pen"
              title={Messages.get('label.editUnit')}
              onClick={onEdit}
            />
          )}
          <SegmentedSwitch
            options={[
              { id: 'info', label: 'Versão Atual' },
              { id: 'history', label: 'Histórico' },
            ]}
            value={viewMode}
            onChange={this.onViewModeChange}
            minWidth={120}
            ariaLabel="Alternar entre Versão Atual e Histórico"
          />

        </div>
      </TabbedPanel.TopContainer>
    );
  }

  render() {
    const { viewMode } = this.state;

    return (
      <div>
        {this.renderTopContent()}
        {viewMode === 'info' ? this.renderMainContent() : this.renderHistoryView()}
      </div>
    );
  }
}

ItemInformation.propTypes = {
  onEdit: PropTypes.func,
  itemName: PropTypes.string,
  fields: PropTypes.arrayOf(PropTypes.shape({})),
  params: PropTypes.shape({
    itemId: PropTypes.string,
    subitemId: PropTypes.string,
    subItemId: PropTypes.string,
    id: PropTypes.string,
  }),
  hasPermission: PropTypes.bool,
};

ItemInformation.defaultProps = {
  onEdit: null,
  fields: [],
  itemName: '',
  params: {},
  hasPermission: false,
};

ItemInformation.contextTypes = {
  router: PropTypes.shape({}).isRequired,
};

export default ItemInformation;
