import React from 'react';
import PropTypes from 'prop-types';

import AppContainer from 'forpdi/src/components/AppContainer';
import PageHeader from 'forpdi/src/components/PageHeader';
import InfoDisplay from 'forpdi/src/components/info/InfoDisplay';
import InfoDisplayList from 'forpdi/src/components/info/InfoDisplayList';
import Icon from 'forpdi/src/components/Icon';
import SecondaryIconButton from 'forpdi/src/components/buttons/SecondaryIconButton';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import IconButton from 'forpdi/src/components/buttons/IconButton';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';
import Modal from 'forpdi/src/components/modals/Modal';
import FileUploadModal from 'forpdi/src/components/modals/FileUploadModal';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import Text from 'forpdi/src/components/typography/Text';
import Label from 'forpdi/src/components/typography/Label';
import SecondaryButton from 'forpdi/src/components/buttons/SecondaryButton';
import InputContainer from 'forpdi/src/components/inputs/InputContainer';

import CompanyStore from 'forpdi/src/forpdi/core/store/Company';
import Messages from 'forpdi/src/Messages';
import { getCompanyLogo } from 'forpdi/src/utils/urlUtil';
import companyType from 'forpdi/src/forpdi/planning/enum/CompanyType';
import { concatCompanyLocalization } from 'forpdi/src/utils/stringUtil';

const recommendedLogoSize = '1258x361';

