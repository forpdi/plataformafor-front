import React from "react";
import ForPDIChart from "forpdi/src/forpdi/core/widget/ForPDIChart.jsx";
import DashboardStore from "forpdi/src/forpdi/dashboard/store/Dashboard.jsx";
import StructureStore from "forpdi/src/forpdi/planning/store/Structure.jsx";
import Modal from "forpdi/src/forpdi/core/widget/Modal.jsx";
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import Messages from "forpdi/src/Messages.jsx";
import { FULL_PAGE_SIZE } from 'forpdi/src/consts';

var numeral = require('numeral');

var labelTooltipId = 'axis-label-tooltip';
var labelTooltipStyle = {
	position: "fixed",
	display: "none",
	zIndex: 10000,
	padding: "5px",
	background: "white",
	border: "solid #555 1px",
	boxShadow: '5px 5px 10px -10px #000',
	fontSize: '12px'
};

export default React.createClass({
	getInitialState() {
		return {
			plan: this.props.plan,
			loading: true,
			subPlan: this.props.subPlan,
			elements: [],
			data: [],
			options: {
				title: "",
				hAxis: { minValue: 0, maxValue: 15 },
				vAxis: {
					title: "Valor (%)",
					minValue: 0,
					maxValue: 15,
					format: "#,##0",
				},
				legend: "none",
				explorer: { axis: "horizontal" },
				bar: { groupWidth: "50%" },
			},
			thematicAxes: [],
			objectives: [],
			indicators: [],
			selectedThematicAxis: null,
			selectedObjective: null,
			selectedIndicator: null,
			chartEvents: [
				{
					eventName: "select",
					callback: this.onChartClick,
				},
			],
			pageSize: 10,
		};
	},

	componentDidMount() {
		var me = this;

		this.getInfo(1, this.state.pageSize);

		DashboardStore.on("performanceStrategicAxisRetrived", (model) => {
			if (this.refs.selectThematicAxes.value == -1) {
				this.setState({
					thematicAxes: model.data,
					loading: false,
				});
				const modelData = model.data.slice(0, this.state.pageSize);
				this.setChartData(modelData);
				this.setState({
					total: model.total,
				});
			} else {
				this.setChartData(model.data);
				this.setState({
					total: model.total,
					loading: false,
				});
			}
		}, me);


		StructureStore.on("objectivesByThematicAxisRetrieved", (model) => {
			me.setState({
				objectives: model.data
			});
		}, me);

		StructureStore.on("indicatorsByObjectiveRetrieved", (model) => {
			me.setState({
				indicators: model.data
			});
		}, me);
	},

	componentWillUnmount() {
		DashboardStore.off(null, null, this);
		StructureStore.off(null, null, this);
	},

	componentWillReceiveProps(newProps) {
		var me = this;

		if (
			this.props.plan !== newProps.plan ||
			this.props.subPlan !== newProps.subPlan
		) {
			me.setState({
				plan: newProps.plan,
				subPlan: newProps.subPlan,
				loading: true,

				thematicAxes: [],
				objectives: [],
				indicators: [],
				selectedThematicAxis: null,
				selectedObjective: null,
				selectedIndicator: null
			});

			if (this.refs.selectThematicAxes) {
				this.refs.selectThematicAxes.value = -1;
			}
			if (this.refs.selectObjective) {
				this.refs.selectObjective.value = -1;
			}
			if (this.refs.selectIndicator) {
				this.refs.selectIndicator.value = -1;
			}

			this.getInfo(1, this.state.pageSize, newProps);
		}
	},

	onThematicAxesChange(event) {
		const thematicAxisId = event.target.value;
		const isAll = thematicAxisId === "-1";

		this.setState({
			selectedThematicAxis: isAll ? null : thematicAxisId,
			selectedObjective: null,
			selectedIndicator: null,
			objectives: [],
			indicators: []
		}, () => {
			if (!isAll) {
				StructureStore.dispatch({
					action: "structure-getObjectivesByThematicAxis",
					data: {
						thematicAxisId: thematicAxisId
					}
				});
			}
			this.getInfo(1, this.state.pageSize);
		});
	},

	onObjectiveChange(event) {
		const objectiveId = event.target.value;
		const isAll = objectiveId === "-1";

		this.setState({
			selectedObjective: isAll ? null : objectiveId,
			selectedIndicator: null,
			indicators: []
		}, () => {
			if (!isAll) {
				StructureStore.dispatch({
					action: "structure-getIndicatorsByObjective",
					data: {
						objectiveId: objectiveId
					}
				});
			}
			this.getInfo(1, this.state.pageSize);
		});
	},

	onIndicatorChange(event) {
		const indicatorId = event.target.value;
		const isAll = indicatorId === "-1";

		this.setState({
			selectedIndicator: isAll ? null : indicatorId
		}, () => {
			this.getInfo(1, this.state.pageSize);
		});
	},

	getInfo(page, pageSize, opt) {
		opt = opt || this.state;
		const { selectedThematicAxis, selectedObjective, selectedIndicator } = this.state;

		this.setState({ loading: true });

		DashboardStore.dispatch({
			action: DashboardStore.ACTION_PERFORMANCE_STRATEGICAXIS,
			data: {
				macro: opt.plan == -1 ? null : opt.plan.id,
				plan: opt.subPlan != -1 ? opt.subPlan.id : null,
				thematicAxis: selectedThematicAxis,
				objective: selectedObjective,
				indicator: selectedIndicator,
				page: page,
				pageSize: FULL_PAGE_SIZE,
			},
		});
	},


	setChartData(thematicAxes) {
		var data = [];
		var element = [];
		const thematicAxesNames = []
		if (thematicAxes.length == 0) {
			data.push(["Element", "Rendimento"]);
			data.push([
				Messages.get("label.haveNoThematicAxes"),
				parseFloat(0),
			]);
			element.push([
				Messages.get("label.haveNoThematicAxes"),
				parseFloat(0),
			]);
		} else {
			data.push(["Element", "Rendimento", { role: "style" }]);
			thematicAxes.map((item) => {
				var value = parseFloat(item.levelValue);
				var color;
				if (!value) color = "#A9A9A9";
				else if (value < item.levelMinimum) color = "#E74C3C";
				else if (value < 100.0) color = "#FFCC33";
				else if (
					value < item.levelMaximum ||
					item.levelMaximum == 100.0
				)
					color = "#51D466";
				else color = "#4EB4FE";
				var valueForGraph = {
					v: value,
					f: numeral(parseFloat(value)).format("0,0.00") + "%",
				};
				if (item.name.length > 50) {
					element.push([
						item.name.substring(0, 50).concat("..."),
						valueForGraph,
						color,
					]);
				} else {
					element.push([item.name, valueForGraph, color]);
				}
				thematicAxesNames.push(item.name);
			});
		}
		thematicAxes.map((item, idx) => {
			data.push(element[idx]);
		});
		var slantedText = thematicAxes.length > 0;
		let hTitle = "";
		if (this.state.selectedThematicAxis && this.state.selectedObjective) {
			hTitle = Messages.get("label.indicators");
		} else if (this.state.selectedThematicAxis) {
			hTitle = Messages.get("label.objectives");
		} else {
			hTitle = Messages.get("label.thematicAxes");
		}

		this.setData(data, element, hTitle, slantedText, thematicAxesNames);
		this.setData(data, element, hTitle, slantedText, thematicAxesNames);
	},
	setData(data, element, hTitle, slantedText, thematicAxesNames) {
		this.setState({
			data: data,
			elements: element,
			options: {
				thitle: "",
				hAxis: {
					title: hTitle,
					minValue: 0,
					maxValue: 15,
					slantedText,
					slantedTextAngle: 30,
				},
				vAxis: {
					title: "Valor (%)",
					minValue: 0,
					maxValue: 15,
					format: "#,##0",
				},
				legend: "none",
				bar: { groupWidth: "50%" },
			},
		}, () => this.injectLabelTooltip(thematicAxesNames));
	},
	injectLabelTooltip(thematicAxesNames) {
		setTimeout(() => {
			const labels = document
				.getElementById("ColumnChart")
				.getElementsByTagName("text");
			const tooltip = document.getElementById(labelTooltipId);

			for (var i = 0; i < labels.length; i++) {
				if (i < thematicAxesNames.length) {
					const label = labels[i];
					const textBoundingRect = label.getBoundingClientRect();
					const tooltipText = thematicAxesNames[i];

					label.addEventListener("mouseover", () => {
						tooltip.style.display = "block";
						tooltip.style.top = textBoundingRect.top + 40 + "px";
						tooltip.style.left = textBoundingRect.right - 50 + "px";
						tooltip.innerText = tooltipText;
					});
					label.addEventListener("mouseout", () => {
						tooltip.style.display = "none";
					});
					if (label.nextSibling) {
						label.nextSibling.style.pointerEvents = "none";
					}
				}
			}
		}, 500);
	},
	hideFields() {
		this.setState({
			hide: !this.state.hide,
		});
	},

	onChartClick(Chart) {
		const selection = Chart?.chart?.getSelection?.();
		if (!selection || selection.length === 0) return;

		const row = selection[0]?.row;
		if (row == null) return;
		const {
			selectedThematicAxis,
			selectedObjective,
			thematicAxes,
			objectives,
			indicators,
			plan,
		} = this.state;
		let currentList = thematicAxes;
		if (selectedThematicAxis) currentList = objectives;
		if (selectedThematicAxis && selectedObjective) currentList = indicators;

		const level = currentList?.[row];
		try { Chart.chart.setSelection([]); } catch (e) { }
		if (!level) return;
		const planId =
			level?.plan?.parent?.id ??
			level?.plan?.id ??
			plan?.parent?.id ??
			plan?.id;

		if (!planId || !level?.id) {
			return;
		}
		const url =
			window.location.origin +
			window.location.pathname +
			"#/plan/" + planId +
			"/details/subplan/level/" + level.id;

		const msg = Messages.get("label.askGoToSelectedLevel");
		Modal.confirmCustom(
			() => { Modal.hide(); location.assign(url); },
			msg,
			() => { Modal.hide(); }
		);
	},

	onChartPageChange(page, pageSize, opt) {
		if (this.refs.selectThematicAxes.value == -1) {
			const { thematicAxes } = this.state;
			const start = (page - 1) * this.state.pageSize;
			const end = start + this.state.pageSize;
			const modelData = thematicAxes.slice(start, end);

			this.setChartData(modelData);
		} else {
			this.getInfo(page, pageSize, opt);
		}
	},

	render() {
		return (
			<div>
				<div id={labelTooltipId} style={labelTooltipStyle} />
				<div
					id={!this.state.hide ? "panelSection" : ""}
					className="panel panel-default"
				>
					{/* Cabeçalho com Flexbox */}
					<div className="panel-heading dashboard-panel-title" style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #ddd', padding: '10px 15px' }}>

						<span className="dashboard-filter-label" style={{ marginRight: '20px', fontWeight: 'bold', color: '#666666' }}>
							{Messages.get("label.performance")}
						</span>

						<span className="dashboard-filter-label" style={{ color: '#666666' }}>
							{Messages.get("label.thematicAxis")}
						</span>
						<select
							onChange={this.onThematicAxesChange}
							className="form-select form-select-sm dashboard-select-box-graphs w-auto"
							ref="selectThematicAxes"
							/* FIX APLICADO AQUI: paddingRight, textOverflow, maxWidth, height */
							style={{
								marginLeft: '10px',
								height: '32px',           // Altura fixa para não deformar
								paddingTop: '2px',
								paddingBottom: '2px',
								paddingRight: '35px',
								paddingLeft: '8px',
								textOverflow: 'ellipsis', // Adiciona ...
								whiteSpace: 'nowrap',
								overflow: 'hidden'
							}}
						>
							<option
								value={-1}
								title={Messages.get("label.viewAll")}
							>
								{Messages.get("label.viewAll")}
							</option>
							{this.state.thematicAxes.map((attr) => {
								return (
									<option key={attr.id} value={attr.id} title={attr.name}>
										{attr.name.length > 20
											? (attr.name.trim().substring(0, 20) + "...")
											: attr.name}
									</option>
								);
							})}
						</select>

						<span className="dashboard-filter-label" style={{ marginLeft: '20px', color: '#666666' }}>
							{Messages.get("label.objective")}
						</span>
						<select
							onChange={this.onObjectiveChange}
							className="form-select form-select-sm dashboard-select-box-graphs w-auto"
							ref="selectObjective"
							disabled={!this.state.selectedThematicAxis || this.state.objectives.length === 0}
							/* FIX APLICADO AQUI */
							style={{
								marginLeft: '10px',
								height: '32px',
								paddingTop: '2px',
								paddingBottom: '2px',
								paddingRight: '35px',
								paddingLeft: '8px',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
								overflow: 'hidden',
								color: (!this.state.selectedThematicAxis || this.state.objectives.length === 0) ? 'grey' : 'black'
							}}
						>
							<option
								value={-1}
								title={Messages.get("label.viewAll")}
							>
								{Messages.get("label.viewAll")}
							</option>
							{this.state.objectives && this.state.objectives.map((obj) => {
								return (
									<option key={obj.id} value={obj.id} title={obj.name}>
										{obj.name.length > 20
											? (obj.name.trim().substring(0, 20) + "...")
											: obj.name}
									</option>
								);
							})}
						</select>

						<span className="dashboard-filter-label" style={{ marginLeft: '20px', color: '#666666' }}>
							{Messages.get("label.indicator")}
						</span>
						<select
							onChange={this.onIndicatorChange}
							className="form-select form-select-sm dashboard-select-box-graphs w-auto"
							ref="selectIndicator"
							disabled={!this.state.selectedObjective || this.state.indicators.length === 0}
							style={{
								marginLeft: '10px',
								height: '32px',
								paddingTop: '2px',
								paddingBottom: '2px',
								paddingRight: '35px',
								paddingLeft: '8px',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
								overflow: 'hidden',
								color: (!this.state.selectedObjective || this.state.indicators.length === 0) ? 'grey' : 'black'
							}}
						>
							<option
								value={-1}
								title={Messages.get("label.viewAll")}
							>
								{Messages.get("label.viewAll")}
							</option>
							{this.state.indicators && this.state.indicators.map((ind) => {
								return (
									<option key={ind.id} value={ind.id} title={ind.name}>
										{ind.name.length > 20
											? (ind.name.trim().substring(0, 20) + "...")
											: ind.name}
									</option>
								);
							})}
						</select>

						<div className="performance-strategic-btns" style={{ marginLeft: 'auto' }}>
							<span
								className={
									this.state.hide
										? "mdi mdi-chevron-right"
										: "mdi mdi-chevron-down"
								}
								onClick={this.hideFields}
								style={{ cursor: 'pointer', fontSize: '20px' }}
							/>
						</div>
					</div>

					{!this.state.hide ? (
						this.state.loading ? (
							<LoadingGauge />
						) : (
							<div>
								<ForPDIChart
									chartType="ColumnChart"
									data={this.state.data}
									options={this.state.options}
									graph_id="ColumnChart"
									width="100%"
									height="300px"
									legend_toggle={true}
									pageSize={
										this.refs.selectThematicAxes.value == -1
											? this.state.pageSize
											: this.state.data.length
									}
									total={
										this.refs.selectThematicAxes.value == -1
											? this.state.total
											: this.state.data.length
									}
									onChangePage={this.onChartPageChange}
									chartEvents={this.state.chartEvents}
								/>
								<div className="colaborator-goal-performance-legend">
									<span className="legend-item">
										<input
											type="text"
											className="legend-goals-minimumbelow marginLeft10"
											disabled
										/>{" "}
										{Messages.getEditable(
											"label.goals.belowMinimum",
											"fpdi-nav-label"
										)}
									</span>
									<span className="legend-item">
										<input
											type="text"
											className="legend-goals-expectedbelow marginLeft10"
											disabled
										/>{" "}
										{Messages.getEditable(
											"label.goals.belowExpected",
											"fpdi-nav-label"
										)}
									</span>
									<span className="legend-item">
										<input
											type="text"
											className="legend-goals-enough marginLeft10"
											disabled
										/>{" "}
										{Messages.getEditable(
											"label.goals.reached",
											"fpdi-nav-label"
										)}
									</span>
									<span className="legend-item">
										<input
											type="text"
											className="legend-goals-expectedabove marginLeft10"
											disabled
										/>{" "}
										{Messages.getEditable(
											"label.goals.aboveExpected",
											"fpdi-nav-label"
										)}
									</span>
								</div>
							</div>
						)
					) : (
						""
					)}
				</div>
			</div>
		);
	},
});