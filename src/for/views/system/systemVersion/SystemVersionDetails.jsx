import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

import Text from 'forpdi/src/components/typography/Text';
import AppContainer from 'forpdi/src/components/AppContainer';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import PageHeader from 'forpdi/src/components/PageHeader';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import IconButton from 'forpdi/src/components/buttons/IconButton';
import VersionStore from 'forpdi/src/forpdi/core/store/Version';
import InfoDisplayHtml from 'forpdi/src/components/info/InfoDisplayHtml';
import SystemInfo from 'forpdi/src/components/SystemInfo';

import { splitDateTime, getYearFromDate } from 'forpdi/src/utils/dateUtil';
import Messages from 'forpdi/src/Messages';

class SystemVersionDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      historicVersions: null,
    };
  }

  componentDidMount() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    this.setState({ currentYear: year });

    VersionStore.on('versionsListed', ({ data }) => {
      this.setState({ historicVersions: data });
    }, this);

    VersionStore.dispatch({
      action: VersionStore.ACTION_LIST_VERSIONS,
    });
  }

  componentWillUnmount() {
    VersionStore.off(null, null, this);
  }

  onClick = (version) => {
    const { router } = this.context;
    const { id: versionId } = version;
    router.push(`/system/version/edit/${versionId}`);
  };

  goBack = () => {
    const { router } = this.context;
    router.goBack();
  };

  renderAppVersionInfo(appVersion, className, message) {
    return (
      appVersion && (
        <div>
          <Text
            style={{ marginTop: '30px' }}
            fontSize="20px"
          >
            <b className={`${className}-primary-color`}>
              {message}
            </b>
          </Text>
          <InfoDisplayHtml htmlInfo={appVersion} />
        </div>
      )
    );
  }

  renderInfoText() {
    return (
      <SystemInfo iconAlign="flex-start">
        <Text>
          <b>Contribuição para Melhorias na Plataforma. </b>
          Para continuarmos evoluindo a plataforma e garantir a melhor experiência de uso,
          contamos com a sua colaboração!
          {' '}
          <Link to="/system/version/info"> Clique Aqui </Link>
          {' '}
          e veja como garantir que sua demanda seja atendida com maior rapidez.
        </Text>
        <Text style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            Nos enviem as oportunidades de melhoria observadas por meio dos canais de
            atendimento abaixo:
          <b> E-mail: </b>
            atendimento@rnp.br |
          <b> Telefone/whatsapp: </b>
            0800 772-0216
        </Text>
      </SystemInfo>
    );
  }

  renderVersionInfo(version) {
    const {
      numberVersion, releaseDate, infoFor, infoPdi, infoRisco,
    } = version;
    const { roles } = this.context;
    const { date } = splitDateTime(releaseDate);
    const { currentYear } = this.state;
    return (
      <div style={{ marginBottom: '50px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text fontSize="20px">
            <b>{`Versão ${numberVersion}`}</b>
          </Text>
          {roles.SYSADMIN
          && getYearFromDate(date) === currentYear && (
            <IconButton
              icon="pen"
              title={Messages.get('label.edit')}
              onClick={() => this.onClick(version)}
            />
          )}
        </div>
        <Text className="for-date-picker-start" style={{ marginTop: '20px' }}>
          <b style={{ marginLeft: '30px' }}>{date}</b>
        </Text>
        {this.renderAppVersionInfo(infoFor, 'for', Messages.get('label.forPlataformaForLogo'))}
        {this.renderAppVersionInfo(infoPdi, 'fpdi', Messages.get('label.forPdiBrand'))}
        {this.renderAppVersionInfo(infoRisco, 'frisco', Messages.get('label.forRiscoBrand'))}
      </div>
    );
  }

  renderTopContent = () => {
    const { router, roles } = this.context;
    return (
      <AppContainer.TopContent>
        <PageHeader pageTitle={Messages.get('label.versionHistory')} goBack={this.goBack} />
        {roles.SYSADMIN && (
          <PrimaryButton
            text={Messages.get('label.addVersion')}
            title={Messages.get('label.addVersion')}
            onClick={() => router.push('/system/version/new')}
          />
        ) }
      </AppContainer.TopContent>
    );
  };

  renderMainContent = () => {
    const { historicVersions, currentYear } = this.state;
    return (
      <AppContainer.MainContent>
        <AppContainer.Section>
          {this.renderInfoText()}
        </AppContainer.Section>
        <TabbedPanel tabs={[{ label: currentYear ? currentYear.toString() : Messages.get('label.versionPdiRisco') }]}>
          <TabbedPanel.TopContainer>
            <SecondaryTitle>{Messages.get('label.versionPdiRisco')}</SecondaryTitle>
          </TabbedPanel.TopContainer>
          <TabbedPanel.MainContainer>
            {
              historicVersions && historicVersions.map(version => (
                <div key={version.id}>
                  {this.renderVersionInfo(version)}
                </div>
              ))
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
        <AppContainer.ScrollableContent>
          {this.renderMainContent()}
        </AppContainer.ScrollableContent>
      </AppContainer.Content>
    );
  }
}

SystemVersionDetails.contextTypes = {
  roles: PropTypes.shape({}).isRequired,
  router: PropTypes.shape({}).isRequired,
};

SystemVersionDetails.propTypes = {
  params: PropTypes.shape({}),
};

SystemVersionDetails.defaultProps = {
  params: {},
};

export default SystemVersionDetails;