class CompanyInformation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      company: null,
    };
  }

  componentDidMount() {
    const { params } = this.props;
    const { companyId } = params;
    const { toastr } = this.context;

    CompanyStore.on('retrieve', (model) => {
      this.setState({ company: model.attributes });
    }, this);

    CompanyStore.on('remove', () => {
      toastr.addAlertSuccess(Messages.get('notification.institution.delete'));
      this.goBack();
    }, this);

    CompanyStore.on('logo-updated', ({ data }) => {
      if (EnvInfo.company) {
        EnvInfo.company.logoArchive = data.logoArchive;
      }
      toastr.addAlertSuccess(Messages.get('label.logoUpdatedSuccessfully'));
      this.setState({
        company: data,
      });
    }, this);

    CompanyStore.dispatch({
      action: CompanyStore.ACTION_RETRIEVE,
      data: companyId,
    });
  }

  componentWillUnmount() {
    CompanyStore.off(null, null, this);
  }

  onEdit = () => {
    const { router } = this.context;
    const { params } = this.props;
    const { companyId } = params;
    router.push(`/system/companies/edit/${companyId}`);
  }

  goBack = () => {
    const { router, roles } = this.context;
    if (roles.SYSADMIN) {
      router.push('/system/companies');
    } else {
      router.goBack();
    }
  }

  onHandleRenderDeleteModal = () => {
    const { theme } = this.context;

    const confirmModal = (
      <ConfirmModal
        text={Messages.get('label.institutionDeleteConfirmation')}
        onConfirm={() => this.deleteCompany()}
      />
    );
    Modal.show(confirmModal, theme);
  }

  deleteCompany() {
    const { params } = this.props;
    const { companyId } = params;

    CompanyStore.dispatch({
      action: CompanyStore.ACTION_REMOVE_COMPANY,
      data: companyId,
    });
  }

  onUploadLogoButtonClick = () => {
    const { theme } = this.context;

    const confirmModal = (
      <FileUploadModal
        onSuccess={this.updateLogo}
        acceptedFiles="gif,jpg,jpeg,png,svg"
      />
    );
    Modal.show(confirmModal, theme);
  }

  onHandleRenderReturnToDefaultLogoModal = () => {
    const { theme } = this.context;

    const confirmModal = (
      <ConfirmModal
        text={Messages.get('label.confirmReturnLogoToDefault')}
        onConfirm={() => this.updateLogo(null)}
      />
    );
    Modal.show(confirmModal, theme);
  };

  updateLogo = (fileLink) => {
    const { params } = this.props;
    const { companyId } = params;

    CompanyStore.dispatch({
      action: CompanyStore.ACTION_UPDATE_LOGO,
      data: { companyId, fileLink },
    });
  }

  getCheckedOptions() {
    const { company } = this.state;
    const {
      showDashboard,
      showMaturity,
      showBudgetElement,
      enableForrisco,
    } = company;

    const options = [];
    if (showDashboard) {
      options.push(Messages.get('label.enableCommunityDashboard').toUpperCase());
    }
    if (showMaturity) {
      options.push(Messages.get('label.showMaturityDateToCommunity').toUpperCase());
    }
    if (showBudgetElement) {
      options.push(Messages.get('label.showBudgetElement').toUpperCase());
    }
    if (enableForrisco) {
      options.push(Messages.get('label.enableForrisco').toUpperCase());
    }

    return options;
  }

  renderTopContent() {
    const { roles } = this.context;
    const { company } = this.state;

    const { name } = company;

    return (
      <AppContainer.TopContent>
        <PageHeader pageTitle={name} goBack={this.goBack} />
        <AppContainer.Column>
          <span style={{
            display: 'flex',
            gap: '10px',
            marginRight: '10px',
          }}
          >
            {
              roles.SYSADMIN && (
                <SecondaryIconButton
                  title={Messages.get('label.deletePlan')}
                  icon="trash"
                  onClick={this.onHandleRenderDeleteModal}
                />
              )
            }
          </span>
        </AppContainer.Column>
      </AppContainer.TopContent>
    );
  }

  renderMainContent() {
    const { roles } = this.context;
    const { company } = this.state;

    const {
      name,
      initials,
      description,
      logoArchive,
      type,
    } = company;

    const typeName = type ? companyType[type].name : Messages.get('label.uninformed');
    return (
      <AppContainer.MainContent>
        <TabbedPanel tabs={[{ label: Messages.get('label.institution') }]}>
          <TabbedPanel.TopContainer>
            <SecondaryTitle>{Messages.get('label.institution')}</SecondaryTitle>
            {
              roles.SYSADMIN && (
                <IconButton
                  icon="pen"
                  title={Messages.get('label.editUnit')}
                  onClick={this.onEdit}
                />
              )
            }
          </TabbedPanel.TopContainer>
          <TabbedPanel.MainContainer>
            <InfoDisplay label={Messages.get('label.name')} info={name} />
            <InfoDisplay label={Messages.get('label.abbreviation')} info={initials} />
            <InputContainer className="row">
              <div className="col-sm-6">
                <InfoDisplay label={Messages.get('label.companyType')} info={typeName} />
              </div>
            </InputContainer>
            <InfoDisplay label={Messages.get('label.description')} info={description} />
            <InfoDisplay label={Messages.get('label.cityState')} info={concatCompanyLocalization(company)} />
            <InfoDisplayList
              infoList={this.getCheckedOptions()}
              renderItem={item => (
                <span>
                  <Text>
                    <Icon icon="check-circle" />
                    {' '}
                    {item}
                  </Text>
                </span>
              )}
            />
            <div style={{ display: 'flex', alignItems: 'stretch' }}>
              <div style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between', maxWidth: '406px',
              }}
              >
                <Label className="label-vertical">
                  {`${Messages.get('label.companyLogo')} `}
                  <span style={{ textTransform: 'initial' }}>
                    <b>{`${Messages.get('label.attention')}! `}</b>
                    {`${Messages.get('label.recommendedSize')} "${recommendedLogoSize}"`}
                  </span>
                </Label>
                <span>
                  <PrimaryButton
                    title={Messages.get('label.logoUpload')}
                    text={Messages.get('label.logoUpload')}
                    onClick={this.onUploadLogoButtonClick}
                    style={{ marginRight: '10px' }}
                  />
                  {
                    logoArchive && (
                      <SecondaryButton
                        text={Messages.get('label.returnToDefault')}
                        onClick={this.onHandleRenderReturnToDefaultLogoModal}
                      />
                    )
                  }
                </span>
              </div>
              {this.renderLogo()}
            </div>
          </TabbedPanel.MainContainer>
        </TabbedPanel>
      </AppContainer.MainContent>
    );
  }

  renderLogo() {
    const { company } = this.state;
    const { logoArchive } = company;
    const style = { height: '100px', marginLeft: '25px' };

    return logoArchive
      ? <img src={getCompanyLogo()} alt="A logo não pôde ser exibida" style={style} />
      : (
        <span
          className="for-border-color-1"
          style={{
            ...style,
            width: '246px',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderRadius: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text>{Messages.get('label.noneLogoUploaded')}</Text>
        </span>
      );
  }

  render() {
    const { company } = this.state;

    if (!company) {
      return <LoadingGauge />;
    }

    return (
      <AppContainer.Content>
        {this.renderTopContent()}
        {this.renderMainContent()}
      </AppContainer.Content>
    );
  }
}

CompanyInformation.contextTypes = {
  roles: PropTypes.shape({}).isRequired,
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
  theme: PropTypes.string.isRequired,
};

CompanyInformation.propTypes = {
  unitData: PropTypes.shape({}),
  params: PropTypes.shape({
    companyId: PropTypes.string.isRequired,
  }).isRequired,
};

CompanyInformation.defaultProps = {
  unitData: null,
};

export default CompanyInformation;
