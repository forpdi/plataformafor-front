import React from 'react';
import PropTypes from 'prop-types';

import TextField from 'forpdi/src/components/inputs/TextField';
import MaskedInput from 'forpdi/src/components/inputs/MaskedInput';
import SelectBox from 'forpdi/src/components/inputs/SelectBox';
import PasswordField from 'forpdi/src/components/inputs/PasswordField';
import InfoDisplayLink from 'forpdi/src/components/info/InfoDisplayLink';

import Messages from 'forpdi/src/Messages';
import accessLevels from 'forpdi/src/forpdi/core/store/AccessLevels';

const UserForm = ({
  user,
  onChange,
  errors,
  showPasswordFields,
  passwordLink,
  isUserProfile,
}, { roles }) => {
  const canEditCpfAndEmail = roles.SYSADMIN || isUserProfile;

  function onChangeHandler(e) {
    const { name, value } = e.target;

    onChange({
      ...user,
      [name]: value,
    });
  }

  function renderPassword() {
    if (showPasswordFields) {
      return (
        <div>
          {
            isUserProfile && (
              <PasswordField
                id="currentPassword"
                name="currentPassword"
                label={Messages.get('label.currentPassword')}
                onChange={onChangeHandler}
                value={user.currentPassword}
                errorMsg={errors.currentPassword}
                required
              />
            )
          }
          <PasswordField
            id="newPassword"
            name="newPassword"
            label={Messages.get('label.newPassword')}
            onChange={onChangeHandler}
            value={user.newPassword}
            errorMsg={errors.newPassword}
            required
          />
          <PasswordField
            id="newPasswordTwo"
            name="newPasswordTwo"
            label={Messages.get('label.newPasswordTwo')}
            onChange={onChangeHandler}
            value={user.newPasswordTwo}
            errorMsg={errors.newPasswordTwo}
            required
          />
        </div>
      );
    }

    if (passwordLink) {
      return (
        <InfoDisplayLink
          label={Messages.get('label.password')}
          href={passwordLink}
          info={Messages.get('label.changePassword')}
        />
      );
    }

    return null;
  }

  return (
    <form>
      <TextField
        id="name"
        name="name"
        label={Messages.get('label.name')}
        onChange={onChangeHandler}
        value={user.name}
        errorMsg={errors.name}
        required
      />
      <TextField
        id="email"
        name="email"
        label={Messages.get('label.email')}
        onChange={onChangeHandler}
        value={user.email}
        errorMsg={errors.email}
        required
        disabled={!canEditCpfAndEmail}
      />
      <MaskedInput
        id="cpf"
        name="cpf"
        label={Messages.get('label.cpf')}
        onChange={onChangeHandler}
        value={user.cpf}
        mask="111.111.111-11"
        errorMsg={errors.cpf}
        required
        disabled={!canEditCpfAndEmail}
      />
      <MaskedInput
        id="cellphone"
        name="cellphone"
        label={Messages.get('label.cellphone')}
        onChange={onChangeHandler}
        value={user.cellphone}
        mask="(11) 11111-1111"
        errorMsg={errors.cellphone}
        required
      />
      <MaskedInput
        id="phone"
        name="phone"
        label={Messages.get('label.phone')}
        onChange={onChangeHandler}
        value={user.phone}
        mask="(11) 11111-1111"
        errorMsg={errors.phone}
      />
      <TextField
        id="department"
        name="department"
        label={Messages.get('label.department')}
        onChange={onChangeHandler}
        value={user.department}
      />
      {
        roles.ADMIN && !isUserProfile && (
          <SelectBox
            options={roles.SYSADMIN ? accessLevels.list : accessLevels.listNoSysAdm}
            label={Messages.get('label.accountType')}
            value={user.accessLevel}
            name="accessLevel"
            id="accessLevel"
            onChange={onChangeHandler}
            optionValueName="accessLevel"
            required
          />
        )
      }
      {renderPassword()}
    </form>
  );
};

UserForm.propTypes = {
  onChange: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    cpf: PropTypes.string,
    cellphone: PropTypes.string,
  }),
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    cpf: PropTypes.string,
    cellphone: PropTypes.string,
    phone: PropTypes.string,
    department: PropTypes.string,
    currentPassword: PropTypes.string,
    newPassword: PropTypes.string,
    newPasswordTwo: PropTypes.string,
  }),
  showPasswordFields: PropTypes.bool,
  passwordLink: PropTypes.string,
  isUserProfile: PropTypes.bool,
};

UserForm.defaultProps = {
  errors: {
    name: null,
    email: null,
    cpf: null,
    cellphone: null,
  },
  user: null,
  showPasswordFields: false,
  passwordLink: null,
  isUserProfile: false,
};

UserForm.contextTypes = {
  roles: PropTypes.shape({}).isRequired,
};

export default UserForm;
