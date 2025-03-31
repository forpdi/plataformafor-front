import React from 'react';
import PropTypes from 'prop-types';

import Modal from 'forpdi/src/components/modals/Modal';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import SecondaryButton from 'forpdi/src/components/buttons/SecondaryButton';
import Pagination from 'forpdi/src/components/Pagination';
import SearchBox from 'forpdi/src/components/inputs/SearchBox';
import Text from 'forpdi/src/components/typography/Text';

import Messages from 'forpdi/src/Messages';

const buttonsStyle = { minWidth: '130px', paddingRight: 0, paddingLeft: 0 };
const headerStyle = {
  display: 'flex',
  flexDirection: 'column',
  padding: '30px 0px 0px',
  marginLeft: '20px',
};
const selectedLinksStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  padding: '15px 15px 0',
};

const SelectLinksBaseModal = ({
  children,
  heading,
  label,
  page,
  pageSize,
  total,
  numOfCheckedValues,
  maxChecks,
  searchTerm,
  onPageChange,
  onSearch,
  onSearchTermChange,
  onSubmit,
  closeModalOnSubmit,
}, { theme }) => {
  function renderHeader() {
    return (
      <div className="modal-header" style={headerStyle}>
        <SecondaryTitle style={{ textTransform: 'none', fontWeight: '500', marginLeft: '5px' }}>
          {heading}
        </SecondaryTitle>
      </div>
    );
  }

  function renderButtons() {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'right',
        alignItems: 'center',
        paddingBottom: '20px',
      }}
      >
        <SecondaryButton
          title={Messages.get('label.cancel')}
          text={Messages.get('label.cancel')}
          onClick={() => Modal.hide()}
          style={{ marginRight: '15px', ...buttonsStyle }}
          hoverClass={`${theme}-hover-3-bg`}
          backgroundClassName={`${theme}-primary`}
        />
        <PrimaryButton
          title={Messages.get('label.submitLabel')}
          text={Messages.get('label.submitLabel')}
          onClick={() => {
            onSubmit();
            closeModalOnSubmit && Modal.hide();
          }}
          style={buttonsStyle}
        />
      </div>
    );
  }

  function renderContent() {
    const totalIncluded = maxChecks === null ? '' : `/${maxChecks}`;
    return (
      <div
        style={{ overflowY: 'auto', maxHeight: 'max-content', padding: '0 35px' }}
      >
        <div style={selectedLinksStyle}>
          <Text style={{ fontWeight: 'bolder', fontSize: '14px' }}>{label}</Text>
          <SearchBox
            value={searchTerm}
            placeholder={Messages.get('label.search')}
            onChange={onSearchTermChange}
            onSubmit={onSearch}
          />
        </div>
        <div style={selectedLinksStyle}>
          <Text>Vínculos incluídos</Text>
          <Text>{`${numOfCheckedValues}${totalIncluded} vínculos selecionados`}</Text>
        </div>
        <div
          style={{ overflowY: 'auto', maxHeight: '100%' }}
        >
          {children}
        </div>
        <Pagination
          total={total}
          options={null}
          onChange={onPageChange}
          page={page}
          pageSize={pageSize}
        />
        {renderButtons()}
      </div>
    );
  }

  return (
    <Modal width="800px" height="max-content">
      {renderHeader()}
      <Modal.Line />
      {renderContent()}
    </Modal>
  );
};

SelectLinksBaseModal.propTypes = {
  children: PropTypes.node.isRequired,
  heading: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  page: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  total: PropTypes.number,
  maxChecks: PropTypes.number,
  numOfCheckedValues: PropTypes.number.isRequired,
  searchTerm: PropTypes.string.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  onSearchTermChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  closeModalOnSubmit: PropTypes.bool,
};

SelectLinksBaseModal.defaultProps = {
  closeModalOnSubmit: true,
  total: null,
  maxChecks: null,
};

SelectLinksBaseModal.contextTypes = {
  theme: PropTypes.string,
};

export default SelectLinksBaseModal;
