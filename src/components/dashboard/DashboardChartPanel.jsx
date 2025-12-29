import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import SelectBox from 'forpdi/src/components/inputs/SelectBox';
import CheckCircle from 'forpdi/src/components/inputs/CheckCircle';
import MultiSelectWithSelectAll from 'forpdi/src/components/inputs/MultiSelectWithSelectAll';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';

import Messages from 'forpdi/src/Messages';
import DashboardChart from 'forpdi/src/components/dashboard/DashboardChart';

class DashboardChartPanel extends React.Component {
  constructor(props) {
    super(props);

    const {
      units,
      legends,
      years,
      defaultSelectedUnitIds,
      externalSelectedUnitIds,
      externalSelectedYear,
      defaultLegendCheckedIds,
    } = props;

    const firstUnitId = units.length > 0 ? units[0].id : undefined;
    const selectedUnitIds = externalSelectedUnitIds || defaultSelectedUnitIds || [firstUnitId];

    const selectedUnits = _.map(selectedUnitIds, unitId => units.find(unit => unit.id === unitId));

    const legendChecks = this.getInitialLegendChecks(legends, defaultLegendCheckedIds);

    const selectedYear = years.length > 0 ? years[0].id : undefined;

    this.state = {
      selectedUnitIds,
      selectedYear: externalSelectedYear || selectedYear,
      legendChecks,
      chartData: null,
      options: null,
      selectedUnits,
    };
  }

  getInitialLegendChecks(legends, defaultLegendCheckedIds) {
    const legendChecks = {};

    if (!defaultLegendCheckedIds) {
      _.forEach(legends, ({ id }) => {
        legendChecks[`${id}`] = true;
      });
    } else {
      _.forEach(legends, ({ id }) => {
        legendChecks[`${id}`] = false;
      });
      _.forEach(defaultLegendCheckedIds, (id) => {
        legendChecks[`${id}`] = true;
      });
    }

    return legendChecks;
  }

  componentDidMount() {
    this.refreshData();
  }

  componentDidUpdate(previousProps) {
    const {
      externalSelectedUnitIds: previousExternalSelectedUnitIds,
      externalSelectedYear: previousExternalSelectedYear,
    } = previousProps;
    const { externalSelectedUnitIds, externalSelectedYear, shouldRefresh } = this.props;

    const unitsChanged = !_.isEqual(externalSelectedUnitIds, previousExternalSelectedUnitIds);
    const yearChanged = previousExternalSelectedYear !== externalSelectedYear;

    if (unitsChanged || yearChanged || shouldRefresh) {
      this.refreshData();
    }
  }

  onSelectBoxChange = (event) => {
    const { name, value } = event.target;

    this.setState({
      [name]: parseInt(value, 10),
    }, this.refreshData);
  }

  onMultiSelectChange = (selectedUnits) => {
    const selectedUnitIds = _.map(selectedUnits, unit => unit.id);
    this.setState({ selectedUnitIds, selectedUnits }, this.refreshData);
  }

  onCheckboxChange = (event) => {
    const { name } = event.target;

    const { legendChecks } = this.state;
    const keys = _.keys(legendChecks);
    let numOfChecked = 0;
    _.forEach(keys, (key) => {
      numOfChecked += legendChecks[key] ? 1 : 0;
    });
    const valueIsChecked = legendChecks[name];
    if (numOfChecked === 1 && valueIsChecked) {
      return;
    }

    legendChecks[name] = !legendChecks[name];

    this.setState({
      legendChecks,
    }, this.refreshData);
  }

  onChartClick = (Chart) => {
    const { onChartClick } = this.props;
    if (!onChartClick) {
      return;
    }

    const { selectedYear, selectedUnitIds } = this.state;

    const { chart } = Chart;

    const selection = chart.getSelection();

    const { row, column } = selection && selection.length > 0 ? selection[0] : {};
    if (row !== undefined && column !== undefined) {
      onChartClick(row, column, selectedYear, selectedUnitIds);
    }
  }

