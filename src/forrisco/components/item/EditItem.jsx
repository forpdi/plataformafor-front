import React from 'react';
import PropTypes from 'prop-types';

import FormPageTop from 'forpdi/src/components/FormPageTop';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import ItemForm from 'forpdi/src/forrisco/components/item/ItemForm';
import AppContainer from 'forpdi/src/components/AppContainer';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';
import { parseToBoolean } from 'forpdi/src/forrisco/helpers/itemHelper';
import Modal from 'forpdi/src/components/modals/Modal';

import Messages from 'forpdi/src/Messages';
import validationItem from 'forpdi/src/forrisco/validations/validationItem';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';

class EditItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      errors: {},
      waitingSubmit: false,
    };
  }

  onSubmit = () => {
    const {
      item,
      onSubmit,
    } = this.props;
    const onSuccess = () => {
      const updatedItem = {
        ...item,
        fields: parseToBoolean(item.itemFields),
      };
      onSubmit(updatedItem);
    };

    validationItem(item, onSuccess, this);
  }

  onHandleRenderCancelModal = () => {
    const { router } = this.context;
    const confirmModal = (
      <ConfirmModal
        text={Messages.get('label.msg.cancelChange')}
        onConfirm={() => router.goBack()}
      />
    );
    Modal.show(confirmModal);
  }

  renderTopContent() {
    const { waitingSubmit } = this.state;

    return (
      <FormPageTop
        label={Messages.get('label.editItem')}
        onSubmit={this.onSubmit}
        waitingSubmit={waitingSubmit}
        message={Messages.get('label.msg.cancelChange')}
      />
    );
  }

  renderMainContent() {
    const { errors, waitingSubmit } = this.state;
    const { item, onChange } = this.props;

    return (
      <AppContainer.MainContent>
        <TabbedPanel
          tabs={[{ label: Messages.get('label.generalInfo') }]}
          topContainerContent={{ title: item.name }}
        >
          <TabbedPanel.MainContainer>
            <ItemForm
              item={item}
              onChange={onChange}
              errors={errors}
              waitingSubmit={waitingSubmit}
              maxTexFieldLength={6500}
            />
          </TabbedPanel.MainContainer>
        </TabbedPanel>
      </AppContainer.MainContent>
    );
  }

  render() {
    const { item } = this.props;

    if (!item) {
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

EditItem.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

EditItem.propTypes = {
  item: PropTypes.shape({}).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  params: PropTypes.shape({}),
};

EditItem.defaultProps = {
  params: {},
};

export default EditItem;
