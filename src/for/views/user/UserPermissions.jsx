import React from 'react';
import _ from 'underscore';
import PropTypes from 'prop-types';

import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import Text from 'forpdi/src/components/typography/Text';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import Table from 'forpdi/src/components/Table';
import AppStyledButton from 'forpdi/src/components/buttons/AppStyledButton';

import UserStore from 'forpdi/src/forpdi/core/store/User';
import permissionTypesByApp from 'forpdi/src/forpdi/planning/enum/PermissionTypesByApp';
import UserSession from 'forpdi/src/forpdi/core/store/UserSession';
import Messages from 'forpdi/src/Messages';

class UserPermissions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      permissions: null,
      selectedForpdiPermissions: true,
    };
  }

  componentDidMount() {
    const { params } = this.props;
    const userId = params.userId || UserSession.get('user').id;

    UserStore.on(
      'retrieve-permissions',
      ({ data }) => {
        this.setState({
          permissions: data,
        });
      },
      this,
    );

    UserStore.dispatch({
      action: UserStore.ACTION_LIST_PERMISSIONS,
      data: {
        userId,
      },
    });
  }

  componentWillUnmount() {
    UserStore.off(null, null, this);
  }

  setFpdi = () => {
    this.setState({ selectedForpdiPermissions: true });
  }

  setFrisco = () => {
    this.setState({ selectedForpdiPermissions: false });
  }

  nestedComponentRender = ({ id }) => {
    const { permissions } = this.state;
    const { description } = permissions[id];
    const items = description.split(',');
    return (
      <div className="user-permission-detail">
        <ul style={{ columns: 2, margin: 0 }}>
          {
            items.map((item, idx) => (
              // eslint-disable-next-line react/no-array-index-key
              <li key={`item-${idx}`}>
                <Text style={{ fontSize: '10px' }}>{item}</Text>
              </li>
            ))
          }
        </ul>
      </div>
    );
  }

  getCurrentPermissions() {
    const { selectedForpdiPermissions, permissions } = this.state;
    if (selectedForpdiPermissions) {
      return this.addIds(_.filter(
        permissions, permission => permissionTypesByApp.forpdi.includes(permission.type),
      ));
    }
    return this.addIds(_.filter(
      permissions, permission => permissionTypesByApp.forrisco.includes(permission.type),
    ));
  }

  addIds(array) {
    return _.map(array, (data, idx) => ({
      ...data, id: idx,
    }));
  }

  renderCurrentPermissions() {
    const columns = [
      {
        field: 'permission',
        width: '50%',
        sort: true,
      },
    ];

    const actionColumnItems = [
      {
        icon: 'chevron-right',
        title: Messages.get('label.viewMore'),
        expandNestedRow: true,
      },
    ];

    return (
      <Table
        data={this.getCurrentPermissions()}
        columns={columns}
        actionColumnItems={actionColumnItems}
        showHeader={false}
        nestedComponentRender={this.nestedComponentRender}
        noTableNested
      />
    );
  }

  render() {
    const { selectedForpdiPermissions, permissions } = this.state;

    return (
      <div>
        <TabbedPanel.TopContainer>
          <SecondaryTitle>
            {Messages.get('label.userPermissions')}
          </SecondaryTitle>
          <div>
            <AppStyledButton
              text={Messages.get('label.forPdiBrand')}
              title={Messages.get('label.forPdiBrand')}
              onClick={this.setFpdi}
              appName="fpdi"
              style={{ marginRight: '10px', backgroundColor: 'none' }}
              disabled={selectedForpdiPermissions}
            />
            <AppStyledButton
              text={Messages.get('label.forRiscoBrand')}
              title={Messages.get('label.forRiscoBrand')}
              onClick={this.setFrisco}
              appName="frisco"
              style={{ backgroundColor: 'none' }}
              disabled={!selectedForpdiPermissions}
            />
          </div>
        </TabbedPanel.TopContainer>
        <TabbedPanel.MainContainer>
          {permissions
            ? this.renderCurrentPermissions()
            : <LoadingGauge />}
        </TabbedPanel.MainContainer>
      </div>
    );
  }
}

UserPermissions.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
  theme: PropTypes.string.isRequired,
};

UserPermissions.propTypes = {
  params: PropTypes.shape({
    modelId: PropTypes.string,
  }),
};

UserPermissions.defaultProps = {
  params: null,
};

export default UserPermissions;
