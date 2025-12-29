import React from 'react';
import PropTypes from 'prop-types';

import TextField from 'forpdi/src/components/inputs/TextField';
import SelectBox from 'forpdi/src/components/inputs/SelectBox';

import Messages from 'forpdi/src/Messages';
import CompanyStore from 'forpdi/src/forpdi/core/store/Company';

class CompanyDomainForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      companies: null,
    };
  }

  componentDidMount() {
    CompanyStore.on('companies-listed', ({ data }) => {
      this.setState({ companies: data });
    }, this);

    CompanyStore.dispatch({
      action: CompanyStore.ACTION_LIST_COMPANIES,
    });
  }

  componentWillUnmount() {
    CompanyStore.off(null, null, this);
  }

  onChangeHandler = (e) => {
    const { onChange, companyDomain } = this.props;
    const { name, value } = e.target;

    onChange({
      ...companyDomain,
      [name]: value,
    });
  }

  renderCompanyOptions() {
    const { companies } = this.state;
    const { companyDomain, errors } = this.props;
    const { companyId } = companyDomain;

    return (
      <div>
        <SelectBox
          label={Messages.get('label.initials')}
          name="companyId"
          onChange={this.onChangeHandler}
          value={companyId}
          errorMsg={errors.companyId}
          options={companies}
          showChooseOption
          optionLabelName="initials"
          required
        />
        <SelectBox
          label={Messages.get('label.institution')}
          name="companyId"
          onChange={this.onChangeHandler}
          value={companyId}
          errorMsg={errors.companyId}
          options={companies}
          showChooseOption
          optionLabelName="name"
          required
        />
      </div>
    );
  }

  render() {
    const { errors, companyDomain } = this.props;
    const { host, baseUrl } = companyDomain;
    return (
      <div>
        <TextField
          id="host"
          name="host"
          label={Messages.get('label.host')}
          onChange={this.onChangeHandler}
          value={host}
          errorMsg={errors.host}
          maxLength={128}
          required
        />
        <TextField
          id="baseUrl"
          name="baseUrl"
          label={Messages.get('label.baseUrl')}
          onChange={this.onChangeHandler}
          value={baseUrl}
          errorMsg={errors.baseUrl}
          maxLength={255}
          required
        />
        {this.renderCompanyOptions()}
      </div>
    );
  }
}

CompanyDomainForm.propTypes = {
  companyDomain: PropTypes.shape({}).isRequired,
  onChange: PropTypes.func.isRequired,
  errors: PropTypes.shape({}),
};

CompanyDomainForm.defaultProps = {
  errors: {},
};

export default CompanyDomainForm;
