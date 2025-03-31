import React from 'react';
import PropTypes from 'prop-types';

import Table from 'forpdi/src/components/Table';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';

import Messages from 'forpdi/src/Messages';
import { parseDate } from 'forpdi/src/utils/dateUtil';
import StructureStore from "forpdi/src/forpdi/planning/store/Structure";

class FpdiReportTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      loading: false,
    };
  }

  componentDidMount() {
    StructureStore.on('infotableretrivied', this.handleDataReceived);
    if (this.shouldFetchData(this.props)) {
      this.fetchData();
    }
  }

  componentWillUnmount() {
    StructureStore.off('infotableretrivied', this.handleDataReceived);
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.selectedPlanId !== this.props.selectedPlanId ||
      prevProps.selectedSubplanId !== this.props.selectedSubplanId ||
      prevProps.selectedStrategicAxisId !== this.props.selectedStrategicAxisId ||
      prevProps.selectedObjectivesId !== this.props.selectedObjectivesId ||
      prevProps.selectedIndicatorId !== this.props.selectedIndicatorId ||
      prevProps.selectedGoalId !== this.props.selectedGoalId ||
      prevProps.startDate !== this.props.startDate ||
      prevProps.endDate !== this.props.endDate ||
      prevProps.selectedGoalStatus !== this.props.selectedGoalStatus ||
      prevProps.selectedGoalProgressStatus != this.props.selectedGoalProgressStatus ||
      prevProps.page !== this.props.page ||
      prevProps.pageSize !== this.props.pageSize
    ) {
      if (this.shouldFetchData(this.props)) {
        this.fetchData();
      } else {
        this.setState({ data: [], loading: false });
        if (this.props.updateTotalItems) {
          this.props.updateTotalItems(0);
        }
      }
    }
  }  

  shouldFetchData(props) {
    const { selectedPlanId } = props;
    return selectedPlanId != null;
  }

  fetchData() {
    const {
      selectedPlanId,
      selectedSubplanId,
      selectedStrategicAxisId,
      selectedObjectivesId,
      selectedIndicatorId,
      selectedGoalId,
      startDate,
      endDate,
      selectedGoalStatus,
      selectedGoalProgressStatus,
      page,
      pageSize,
    } = this.props;

    this.setState({ loading: true });

    let levelInstance = null;

    if (selectedIndicatorId && selectedIndicatorId !== -1) {
      levelInstance = selectedIndicatorId;
    } else if (selectedObjectivesId && selectedObjectivesId !== -1) {
      levelInstance = selectedObjectivesId;
    } else if (selectedStrategicAxisId && selectedStrategicAxisId !== -1) {
      levelInstance = selectedStrategicAxisId;
    }

    const data = {
      macro: selectedPlanId || null,
      plan: selectedSubplanId || null,
      levelInstance: levelInstance || null,
      goalId: selectedGoalId !== -1 ? selectedGoalId : null,
      startDate: startDate || null,
      endDate: endDate || null,        
      goalStatus: selectedGoalStatus !== -1 ? selectedGoalStatus : null,
      progressStatus: selectedGoalProgressStatus > -1 ? selectedGoalProgressStatus: null,
      page,
      pageSize,
    };
    StructureStore.dispatch({
      action: StructureStore.ACTION_GET_INFO_TABLE,
      data,
    });
  }

  handleDataReceived = (store) => {
    this.setState({
      data: store.data,
      loading: false,
    });
    if (this.props.updateTotalItems) {
      this.props.updateTotalItems(store.total);
    }
  };

  truncateText(text, maxLength) {
    if (!text) return '';
    const strText = String(text);
    if (strText.length <= maxLength) return strText;
    return `${strText.slice(0, maxLength)}...`;
  }

  renderTable() {
    const { data } = this.state;
    const { stickyTopHead } = this.props;

    const columns = [
      {
        name: Messages.get('label.goalsPlan'),
        field: 'planName',
        width: '14%',
        render: (item) => this.truncateText(item.planName, 100),
      },
      {
        name: Messages.get('label.thematicAxis'),
        field: 'strategicAxisName',
        width: '14%',
        render: (item) => this.truncateText(item.strategicAxisName, 100),
      },
      {
        name: Messages.get('label.objective'),
        field: 'objectiveName',
        width: '22%',
        render: (item) => this.truncateText(item.objectiveName, 100),
      },
      {
        name: Messages.get('label.indicator'),
        field: 'indicatorName',
        width: '14%',
        render: (item) => this.truncateText(item.indicatorName, 100),
      },
      {
        name: Messages.get('label.goalSing'),
        field: 'goalName',
        width: '14%',
        render: (item) => this.truncateText(item.goalName, 100),
      },
      {
        name: Messages.get('label.maturity'),
        field: 'finishDate',
        width: '10%',
        render: (item) => {
          const date = item.finishDate ? parseDate(item.finishDate) : null;
          return date && !isNaN(date.getTime()) ? date.toLocaleDateString() : '';
        },
      },
      {
        name: Messages.get('label.goals.expected'),
        field: 'expected',
        width: '6%',
        render: (item) => this.truncateText(item.expected, 100),
      },
      {
        name: Messages.get('label.titleReached'),
        field: 'reached',
        width: '6%',
        render: (item) => this.truncateText(item.reached, 100),
      },
    ];

    return (
      <div>
        <Table
          data={data || []}
          columns={columns}
          stickyTopHead={stickyTopHead}
          messageToEmptyData={"Selecione um plano de desenvolvimento para começar."}
          style={{ tableLayout: 'auto', minWidth: '100%' }}
        />
      </div>
    );
  }

  render() {
    const { loading } = this.state;
    return loading ? <LoadingGauge /> : this.renderTable();
  }
}

FpdiReportTable.propTypes = {
  selectedPlanId: PropTypes.number,
  selectedSubplanId: PropTypes.number,
  selectedStrategicAxisId: PropTypes.number,
  selectedObjectivesId: PropTypes.number,
  selectedIndicatorId: PropTypes.number,
  selectedGoalId: PropTypes.number,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  selectedGoalStatus: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  selectedGoalProgressStatus: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  updateTotalItems: PropTypes.func.isRequired,
  stickyTopHead: PropTypes.number.isRequired, 
};

FpdiReportTable.defaultProps = {
  selectedPlanId: null,
  selectedSubplanId: null,
  selectedStrategicAxisId: null,
  selectedObjectivesId: null,
  selectedIndicatorId: null,
  selectedGoalId: null,
  startDate: null,
  endDate: null,
  selectedGoalStatus: -1,
  selectedGoalProgressStatus: -1,
};

export default FpdiReportTable;