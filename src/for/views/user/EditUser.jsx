import React from 'react';
import PropTypes from 'prop-types';

import AppContainer from 'forpdi/src/components/AppContainer';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import UserForm from 'forpdi/src/for/components/user/UserForm';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import FormPageTop from 'forpdi/src/components/FormPageTop';

import Messages from 'forpdi/src/Messages';
import validationUser from 'forpdi/src/for/validations/validationUser';
import UserStore from 'forpdi/src/forpdi/core/store/User';
import { removeEspecialCharsFromCpf, removeEspecialCharsFromPhone, validatePhone } from 'forpdi/src/utils/util';

class EditUser extends React.Component {
  constructor(props) {
    super(props);
    const { location } = props;

    this.state = {
      user: null,
      errors: {},
      showPasswordFields: this.shouldShowPasswordFields(location),
      waitingSubmit: false,
    };
  }

  componentWillReceiveProps(newProps) {
    const { location } = newProps;
    this.setState({
      showPasswordFields: this.shouldShowPasswordFields(location),
    });
  }

  shouldShowPasswordFields(location) {
    const { query } = location;

    return query.changePassword === 'true';
  }

  componentDidMount() {
    const { toastr, router } = this.context;
    const { params } = this.props;

    const onUserRetrieved = ({ data }) => {
      this.censoredCpf = data.cpf;
      this.setState({
        user: {
          ...data,
          phone: validatePhone(data.phone) ? data.phone : null,
        },
      });
    };

    UserStore.on('find-user', onUserRetrieved, this);

    UserStore.on('retrieve-user-profile', onUserRetrieved, this);

    UserStore.on(
      'userUpdated',
      () => {
        toastr.addAlertSuccess(Messages.get('notification.dataEditedSuccessfully'));
        const targetUrl = this.isUserProfile()
          ? 'users/profile'
          : `users/details/${params.userId}`;
        router.push(targetUrl);
      },
      this,
    );

    UserStore.on('fail', () => this.setState({ waitingSubmit: false }));

    this.retrieveUser();
  }

  componentWillUnmount() {
    UserStore.off(null, null, this);
  }

  retrieveUser() {
    if (this.isUserProfile()) {
      UserStore.dispatch({
        action: UserStore.ACTION_USER_PROFILE,
      });
    } else {
      const { params } = this.props;
      UserStore.dispatch({
        action: UserStore.ACTION_FIND_USER,
        data: params.userId,
      });
    }
  }

  onSubmit = () => {
    const { user, showPasswordFields } = this.state;
    const cpfChanged = user.cpf !== this.censoredCpf;
    const action = this.isUserProfile()
      ? UserStore.ACTION_UPDATE_USER_PROFILE
      : UserStore.ACTION_UPDATE_USER;

    const onSuccess = () => {
      UserStore.dispatch({
        action,
        data: {
          user: {
            ...user,
            cpf: cpfChanged ? removeEspecialCharsFromCpf(user.cpf) : null,
            cellphone: removeEspecialCharsFromPhone(user.cellphone),
            phone: removeEspecialCharsFromPhone(user.phone),
          },
          currentPassword: user.currentPassword !== undefined
            ? user.currentPassword
            : null,
          newPassword: user.newPassword !== undefined
            ? user.newPassword
            : null,
        },
      });
    };

    validationUser(
      user,
      cpfChanged,
      showPasswordFields,
      this.isUserProfile(),
      onSuccess,
      this,
    );
  }

  onChangeHandler = (user) => {
    this.setState({ user });
  }

  isUserProfile() {
    const { params } = this.props;
    const { userId } = params;

    return !userId;
  }

  goBack = () => {
    const { router } = this.context;
    const { params } = this.props;
    params.userId
      ? router.push(`/users/details/${params.userId}`)
      : router.push('/users/profile');
  }

  getPasswordLink() {
    const { roles } = this.context;
    const { location } = this.props;
    const { pathname } = location;

    return (roles.SYSADMIN || this.isUserProfile())
      ? `#${pathname}?changePassword=true`
      : null;
  }

  renderTopContent() {
    const { waitingSubmit } = this.state;

    return (
      <FormPageTop
        label={Messages.get('label.editProfile')}
        onSubmit={this.onSubmit}
        waitingSubmit={waitingSubmit}
        goBackTo={this.goBack}
      />
    );
  }

  renderMainContent() {
    const {
      user, errors, showPasswordFields,
    } = this.state;

    return (
      <AppContainer.MainContent>
        <TabbedPanel
          tabs={[
            {
              label: Messages.get('label.editProfile'),
            },
          ]}
        >
          <TabbedPanel.TopContainer>
            <SecondaryTitle>
              {Messages.get('label.userData')}
            </SecondaryTitle>
          </TabbedPanel.TopContainer>
          <TabbedPanel.MainContainer>
            {
              user ? (
                <UserForm
                  user={user}
                  onChange={this.onChangeHandler}
                  errors={errors}
                  passwordLink={this.getPasswordLink()}
                  showPasswordFields={showPasswordFields}
                  isUserProfile={this.isUserProfile()}
                />
              ) : <LoadingGauge />
            }
          </TabbedPanel.MainContainer>
        </TabbedPanel>
      </AppContainer.MainContent>
    );
  }

  render() {
    return (
      <AppContainer.Content>
        {this.renderTopContent()}
        {this.renderMainContent()}
      </AppContainer.Content>
    );
  }
}


EditUser.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
  roles: PropTypes.shape({}).isRequired,
};

EditUser.propTypes = {
  location: PropTypes.shape({}).isRequired,
  params: PropTypes.shape({
    userId: PropTypes.string,
  }),
};

EditUser.defaultProps = {
  params: null,
};


export default EditUser;
