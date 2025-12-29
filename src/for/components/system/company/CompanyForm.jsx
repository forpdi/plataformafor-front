import React from 'react';
import PropTypes from 'prop-types';

import TextField from 'forpdi/src/components/inputs/TextField';
import TextArea from 'forpdi/src/components/inputs/TextArea';
import CheckBox from 'forpdi/src/components/inputs/CheckBox';
import AppContainer from 'forpdi/src/components/AppContainer';
import Messages from 'forpdi/src/Messages';
import InputContainer from 'forpdi/src/components/inputs/InputContainer';
import SelectBox from 'forpdi/src/components/inputs/SelectBox';
import CompanyType from 'forpdi/src/forpdi/planning/enum/CompanyType';

import LocationStore from 'forpdi/src/forpdi/core/store/Location';

class CompanyForm extends React.Component {
  constructor(props) {
    super(props);
    const { county } = props.company;
    this.state = {
      ufs: [],
      selectedUfId: county ? county.uf.id : undefined,
      counties: [],
    };
  }

  componentDidMount() {
    const { selectedUfId } = this.state;

    LocationStore.on('ufs-listed', ({ data }) => {
      this.setState({ ufs: data.list });
    },
    this);

    LocationStore.on('counties-listed', ({ data }) => {
      this.setState({ counties: data.list });
    },
    this);

    LocationStore.dispatch({
      action: LocationStore.ACTION_LIST_UFS,
    });

    if (selectedUfId) {
      this.listCounties(selectedUfId);
    }
  }

  componentWillUnmount() {
    LocationStore.off(null, null, this);
  }

  onChangeHandler = (e) => {
    const { onChange, company } = this.props;
    const { name, value } = e.target;

    onChange({
      ...company,
      [name]: value,
    });
  }

  onChangeCheckbox = (e) => {
    const { onChange, company } = this.props;
    const { name, checked } = e.target;

    onChange({
      ...company,
      [name]: checked,
    });
  }

  onChangeUf = (e) => {
    const { value } = e.target;
    const { onChange, company } = this.props;
    onChange({
      ...company,
      countyId: undefined,
    });

    const ufId = parseInt(value, 10);
    this.setState({
      selectedUfId: ufId,
    });

    this.listCounties(ufId);
  }

  listCounties(ufId) {
    LocationStore.dispatch({
      action: LocationStore.ACTION_LIST_COUNTIES,
      data: ufId,
    });
  }

  renderCheckboxes() {
    const { company } = this.props;
    const {
      showDashboard,
      showMaturity,
      showBudgetElement,
      enableForrisco,
    } = company;

    return (
      <div style={{ marginTop: '50px' }}>
        <CheckBox
          name="showDashboard"
          key="showDashboard"
          checked={showDashboard}
          onChange={e => this.onChangeCheckbox(e)}
          label={Messages.get('label.enableCommunityDashboard').toUpperCase()}
        />
        <CheckBox
          name="showMaturity"
          key="showMaturity"
          checked={showMaturity}
          onChange={e => this.onChangeCheckbox(e)}
          label={Messages.get('label.showMaturityDateToCommunity').toUpperCase()}
        />
        <CheckBox
          name="showBudgetElement"
          key="showBudgetElement"
          checked={showBudgetElement}
          onChange={e => this.onChangeCheckbox(e)}
          label={Messages.get('label.showBudgetElement').toUpperCase()}
        />
        <CheckBox
          name="enableForrisco"
          key="enableForrisco"
          checked={enableForrisco}
          onChange={e => this.onChangeCheckbox(e)}
          label={Messages.get('label.enableForrisco').toUpperCase()}
        />
      </div>
    );
  }

  renderFormFields() {
    const { company, errors } = this.props;
    const {
      name,
      initials,
      description,
      type,
      countyId,
    } = company;
    const { ufs, selectedUfId, counties } = this.state;

    return (
      <div>
        <TextField
          id="name"
          name="name"
          label={Messages.get('label.name')}
          onChange={this.onChangeHandler}
          value={name}
          errorMsg={errors.name}
          maxLength={255}
          required
        />
        <TextField
          id="initials"
          name="initials"
          label={Messages.get('label.abbreviation')}
          onChange={this.onChangeHandler}
          value={initials}
          errorMsg={errors.initials}
          maxLength={255}
          required
        />
        <InputContainer className="row">
          <div className="col col-sm-6">
            <SelectBox
              options={CompanyType.list}
              label={(
                <span>
                  {Messages.get('label.companyType')}
                </span>
              )}
              value={type}
              name="type"
              id="type"
              onChange={this.onChangeHandler}
              showChooseOption
            />
          </div>
        </InputContainer>
        <InputContainer className="row">
          <div className="col col-sm-6">
            <SelectBox
              options={ufs}
              label={(
                <span>
                  {Messages.get('label.state')}
                </span>
              )}
              value={selectedUfId}
              errorMsg={!selectedUfId ? errors.uf : null}
              name="uf"
              id="uf"
              onChange={this.onChangeUf}
              showChooseOption
              required
            />
          </div>
          <div className="col col-sm-6">
            <SelectBox
              options={counties}
              label={(
                <span>
                  {Messages.get('label.city')}
                </span>
              )}
              value={countyId}
              name="countyId"
              id="countyId"
              errorMsg={errors.countyId}
              onChange={this.onChangeHandler}
              showChooseOption
              required
            />
          </div>
        </InputContainer>
        <TextArea
          id="description"
          name="description"
          label={Messages.get('label.description')}
          onChange={this.onChangeHandler}
          value={description}
          maxLength={10000}
        />
      </div>
    );
  }

  render() {
    return (
      <AppContainer.Content>
        { this.renderFormFields() }
        { this.renderCheckboxes() }
      </AppContainer.Content>
    );
  }
}

CompanyForm.propTypes = {
  onChange: PropTypes.func.isRequired,
  company: PropTypes.shape({}).isRequired,
  errors: PropTypes.shape({}),
};

CompanyForm.defaultProps = {
  errors: {},
};

export default CompanyForm;
