import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import ItemTable from 'forpdi/src/forrisco/components/item/ItemTable';

import Messages from 'forpdi/src/Messages';

class ItemSubItems extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filteredSubItems: null,
      sortedBy: [],
    };
  }

  componentDidMount() {
    const { sortedBy } = this.state;
    const { subitemsData: filteredSubItems } = this.props;

    this.setState({
      filteredSubItems,
      sortedBy,
    });
  }

  sortColumnBy = (newField) => {
    const { sortedBy, filteredSubItems } = this.state;
    const [field, asc] = sortedBy;
    const ord = field !== newField || !asc;
    const newSortedBy = [newField, ord];

    const sortedData = _.sortBy(filteredSubItems, elem => elem.name);

    if (!ord) sortedData.reverse();

    this.setState({
      filteredSubItems: sortedData,
      sortedBy: newSortedBy,
    });
  };

  render() {
    const {
      subitemsData,
      onNew,
      onRedirect,
      onDelete,
      onEdit,
      hasPermission,
    } = this.props;
    const { filteredSubItems, sortedBy } = this.state;

    if (!subitemsData) {
      return <LoadingGauge />;
    }

    return (
      <div>
        <TabbedPanel.TopContainer>
          <SecondaryTitle>{Messages.get('label.subitems')}</SecondaryTitle>
          {
            hasPermission && (
              <PrimaryButton
                text={Messages.get('label.subitemRegister')}
                title={Messages.get('label.subitemRegister')}
                onClick={onNew}
              />
            )
          }
        </TabbedPanel.TopContainer>
        <TabbedPanel.MainContainer>
          <ItemTable
            items={filteredSubItems}
            sortColumnBy={this.sortColumnBy}
            sortedBy={sortedBy}
            onRedirect={onRedirect}
            onDelete={onDelete}
            onEdit={onEdit}
            hasPermission={hasPermission}
          />
        </TabbedPanel.MainContainer>
      </div>
    );
  }
}

ItemSubItems.propTypes = {
  subitemsData: PropTypes.arrayOf(PropTypes.shape({})),
  onNew: PropTypes.func.isRequired,
  onRedirect: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  hasPermission: PropTypes.bool,
};

ItemSubItems.defaultProps = {
  subitemsData: null,
  hasPermission: null,
};

export default ItemSubItems;
