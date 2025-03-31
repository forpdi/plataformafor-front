import React from 'react';

import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import StructureStore from "forpdi/src/forpdi/planning/store/Structure.jsx";
import AttributeTypes from 'forpdi/src/forpdi/planning/enum/AttributeTypes.json';
import Messages from "forpdi/src/Messages.jsx";
import DatePicker from 'react-datepicker';

const progressStatusIdList = [
	{ label: Messages.getEditable("label.selectAll"), value: '' },
	{ label: Messages.getEditable("label.goals.belowMinimum"), value: 1 },
	{ label: Messages.getEditable("label.goals.belowExpected"), value: 2 },
	{ label: Messages.getEditable("label.goals.reached"), value: 3 },
	{ label: Messages.getEditable("label.goals.aboveExpected"), value: 4 },
];

var GoalsFilter = React.createClass({


	getInitialState() {
		return {
			loading: false,
			goalDate: null,
			nameGoal: null,
			responsibleGoal: null,
			maturityDate: null,
			expectedGoal: null,
			reachedGoal: null,
			progressStatusId: null,
		};
	},

	onlyNumber(evt){
		var key = evt.which;
		if(key == 13|| key != 46 && (key < 48 || key > 57)) {
			evt.preventDefault();
			return;
		}
	},

	onChangeDate(data) {
		this.setState({
			goalDate: data
		});
	},

	componentWillUnmount() {
		StructureStore.off(null, null, this);
	},

	goalsSearch() {
		const attributesToFilter = [];
		const { parentId, model, onChange } = this.props;
		const { sons } = model.data;
	
		var nameGoal = document.getElementById("nameGoal");
		var responsibleGoal =document.getElementById("responsibleGoal");
		var maturityDate = this.state.goalDate ? this.state.goalDate.format("DD/MM/YYYY") : null;
		var expectedGoal = document.getElementById("expectedGoal");
		var reachedGoal = document.getElementById("reachedGoal");
		var progressStatusId = document.getElementById("progressStatusId");

		sons.list[0].level.attributes.map((attribute, idx) => {
			if (!attribute.justificationField && attribute.visibleInTables) {
				if(attribute.type == AttributeTypes.RESPONSIBLE_FIELD 
					&& responsibleGoal.value !== null && responsibleGoal.value !== '-1'){
					attributesToFilter.push({attributeId: attribute.id, value: responsibleGoal.value });
				}
				if(attribute.finishDate && maturityDate !== null){
					attributesToFilter.push({attributeId: attribute.id, value: maturityDate });
				}
				if(attribute.reachedField && reachedGoal.value !== ''){
					attributesToFilter.push({attributeId: attribute.id, value: reachedGoal.value });
				}
				if(attribute.expectedField && expectedGoal.value !== ''){
					attributesToFilter.push({attributeId: attribute.id, value: expectedGoal.value });
				}
			}	
		})
		onChange({
				parentId,
				name: nameGoal.value,
				attributesToFilter: JSON.stringify(attributesToFilter),
				progressStatusId: progressStatusId.value,
    });
	},

	render() {
		if (this.state.loading) {
			return <LoadingGauge />;
		}
		const { users, model } = this.props;
		const { sons } = model.data;

		return (
			<div>	
				<h3>{Messages.getEditable("label.name","fpdi-nav-label")}</h3>
				<input className="form-control" type="text" ref="nameGoal" id="nameGoal" maxLength="255"/>
			<div className="row">
				{sons.list[0].level.attributes.map((attribute, id) => {
					if (!attribute.justificationField && attribute.visibleInTables) {
						return (
							<div className="col-md-6" key={"attribute-"+id}>
							{attribute.finishDate ?
								<div>
									<h3>{Messages.getEditable("label.maturity","fpdi-nav-label")}</h3>
									<DatePicker
										className="form-control"
										type="datepicker"
										ref="maturityDate"
										dateFormat="DD/MM/YYYY"
										selected={this.state.goalDate}
										onChange={this.onChangeDate}
										placeholderText="DD/MM/AAAA"
										showYearDropdown
										autoComplete="off"
                    fixedHeight
									/>	
							</div>
							:""}

							{attribute.type == AttributeTypes.RESPONSIBLE_FIELD ?
								<div>
									<h3>{Messages.getEditable("label.responsible","fpdi-nav-label")}</h3>
									<select
										className="form-control fontSize12"
										name="responsibleGoal"
										ref="responsibleGoal"
										id="responsibleGoal"
									>
										<option key={'goal-opt-selectall'} value={-1}>
											{Messages.getEditable("label.all")}
										</option>
											{users && users.length > 0 ?
											users.map((opt,idx) => {
											return (<option key={'goal-opt-'+idx} value={opt.id}
											data-placement="right" title={opt.name}>
											{opt.name}
										</option>);
										}): ""}
									</select>	
								</div>
							:""}

							{attribute.reachedField ?
								<div>
									<h3>{Messages.getEditable("label.titleReached","fpdi-nav-label")}</h3>
									<input className="form-control" ref="reachedGoal" id="reachedGoal" onKeyPress={this.onlyNumber} type="number"/>	
								</div>
							:""}

							{attribute.expectedField?
								<div>
									<h3>{Messages.getEditable("label.goals.expected","fpdi-nav-label")}</h3>
									<input className="form-control" ref="expectedGoal" id="expectedGoal" onKeyPress={this.onlyNumber} type="number"/>
								</div>
							:""}
						</div>
						);
					}
				})}
				<div className="col-md-12">
					<h3>{Messages.getEditable("label.goalsPerformance","fpdi-nav-label")}</h3>
					<select
						className="form-control fontSize12"
						name="progressStatusId"
						ref="progressStatusId"
						id="progressStatusId"
					>
					{
					progressStatusIdList.map((opt,idx) => {
						return (<option key={'goal-opt-'+idx} value={opt.value}
							data-placement="right" title={opt.label}>
							{opt.label}</option>);
					})}
					</select>
				</div>
			</div>
				<div style={{textAlign: "center"}}>
					<br/>
					<button type="button" className="btn btn-sm btn-success"  onClick={this.goalsSearch} data-dismiss="modal"> {Messages.get("label.research")}</button>
					<button type="button" className="btn btn-sm btn-default" data-dismiss="modal">{Messages.get("label.cancel")}</button>
				</div>
		</div>
	);
	}
});

export default GoalsFilter;