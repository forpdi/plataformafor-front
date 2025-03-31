import React from 'react';
import PropTypes from 'prop-types';

import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import IconButton from 'forpdi/src/components/buttons/IconButton';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import InputContainer from 'forpdi/src/components/inputs/InputContainer';
import InfoDisplay from 'forpdi/src/components/info/InfoDisplay';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import InfoDisplayLink from 'forpdi/src/components/info/InfoDisplayLink';
import SendMessageModal from 'forpdi/src/components/modals/userMessage/SendMessageModal';
import Modal from 'forpdi/src/components/modals/Modal';

import Messages from 'forpdi/src/Messages';
import accessLevels from 'forpdi/src/forpdi/core/store/AccessLevels';
import UserStore from 'forpdi/src/forpdi/core/store/User';
import { formatPhone } from 'forpdi/src/utils/util';

class UserInformation extends React.Component {
  constructor(props) {
    super(props);

    this.state = { user: null };
  }

  componentDidMount() {
    UserStore.on(
      'find-user',
      ({ data }) => {
        this.setState({
          user: data,
        });
      },
      this,
    );
    UserStore.on(
      'retrieve-user-profile',
      ({ data }) => {
        this.setState({
          user: data,
        });
      },
      this,
    );

    if (this.isUserProfile()) {
      this.retrieveUserProfile();
    } else {
      this.retrieveUser();
    }
  }

  retrieveUserProfile() {
    UserStore.dispatch({
      action: UserStore.ACTION_USER_PROFILE,
    });
  }

  retrieveUser() {
    const { params } = this.props;
    const { userId } = params;

    UserStore.dispatch({
      action: UserStore.ACTION_FIND_USER,
      data: userId,
    });
  }

  componentWillUnmount() {
    UserStore.off(null, null, this);
  }

  onEdit = () => {
    const { router } = this.context;
    this.isUserProfile()
      ? router.push(this.getProfileEditPath())
      : router.push(this.getUserEditPath());
  }

  isUserProfile() {
    const { params } = this.props;
    const { userId } = params;

    return !userId;
  }

  renderUpdatePasswordLink() {
    const path = this.isUserProfile()
      ? this.getProfileEditPath()
      : this.getUserEditPath();

    return (
      <InfoDisplayLink
        label={Messages.get('label.password')}
        href={`#${path}?changePassword=true`}
        info={Messages.get('label.changePassword')}
      />
    );
  }

  getProfileEditPath() {
    return '/users/profile/edit';
  }

  getUserEditPath() {
    const { params } = this.props;
    return `/users/details/${params.userId}/edit`;
  }

  renderUserData() {
    const { user } = this.state;
    const { roles } = this.context;

    return (
      <div>
        <InputContainer className="row">
          <div className="col-sm-6">
            <InfoDisplay
              label={Messages.get('label.name')}
              info={user.name}
            />
          </div>
          <div className="col-sm-6">
            <InfoDisplay
              label={Messages.get('label.email')}
              info={user.email}
            />
          </div>
        </InputContainer>

        <InfoDisplay
          label={Messages.get('label.cpf')}
          info={user.cpf}
        />
        <InputContainer className="row">
          <div className="col-sm-6">
            <InfoDisplay
              label={Messages.get('label.cellphone')}
              info={formatPhone(user.cellphone)}
            />
          </div>
          <div className="col-sm-6">
            <InfoDisplay
              label={Messages.get('label.phone')}
              info={formatPhone(user.phone)}
            />
          </div>
        </InputContainer>
        <InputContainer className="row">
          <div className="col-sm-6">
            <InfoDisplay
              label={Messages.get('label.department')}
              info={user.department}
            />
          </div>
          <div className="col-sm-6">
            <InfoDisplay
              label={Messages.get('label.accountType')}
              info={accessLevels.mapped[user.accessLevel]}
            />
          </div>

        </InputContainer>
        {
          (roles.SYSADMIN || this.isUserProfile()) && (
            this.renderUpdatePasswordLink()
          )
        }
      </div>
    );
  }

  onHandleRenderSendMessageModal = () => {
    const { theme, toastr } = this.context;
    const { params } = this.props;
    const sendMessage = (
      <SendMessageModal
        senderId={params.userId}
        toastr={toastr}
      />
    );

    Modal.show(sendMessage, theme);
  }

  render() {
    const { user } = this.state;
    return (
      <div>
        <TabbedPanel.TopContainer>
          <SecondaryTitle>
            {Messages.get('label.userData')}
          </SecondaryTitle>
          <div>
            {!this.isUserProfile() && (
              <IconButton
                icon="comment"
                title={Messages.get('label.sendMessages')}
                onClick={this.onHandleRenderSendMessageModal}
                style={{ marginRight: 20 }}
              />
            )}
            <IconButton
              icon="pen"
              title={Messages.get('label.editProfile')}
              onClick={this.onEdit}
            />
          </div>
        </TabbedPanel.TopContainer>
        <TabbedPanel.MainContainer>
          {
            user
              ? this.renderUserData()
              : <LoadingGauge />
          }
        </TabbedPanel.MainContainer>
      </div>
    );
  }
}

UserInformation.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
  theme: PropTypes.string,
  roles: PropTypes.shape({}).isRequired,
};

UserInformation.propTypes = {
  params: PropTypes.shape({
    userId: PropTypes.string,
  }),
};

UserInformation.defaultProps = {
  params: null,
};

export default UserInformation;
