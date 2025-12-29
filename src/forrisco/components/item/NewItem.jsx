import React from 'react';
import PropTypes from 'prop-types';

import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import AppContainer from 'forpdi/src/components/AppContainer';
import FormPageTop from 'forpdi/src/components/FormPageTop';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';
import Modal from 'forpdi/src/components/modals/Modal';
import ItemForm from 'forpdi/src/forrisco/components/item/ItemForm';
import validationItem from 'forpdi/src/forrisco/validations/validationItem';
import { parseToBoolean } from 'forpdi/src/forrisco/helpers/itemHelper';

import Messages from 'forpdi/src/Messages';

class NewItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: {
        name: '',
        itemFields: [],
      },
      errors: {},
      waitingSubmit: false,
    };
  }

  onChangeHandler = (item) => {
    this.setState({
      item,
    });
  }

  onSubmit = () => {
    const { item } = this.state;
    const onSuccess = () => (
      this.isSubitem() ? this.newSubItem() : this.newItem()
    );

    validationItem(item, onSuccess, this);
  }

  isSubitem() {
    const { params } = this.props;
    const { itemId: parentItemId } = params;

    return !!parentItemId;
  }

  newItem = () => {
    const { onSubmitNewItem } = this.props;
    const { item } = this.state;
    const { name: itemName, itemFields } = item;

    const newItem = {
      name: itemName,
      fields: parseToBoolean(itemFields),
    };

    onSubmitNewItem(newItem);
  }

  newSubItem = () => {
    const { onSubmitNewSubitem, params } = this.props;
    const { item } = this.state;
    const { name: itemName, itemFields } = item;
    const { itemId } = params;

    const newItem = {
      name: itemName,
      item: { id: itemId },
      fields: parseToBoolean(itemFields),
    };

    onSubmitNewSubitem(newItem);
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
        label={
          this.isSubitem()
            ? Messages.get('label.newSubitem')
            : Messages.get('label.newItem')
        }
        onSubmit={this.onSubmit}
        waitingSubmit={waitingSubmit}
        message={Messages.get('label.msg.cancelChange')}
      />
    );
  }

  renderMainContent() {
    const { item, errors, waitingSubmit } = this.state;

    return (
      <AppContainer.MainContent>
        <TabbedPanel
          tabs={[{ label: Messages.get('label.items') }]}
          topContainerContent={{
            title: this.isSubitem()
              ? Messages.get('label.newSubitem')
              : Messages.get('label.newItem'),
          }}
        >
          <TabbedPanel.MainContainer>
            <ItemForm
              item={item}
              onChange={this.onChangeHandler}
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
    return (
      <AppContainer.Content>
        {this.renderTopContent()}
        {this.renderMainContent()}
      </AppContainer.Content>
    );
  }
}

NewItem.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

NewItem.propTypes = {
  params: PropTypes.shape({}).isRequired,
  onSubmitNewItem: PropTypes.func.isRequired,
  onSubmitNewSubitem: PropTypes.func.isRequired,
};

export default NewItem;
