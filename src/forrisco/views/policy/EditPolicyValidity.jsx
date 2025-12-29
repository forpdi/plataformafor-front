import React from 'react';
import PropTypes from 'prop-types';

import FormPageTop from 'forpdi/src/components/FormPageTop';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import AppContainer from 'forpdi/src/components/AppContainer';
import DatePicker from 'forpdi/src/components/inputs/DatePicker';
import InputContainer from 'forpdi/src/components/inputs/InputContainer';
import Label from 'forpdi/src/components/typography/Label';
import Text from 'forpdi/src/components/typography/Text';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';

import PolicyStore from 'forpdi/src/forrisco/stores/Policy';
import Messages from 'forpdi/src/Messages';
import { splitDateTime } from 'forpdi/src/utils/dateUtil';

class EditPolicyValidity extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      policy: null,
      validityEnd: '',
      validityBegin: '',
      waitingSubmit: false,
      error: '',
    };
  }

  componentDidMount() {
    const { params } = this.props;
    const { policyId } = params;
    const { router, toastr } = this.context;

    PolicyStore.on('findpolicy', ({ data }) => {
      if (!data) return;
      const { date: beginDate } = splitDateTime(data.validityBegin);
      const { date: endDate } = splitDateTime(data.validityEnd);
      this.setState({
        policy: data,
        validityBegin: beginDate,
        validityEnd: endDate,
      });
    }, this);

    PolicyStore.on('policyValidityUpdated', ({ data }) => {
      this.setState({ waitingSubmit: false, error: '' });
      toastr.addAlertSuccess(Messages.get('label.notification.policy.edit'));
      router.push(`/forrisco/policy/${data.id}/info`);
    }, this);

    PolicyStore.on('fail', (msg) => {
      this.setState({ waitingSubmit: false, error: msg || 'Erro ao salvar.' });
    }, this);

    PolicyStore.dispatch({
      action: PolicyStore.ACTION_FIND_POLICY,
      data: policyId,
    });
  }

  componentWillUnmount() {
    PolicyStore.off(null, null, this);
  }

  onDateChange = (value) => {
    this.setState({ validityEnd: value, error: '' });
  };

  onSubmit = () => {
    const { policy, validityEnd } = this.state;
    if (!validityEnd) {
      this.setState({ error: 'Informe a nova data fim.' });
      return;
    }

    this.setState({ waitingSubmit: true });
    PolicyStore.dispatch({
      action: PolicyStore.ACTION_UPDATE_VALIDITY_END,
      data: { id: policy.id, validityEnd },
    });
  };

  renderTopContent() {
    const { waitingSubmit } = this.state;
    return (
      <FormPageTop
        label="Alterar vigência da política"
        onSubmit={this.onSubmit}
        waitingSubmit={waitingSubmit}
        message={Messages.get('label.msg.cancelChange')}
      />
    );
  }

  renderMainContent() {
    const {
      policy, validityBegin, validityEnd, error,
    } = this.state;

    return (
      <AppContainer.MainContent>
        <TabbedPanel
          tabs={[{ label: Messages.get('label.generalInfo') }]}
          topContainerContent={{ title: Messages.get('label.generalInfo') }}
        >
          <TabbedPanel.MainContainer>
            {policy ? (
              <div style={{ maxWidth: '520px' }}>
                <InputContainer>
                  <Label className="label-vertical">Início da vigência</Label>
                  <Text>{validityBegin || '-'}</Text>
                </InputContainer>
                <DatePicker
                  id="policy-validity-end-edit"
                  name="validityEnd"
                  label="Nova data fim"
                  value={validityEnd}
                  onChange={this.onDateChange}
                  required
                  errorMsg={error}
                />
              </div>
            ) : <LoadingGauge />}
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

EditPolicyValidity.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

EditPolicyValidity.propTypes = {
  params: PropTypes.shape({
    policyId: PropTypes.string.isRequired,
  }).isRequired,
};

export default EditPolicyValidity;
