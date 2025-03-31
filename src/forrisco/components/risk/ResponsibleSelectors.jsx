import React from 'react';
import PropTypes from 'prop-types';

import InputContainer from 'forpdi/src/components/inputs/InputContainer';
import SelectBox from 'forpdi/src/components/inputs/SelectBox';

import Messages from 'forpdi/src/Messages';
import UserStore from 'forpdi/src/forpdi/core/store/User';
import { filterManagersFromUsers } from 'forpdi/src/forrisco/helpers/riskHelper';

class ResponsiblesSelector extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      users: [],
      manager: null,
    };
  }

  componentDidMount() {
    const { defaultUser, defaultManager } = this.props;

    UserStore.on('retrieve-to-select-user', ({ data }) => {
      this.setState({
        users: data.list,
      });
    }, this);

    this.hasPermission()
      ? UserStore.dispatch({
        action: UserStore.ACTION_RETRIEVE_TO_SELECT_USER,
      })
      : this.setState({ users: [defaultUser], manager: defaultManager });
  }

  componentWillUnmount() {
    UserStore.off(null, null, this);
  }


  hasPermission() {
    const { hasPermission } = this.props;
    const { hasForriscoManageRiskItemsPermission } = this.context;

    return hasPermission !== undefined ? hasPermission : hasForriscoManageRiskItemsPermission;
  }

  render() {
    const { users, manager } = this.state;
    const {
      onChange,
      errors,
      selectedManagerId,
      selectedUserId,
    } = this.props;

    return (
      <InputContainer className="row">
        <div className="col col-sm-6">
          <SelectBox
            options={manager ? [manager] : filterManagersFromUsers(users)}
            label={Messages.get('label.manager')}
            value={selectedManagerId}
            errorMsg={errors.managerId}
            name="managerId"
            id="managerId"
            onChange={onChange}
            showChooseOption
            required
            disabled={!this.hasPermission()}
          />
        </div>
        <div className="col col-sm-6">
          <SelectBox
            options={users}
            label={Messages.get('label.responsible')}
            value={selectedUserId}
            errorMsg={errors.userId}
            name="userId"
            id="userId"
            onChange={onChange}
            showChooseOption
            required
            disabled={!this.hasPermission()}
          />
        </div>
      </InputContainer>
    );
  }
}

ResponsiblesSelector.propTypes = {
  onChange: PropTypes.func.isRequired,
  defaultUser: PropTypes.shape({}),
  defaultManager: PropTypes.shape({}),
  selectedUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  selectedManagerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  errors: PropTypes.shape({}).isRequired,
  hasPermission: PropTypes.bool,
};

ResponsiblesSelector.defaultProps = {
  defaultUser: undefined,
  defaultManager: undefined,
  selectedUserId: undefined,
  selectedManagerId: undefined,
  hasPermission: undefined,
};

ResponsiblesSelector.contextTypes = {
  hasForriscoManageRiskItemsPermission: PropTypes.bool.isRequired,
};


export default ResponsiblesSelector;
