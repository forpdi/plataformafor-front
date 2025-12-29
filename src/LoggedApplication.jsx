import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import Application from 'forpdi/src/Application';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';

import AccessLevels from 'forpdi/src/forpdi/core/store/AccessLevels.json';
import PermissionTypes from 'forpdi/src/forpdi/planning/enum/PermissionsTypes.json';
import UserSession from 'forpdi/src/forpdi/core/store/UserSession';

class LoggedApplication extends React.Component {
  constructor(props, context) {
    super(props);
    const { router } = context;
    const loading = UserSession.get('loading');
    const logged = UserSession.get('logged');
    if (!loading && !logged) {
      router.push('/login');
    }

    this.state = {
      loading,
      accessLevel: logged ? UserSession.get('accessLevel') : 0,
      permissions: logged ? UserSession.get('permissions') : [],
    };
  }

  getChildContext() {
    const { accessLevel, permissions } = this.state;
    const roles = {
      NORMAL: accessLevel >= AccessLevels.enum.NORMAL,
      COLABORATOR: accessLevel >= AccessLevels.enum.COLABORATOR,
      MANAGER: accessLevel >= AccessLevels.enum.MANAGER,
      ADMIN: accessLevel >= AccessLevels.enum.ADMIN,
      SYSADMIN: accessLevel >= AccessLevels.enum.SYSADMIN,
    };

    return {
      accessLevel,
      accessLevels: AccessLevels.enum,
      permissions,
      roles,
      hasManageUsersPermission: this.checkPermission(
        roles.ADMIN, [
          PermissionTypes.MANAGE_USERS_PERMISSION,
          PermissionTypes.FORRISCO_MANAGE_USERS_PERMISSION,
        ],
      ),
      hasViewUsersPermission: this.checkPermission(
        roles.ADMIN, [
          PermissionTypes.MANAGE_USERS_PERMISSION,
          PermissionTypes.FORRISCO_MANAGE_USERS_PERMISSION,
          PermissionTypes.VIEW_USERS_PERMISSION,
          PermissionTypes.FORRISCO_VIEW_USERS_PERMISSION,
        ],
      ),
      hasForriscoManagePolicyPermission: this.checkPermission(
        roles.ADMIN, [PermissionTypes.FORRISCO_MANAGE_POLICY_PERMISSION],
      ),
      hasForriscoManagePlanRiskPermission: this.checkPermission(
        roles.ADMIN, [PermissionTypes.FORRISCO_MANAGE_PLAN_RISK_PERMISSION],
      ),
      hasForriscoManageUnitPermission: this.checkPermission(
        roles.ADMIN, [PermissionTypes.FORRISCO_MANAGE_UNIT_PERMISSION],
      ),
      hasForriscoEditUnitPermission: this.checkPermission(
        roles.ADMIN, [
          PermissionTypes.FORRISCO_EDIT_UNIT_PERMISSION,
          PermissionTypes.FORRISCO_MANAGE_PLAN_RISK_PERMISSION,
        ],
      ),
      hasForriscoManageProcessPermission: this.checkPermission(
        roles.MANAGER, [PermissionTypes.FORRISCO_MANAGE_PROCESS_PERMISSION],
      ),
      hasForriscoManageRiskPermission: this.checkPermission(
        roles.MANAGER, [PermissionTypes.FORRISCO_MANAGE_RISK_PERMISSION],
      ),
      hasForriscoManageRiskItemsPermission: this.checkPermission(
        roles.MANAGER, [PermissionTypes.FORRISCO_MANAGE_RISK_ITEMS_PERMISSION],
      ),
    };
  }

  checkPermission(role, permissionTypes) {
    const { permissions } = this.state;
    let hasPermission = false;
    _.forEach(permissions, (permission) => {
      if (permissionTypes.includes(permission)) {
        hasPermission = true;
      }
    });

    return role || hasPermission;
  }

  componentDidMount() {
    UserSession.on('login', () => {
      this.setState({
        accessLevel: UserSession.get('accessLevel') || 0,
        permissions: UserSession.get('permissions') || [],
      });
    }, this);
    UserSession.on('logout', () => {
      this.setState({
        accessLevel: 0,
        permissions: [],
      });
    }, this);
    UserSession.on('loaded', () => {
      this.setState({ loading: false });
    }, this);
  }

  componentWillUnmount() {
    UserSession.off(null, null, this);
  }

  render() {
    const { children } = this.props;
    const { loading, accessLevel } = this.state;

    if (loading || accessLevel === 0) {
      if (children.type.name === 'ForpdiApplication') {
        return <LoadingGauge propTheme="fpdi" />;
      }
      if (children.type.name === 'ForriscoApplication') {
        return <LoadingGauge propTheme="frisco" />;
      }
      return <LoadingGauge />;
    }


    return <Application>{children}</Application>;
  }
}

LoggedApplication.propTypes = {
  location: PropTypes.shape({}).isRequired,
  children: PropTypes.node,
};

LoggedApplication.defaultProps = {
  children: null,
};

LoggedApplication.contextTypes = {
  router: PropTypes.shape({}).isRequired,
};

LoggedApplication.childContextTypes = {
  accessLevel: PropTypes.number,
  accessLevels: PropTypes.shape({}),
  permissions: PropTypes.arrayOf(PropTypes.shape({})),
  roles: PropTypes.shape({}),
  hasManageUsersPermission: PropTypes.bool,
  hasViewUsersPermission: PropTypes.bool,
  hasForriscoManagePolicyPermission: PropTypes.bool,
  hasForriscoManagePlanRiskPermission: PropTypes.bool,
  hasForriscoManageUnitPermission: PropTypes.bool,
  hasForriscoEditUnitPermission: PropTypes.bool,
  hasForriscoManageProcessPermission: PropTypes.bool,
  hasForriscoManageRiskPermission: PropTypes.bool,
  hasForriscoManageRiskItemsPermission: PropTypes.bool,
};

export default LoggedApplication;
