import React from 'react';
import PropTypes from 'prop-types';

import Modal from 'forpdi/src/components/modals/Modal';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import Table from 'forpdi/src/components/Table';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import ExpandableText from 'forpdi/src/components/ExpandableText';

import Messages from 'forpdi/src/Messages';
import GoalJustificationHistoryStore from 'forpdi/src/forpdi/planning/store/GoalJustificationHistory';
import { splitDateTime } from 'forpdi/src/utils/dateUtil';

const textColor = '#575858';

class GoalsJustificationHistoryModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      history: null,
    };
  }

  componentDidMount() {
    const { levelInstanceId } = this.props;

    GoalJustificationHistoryStore.on('goalsJustificationHistoryListed', ({ data }) => {
      this.setState({ history: data.list });
    }, this);

    GoalJustificationHistoryStore.dispatch({
      data: levelInstanceId,
      action: GoalJustificationHistoryStore.ACTION_LIST_GOALS_JUSTIFICATION_HISTORY,
    });
  }

  renderHeader() {
    return (
      <div>
        <div className="modal-header" style={{ display: 'flex', padding: '10px 30px 0px 0px' }}>
          <SecondaryTitle>
            {Messages.get('label.justificationHistory')}
          </SecondaryTitle>
        </div>
        <hr style={{ border: '0.15px solid rgba(101,97, 98, 0.1)', margin: '10px 0px' }} />
      </div>
    );
  }

  renderTable() {
    const { history } = this.state;

    const renderResponsible = (data) => {
      const { user } = data;
      return <span style={{ color: textColor }}>{user.name}</span>;
    };

    const renderJustification = ({ justification }) => {
      return <ExpandableText text={justification} textStyle={{ color: textColor }} />;
   };

    const renderDate = ({ updatedAt }) => {
      const { date } = splitDateTime(updatedAt);
      return <span style={{ color: textColor }}>{date}</span>;
    };
    
    function formatNumber(num) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num).replace('R$', '').trim();
    };

    const renderReached = ({ reachedValue }) => {
      if (reachedValue === null || reachedValue === undefined) {
        return <span style={{ color: textColor }}></span>;  
      }
    
      const formattedValue = formatNumber(reachedValue);
      return <span style={{ color: textColor }}>{formattedValue}</span>;
    };

    const columns = [
      {
        name: Messages.get('label.justification'),
        render: renderJustification,
        width: '50%',
      },
      {
        name: Messages.get('label.responsibleForChange'),
        render: renderResponsible,
        width: '10%',
      },
      {
        name: Messages.get('label.reached'),
        render: renderReached,
        width: '20%',
      },
      {
        name: Messages.get('label.dateOfChange'),
        render: renderDate,
        width: '20%',
      },
    ];

    return (
      <Table
        data={history}
        columns={columns}
        messageToEmptyData={Messages.get('label.noChangeInJustification')}
      />
    );
  }


  render() {
    const { history } = this.state;

    return (
      <Modal width="900px" height="auto">
        {this.renderHeader()}
        <div className="custom-scrollbar" style={{ maxHeight: '700px', overflow: 'auto' }}>
          {history ? this.renderTable() : <LoadingGauge />}
        </div>
      </Modal>
    );
  }
}

GoalsJustificationHistoryModal.propTypes = {
  levelInstanceId: PropTypes.number.isRequired,
};

export default GoalsJustificationHistoryModal;