  refreshData() {
    const { getChartDataAndOptions, externalSelectedUnitIds, externalSelectedYear } = this.props;
    const { selectedYear, selectedUnitIds, legendChecks } = this.state;

    const updatedSelectedYear = externalSelectedYear || selectedYear;
    const updatedSelectedUnitIds = externalSelectedUnitIds || selectedUnitIds;

    const { chartData, options } = getChartDataAndOptions(
      updatedSelectedYear, updatedSelectedUnitIds, legendChecks,
    );

    this.cleanChartData(() => {
      this.setState({
        chartData,
        options,
        selectedUnitIds: updatedSelectedUnitIds,
        selectedYear: updatedSelectedYear,
      });
    });
  }

  cleanChartData(callback) {
    this.setState({ chartData: null }, callback);
  }

  renderSelectBoxes() {
    const { units, years } = this.props;
    const { selectedYear, selectedUnits } = this.state;

    return (
      <div className="row">
        <div className="col col-sm-3">
          <SelectBox
            name="selectedYear"
            options={years}
            label={Messages.get('label.period')}
            value={selectedYear}
            onChange={this.onSelectBoxChange}
          />
        </div>
        <div className="col col-sm-9">
          <MultiSelectWithSelectAll
            label={Messages.get('label.unitys')}
            onChange={this.onMultiSelectChange}
            options={units}
            selectedOptions={selectedUnits}
            placeholderButtonLabel={Messages.get('label.selectOneUnit')}
          />
        </div>
      </div>
    );
  }

  renderChart() {
    const { chartData, options } = this.state;
    const { id } = this.props;

    return (
      <DashboardChart
        id={id}
        chartData={chartData}
        options={options}
        onChartClick={this.onChartClick}
      />
    );
  }

  renderChecks() {
    const { legends } = this.props;
    const { legendChecks } = this.state;

    return (
      <div style={{ display: 'flex', marginTop: '1rem' }}>
        {
          _.map(legends, ({ id, color, label }) => (
            <CheckCircle
              key={id}
              label={label}
              name={`${id}`}
              id={`check-${id}`}
              checked={legendChecks[`${id}`]}
              onClick={this.onCheckboxChange}
              circleColor={color}
              style={{ marginRight: '2rem' }}
            />
          ))
        }
      </div>
    );
  }

  render() {
    const { legends, externalSelectedUnitIds, externalSelectedYear } = this.props;
    const { chartData } = this.state;

    if (!chartData) {
      return <LoadingGauge />;
    }

    return (
      <div>
        {!externalSelectedUnitIds && !externalSelectedYear && this.renderSelectBoxes()}
        {this.renderChart()}
        {legends && this.renderChecks()}
      </div>
    );
  }
}

DashboardChartPanel.propTypes = {
  id: PropTypes.string.isRequired,
  getChartDataAndOptions: PropTypes.func.isRequired,
  units: PropTypes.arrayOf(PropTypes.shape({})),
  years: PropTypes.arrayOf(PropTypes.shape({})),
  legends: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]).isRequired,
    color: PropTypes.string,
    label: PropTypes.string.isRequired,
  })),
  defaultSelectedUnitIds: PropTypes.arrayOf(PropTypes.number),
  defaultLegendCheckedIds: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.arrayOf(PropTypes.number),
  ]),
  onChartClick: PropTypes.func,
  // Controle do estado dos filtros feito por componente pai
  externalSelectedUnitIds: PropTypes.arrayOf(PropTypes.number),
  externalSelectedYear: PropTypes.number,
  shouldRefresh: PropTypes.bool,
};

DashboardChartPanel.defaultProps = {
  legends: null,
  units: [],
  years: [],
  onChartClick: null,
  defaultSelectedUnitIds: null,
  defaultLegendCheckedIds: null,
  externalSelectedUnitIds: null,
  externalSelectedYear: null,
  shouldRefresh: false,
};

export default DashboardChartPanel;
