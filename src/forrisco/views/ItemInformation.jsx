import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import InfoDisplayHtml from 'forpdi/src/components/info/InfoDisplayHtml';
import InfoDisplayLink from 'forpdi/src/components/info/InfoDisplayLink';
import IconButton from 'forpdi/src/components/buttons/IconButton';

import Messages from 'forpdi/src/Messages';
import FileStore from 'forpdi/src/forpdi/core/store/File';


const ItemInformation = ({
  itemName,
  fields,
  onEdit,
  hasPermission,
}) => {
  function renderFields() {
    return _.map(fields, ({
      id,
      name,
      description,
      isText,
      fileLink,
    }) => {
      if (isText) {
        return (
          <InfoDisplayHtml
            key={id}
            label={name}
            htmlInfo={description}
          />
        );
      }

      return (
        <InfoDisplayLink
          key={id}
          label={name}
          href={`${FileStore.url}/${fileLink}`}
          style={{ wordBreak: 'break-all' }}
          info={description}
        />
      );
    });
  }

  const renderTopContent = () => (
    <TabbedPanel.TopContainer>
      <SecondaryTitle>{itemName}</SecondaryTitle>
      {
        hasPermission && (
          <IconButton
            icon="pen"
            title={Messages.get('label.editUnit')}
            onClick={onEdit}
          />
        )
      }
    </TabbedPanel.TopContainer>
  );


  const renderMainContent = () => (
    <TabbedPanel.MainContainer>
      {renderFields()}
    </TabbedPanel.MainContainer>
  );


  return (
    <div>
      {renderTopContent()}
      {renderMainContent()}
    </div>
  );
};

ItemInformation.propTypes = {
  onEdit: PropTypes.func,
  itemName: PropTypes.string,
  fields: PropTypes.arrayOf(PropTypes.shape({})),
  params: PropTypes.shape({}),
  hasPermission: PropTypes.bool,
};

ItemInformation.defaultProps = {
  onEdit: null,
  fields: [],
  itemName: '',
  params: null,
  hasPermission: null,
};

ItemInformation.contextTypes = {
  router: PropTypes.shape({}).isRequired,
};

export default ItemInformation;
