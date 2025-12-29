import React from "react";
import _ from 'underscore';
import PlanMacroStore from "forpdi/src/forpdi/planning/store/PlanMacro.jsx";
import PlanStore from "forpdi/src/forpdi/planning/store/Plan.jsx";
import StructureStore from "forpdi/src/forpdi/planning/store/Structure.jsx"
import PerformanceLevels from "forpdi/src/forpdi/dashboard/view/community/PerformanceLevelsCommunity.jsx";
import LevelsCommunityDetails from "forpdi/src/forpdi/dashboard/view/community/LevelsCommunityDetails.jsx";
import CommunityInfoTable from "forpdi/src/forpdi/dashboard/view/community/CommunityInfoTable.jsx";
import InformationPanel from "forpdi/src/forpdi/dashboard/view/community/InformationPanelCommunity.jsx";
import ReactTooltip from 'react-tooltip';
import LoadingGauge from 'forpdi/src/components/LoadingGauge.jsx';
import Messages from "forpdi/src/Messages.jsx";
import { FiltersSideBarContainer } from "forpdi/src/components/dashboard/community/FiltersSideBar";

export default React.createClass({
    contextTypes: {
        router: React.PropTypes.object,
        accessLevel: React.PropTypes.number.isRequired,
        accessLevels: React.PropTypes.object.isRequired,
        permissions: React.PropTypes.array.isRequired,
        roles: React.PropTypes.object.isRequired
    },
 
    getInitialState() {
        return {
            loaded:false,
            plans:null,
            selectedPlan:-1,
            subplans:null,
            selectedSubplan:-1,
            strategicAxis:null,
            selectedStrategicAxis:-1,
            objectives:null,
            selectedObjective:-1,
            indicators:null,
            indicator:null,
            selectedIndicator:-1,
            selectedLevelInstance: -1,
            aggregateIndicator: false,
            maxTextLength: 30,
        };  
    },
  
    componentDidMount() {
        var me = this;

        this.updateMaxTextLength();
        window.addEventListener('resize', this.updateMaxTextLength);

        PlanMacroStore.on("find", (store) => {
            me.setState({
                plans: store.models,
                loaded:true
            });
            if (store.models && store.models.length > 0)
                this.planMacroChange(store.models);
            me.forceUpdate();
        }, me);

        PlanStore.on("find", (store, raw, opts) => {            
            me.setState({
                subplans: raw,
            });            
            me.forceUpdate();
        }, me);

        StructureStore.on("levelSonsFilterRetrivied", (store) => { 
            if (store.data && store.data.length>0) {
                if (store.data[0].level.indicator) {
                    me.setState({
                        indicators: store.data,
                    });
                } else if (store.data[0].level.objective) {
                    me.setState({
                        objectives: store.data,
                    });
                } else {
                    me.setState({
                        strategicAxis: store.data,
                    });  
                }       
            }   
            me.forceUpdate();
        }, me);
 
        if(EnvInfo.company != null){
            PlanMacroStore.dispatch({
                action: PlanMacroStore.ACTION_FIND
            });   
        }
    },
   
    componentWillUnmount() {
        PlanMacroStore.off(null, null, this);
        PlanStore.off(null, null, this);
        StructureStore.off(null, null, this);
        window.removeEventListener('resize', this.updateMaxTextLength);
    },

    truncateText(text, maxLength) {
        const strText = String(text);
        if (strText.length <= maxLength) return strText;
        return `${strText.slice(0, maxLength)}...`;
    },

    updateMaxTextLength() {
        const ref = this.refs.selectPlanMacro;
        if (ref) {
          const selectWidth = ref.offsetWidth;
          const avgCharWidth = 7.7;
          const maxLength = Math.floor(selectWidth / avgCharWidth) - 1;
          this.setState({ maxTextLength: maxLength });
        }
    },

    getItemLabel(item) {
        if (!item) return '';
        if (typeof item.get === 'function') {
            return item.get('name');
        }
        return item.name || '';
    },

    getSelectTooltipText(type) {
        const getSelected = (refName, collection) => {
            const selectRef = this.refs[refName];
            if (!selectRef) {
                return null;
            }
            const idx = parseInt(selectRef.value, 10);
            if (Number.isNaN(idx) || idx < 0) {
                return null;
            }
            return collection && collection[idx];
        };

        switch (type) {
            case 'plan':
                return this.getItemLabel(this.state.selectedPlan) || Messages.getEditable("label.title.plan","fpdi-nav-label");
            case 'subplan':
                return this.getItemLabel(getSelected('selectSubplan', this.state.subplans)) || Messages.get("label.viewAll");
            case 'strategicAxis':
                return this.getItemLabel(getSelected('selectStrategicAxis', this.state.strategicAxis)) || Messages.get("label.viewAll");
            case 'objective':
                return this.getItemLabel(getSelected('selectObjective', this.state.objectives)) || Messages.get("label.viewAll");
            case 'indicator':
                return this.getItemLabel(getSelected('selectIndicator', this.state.indicators)) || Messages.get("label.viewAll");
            default:
                return '';
        }
    },

    planMacroChange(data) {
        const plans = Array.isArray(data) ? data : (this.state.plans || []);
        if (!plans || plans.length === 0) {
            return;
        }

        const selectedIndexRaw = data && data.target
            ? data.target.value
            : (this.refs.selectPlanMacro ? this.refs.selectPlanMacro.value : 0);

        let selectedIndex = parseInt(selectedIndexRaw, 10);
        if (Number.isNaN(selectedIndex) || !plans[selectedIndex]) {
            selectedIndex = 0;
        }

        const selectedPlan = plans[selectedIndex];

        this.setState({
            selectedPlan,
            planId: selectedIndex,
            selectedSubplan: -1,
            selectedStrategicAxis: -1,
            selectedObjective: -1,
            selectedIndicator: -1,
            subplans: [],
            strategicAxis: [],
            objectives: [],
            indicators: [],
            selectedLevelInstance: -1
        });
        
        var parentId;
        if (typeof selectedPlan.get != 'function') {
            parentId = selectedPlan.id;
        } else {
            parentId = selectedPlan.get("id");
        }

        PlanStore.dispatch({
            action: PlanStore.ACTION_FIND,
            data: {
                parentId: parentId                        
            },
            opts: {
                wait: true
            }
       });
    },
  
    subplanChange() {   
        if (this.refs.selectSubplan.value == -1) {
            this.setState({
                selectedSubplan: -1,
                subPlanId: 0,
                selectedStrategicAxis: -1,
                selectedObjective: -1,
                selectedIndicator: -1,
                strategicAxis: [],
                objectives: [],
                indicators: [],
                selectedLevelInstance: -1
            });
        } else {
            this.setState({
                selectedSubplan: this.state.subplans[this.refs.selectSubplan.value],
                subPlanId: this.refs.selectSubplan.value,
                selectedStrategicAxis: -1,
                selectedObjective: -1,
                selectedIndicator: -1,
                strategicAxis: [],
                objectives: [],
                indicators: [],
                selectedLevelInstance: -1
            });    
            PlanStore.dispatch({
                action: PlanStore.ACTION_FIND,
                data: {
                    parentId: this.state.plans[this.refs.selectPlanMacro.value].id,
                },
            }); 
            StructureStore.dispatch({
                action: StructureStore.ACTION_GET_LEVELSONS_FILTER,
                data: {
                    planId: this.state.subplans[this.refs.selectSubplan.value].id,
                    parent: null,
                },
            });  
        }           
    },

    strategicAxisChange() {    
        if (this.refs.selectStrategicAxis.value == -1) {
            this.setState({
                strategicAxisId: 0,
                selectedStrategicAxis: -1,
                selectedObjective: -1,
                selectedIndicator: -1,
                objectives: [],
                indicators: [],
                selectedLevelInstance: -1
            });
        } else {
            this.setState({
                selectedStrategicAxis: this.state.strategicAxis[this.refs.selectStrategicAxis.value],
                strategicAxisId: this.refs.selectStrategicAxis.value,
                selectedObjective: -1,
                selectedIndicator: -1,
                objectives: [],
                indicators: [],
                selectedLevelInstance: this.state.strategicAxis[this.refs.selectStrategicAxis.value]
            });  
            StructureStore.dispatch({
                action: StructureStore.ACTION_GET_LEVELSONS_FILTER,
                data: {
                    parent: this.state.strategicAxis[this.refs.selectStrategicAxis.value].id,
                },
            });  
        }            
    },

    objectiveChange() {        
        if (this.refs.selectObjective.value == -1) {
            this.setState({
                objectiveId: 0,
                selectedObjective: -1,
                selectedIndicator: -1,
                indicators: [],
                selectedLevelInstance: this.state.strategicAxis[this.refs.selectStrategicAxis.value]
            });
        } else {
            this.setState({
                selectedObjective: this.state.objectives[this.refs.selectObjective.value],
                objectiveId: this.refs.selectObjective.value,
                selectedIndicator: -1,
                indicators: [],
                selectedLevelInstance: this.state.objectives[this.refs.selectObjective.value]
            });  
            StructureStore.dispatch({
                action: StructureStore.ACTION_GET_LEVELSONS_FILTER,
                data: {
                    parent: this.state.objectives[this.refs.selectObjective.value].id,
                },
            }); 
        }          
    },

    indicatorChange() {  
        if (this.refs.selectIndicator.value == -1) {
            this.setState({
                indicatorId: 0,
                selectedIndicator: -1,
                selectedLevelInstance: this.state.objectives[this.refs.selectObjective.value],
                aggregateIndicator: false
            }); 
        } else {
            this.setState({
                selectedIndicator: this.state.indicators[this.refs.selectIndicator.value],
                selectedLevelInstance: this.state.indicators[this.refs.selectIndicator.value],
                indicatorId: this.refs.selectIndicator.value
            });

            if (this.state.indicators[this.refs.selectIndicator.value].aggregate == true) {
                this.setState({
                    indicator: this.state.indicators[this.refs.selectIndicator.value],
                    aggregateIndicator: true
                });

            } else {
                 this.setState({
                    aggregateIndicator: false
                });
            }

        }             
    },

	render() {
        var dashboardAxis = "";
        if (this.state.selectedLevelInstance == -1)
          dashboardAxis = Messages.get("label.thematicAxes");
        else if (this.state.selectedLevelInstance.parent == null) 
          dashboardAxis = Messages.get("label.objectives");
        else if (this.state.selectedLevelInstance.level.objective)
          dashboardAxis = Messages.get("label.indicators");
        else if (this.state.selectedLevelInstance.level.indicator)
          dashboardAxis = (this.state.aggregateIndicator ? Messages.get("label.indicators") : Messages.get("label.goals"));
        
		return (
        <div className="fpdi-tabs-nav">
			<div className="dashboard-container">
                <ReactTooltip
                    className="community-tool-tip"
                    id='toolTipNotification'
                    data-type='info'
                    effect="solid"
                    aria-haspopup='true'
                    role='example'
                    place="bottom"
                    border
                >
                    <InformationPanel />
                </ReactTooltip>
                <ReactTooltip
                    id="dashboard-select-tooltip"
                    effect="solid"
                    place="right"
                    multiline
                />
                <div className = "row">
                <div className="col-md-2 col18pct">
                    <FiltersSideBarContainer className="fpdi-tabs-stacked affix hFull">
                        <div className="fpdi-tabs-nav">
                            <a onClick={this.tweakOpen} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <span className="fpdi-nav-icon mdi mdi-filter mdi24px cursorPointer"/>
                                <span className="fpdi-nav-label">
                                    {Messages.getEditable("label.filters","fpdi-nav-label")}
                                </span>
                            </a>
                        </div>
                        <div>
                            
                            {(!this.state.loaded) ? (
                                (EnvInfo.company != null) ? (<LoadingGauge />) : ("") ) 
                            : (<div className="filtersCommunity">
                                <span className = "dashboard-community-text-selectBox"> {Messages.getEditable("label.title.plan","fpdi-nav-label")} </span>
                                <select
                                    defaultValue={this.state.planId}
                                    onChange={this.planMacroChange}
                                    className="dashboard-community-selectBox form-control dashboard-select-box dashboard-community-text-selectBox marginTop5"
                                    ref="selectPlanMacro"
                                    data-for="dashboard-select-tooltip"
                                    data-tip={this.getSelectTooltipText('plan')}
                                >
                                    {this.state.plans.map((attr, idy) => {
                                        var attrId = attr.id || attr.get('id');
                                        var attrName = attr.name || attr.get("name");
                                        return(<option key={attrId} value={idy} data-placement="right" title={attrName}>
                                            {this.truncateText(attrName, this.state.maxTextLength)}
                                        </option>);
                                    })}
                                </select>
                                    <span className = "dashboard-community-text-selectBox marginTop15"> {Messages.getEditable("label.goalsPlan","fpdi-nav-label")}: </span>
                                <select
                                    defaultValue={this.state.subPlanId}
                                    onChange={this.subplanChange}
                                    ref="selectSubplan"
                                    className="dashboard-community-selectBox form-control dashboard-select-box dashboard-community-text-selectBox marginTop5" 
                                    disabled={(this.state.selectedPlan<0)?("disabled"):("")}
                                    data-for="dashboard-select-tooltip"
                                    data-tip={this.getSelectTooltipText('subplan')}
                                >
                                        <option value={-1} data-placement="right" title={Messages.get("label.viewAll")}>{Messages.get("label.viewAll")}</option>
                                        {(this.state.subplans) ? (this.state.subplans.map((attr, idy) =>{
                                            return(<option key={attr.id} value={idy} data-placement="right" title={attr.name}>
                                                {this.truncateText(attr.name, this.state.maxTextLength)}
                                            </option>);
                                        }) ) : ("")}
                                </select>
                                    <span className = "dashboard-community-text-selectBox marginTop15"> {Messages.getEditable("label.thematicAxes","fpdi-nav-label")}: </span>
                                <select
                                    defaultValue={this.state.strategicAxisId}
                                    onChange={this.strategicAxisChange}
                                    ref="selectStrategicAxis"
                                    className="dashboard-community-selectBox form-control dashboard-select-box dashboard-community-text-selectBox marginTop5" 
                                    disabled={(this.state.selectedSubplan<0)?("disabled"):("")}
                                    data-for="dashboard-select-tooltip"
                                    data-tip={this.getSelectTooltipText('strategicAxis')}
                                >
                                        <option value={-1} data-placement="right" title={Messages.get("label.viewAll")}>{Messages.get("label.viewAll")}</option>
                                        {(this.state.strategicAxis) ? (this.state.strategicAxis.map((attr, idy) =>{
                                            return(<option key={attr.id} value={idy} data-placement="right" title={attr.name}>
                                                {this.truncateText(attr.name, this.state.maxTextLength)}
                                            </option>);
                                        }) ) : ("")}
                                </select>
                                    <span className = "dashboard-community-text-selectBox marginTop15"> {Messages.getEditable("label.objectives","fpdi-nav-label")}: </span>
                                <select
                                    defaultValue={this.state.objectiveId}
                                    onChange={this.objectiveChange}
                                    ref="selectObjective"
                                    className="dashboard-community-selectBox form-control dashboard-select-box dashboard-community-text-selectBox marginTop5" 
                                    disabled={(this.state.selectedStrategicAxis<0)?("disabled"):("")}
                                    data-for="dashboard-select-tooltip"
                                    data-tip={this.getSelectTooltipText('objective')}
                                >
                                        <option value={-1} data-placement="right" title={Messages.get("label.viewAll")}>{Messages.get("label.viewAll")}</option>
                                        {(this.state.objectives) ? (this.state.objectives.map((attr, idy) =>{
                                            return(<option key={attr.id} value={idy} data-placement="right" title={attr.name}>
                                                {this.truncateText(attr.name, this.state.maxTextLength)}
                                            </option>);
                                        }) ) : ("")}
                                </select>
                                    <span className = "dashboard-community-text-selectBox marginTop15"> {Messages.getEditable("label.indicators","fpdi-nav-label")}: </span>
                                <select
                                    defaultValue={this.state.indicatorId}
                                    onChange={this.indicatorChange}
                                    ref="selectIndicator"
                                    className="dashboard-community-selectBox form-control dashboard-select-box dashboard-community-text-selectBox marginTop5" 
                                    disabled={(this.state.selectedObjective<0)?("disabled"):("")}
                                    data-for="dashboard-select-tooltip"
                                    data-tip={this.getSelectTooltipText('indicator')}
                                >
                                        <option value={-1} data-placement="right" title={Messages.get("label.viewAll")}>{Messages.get("label.viewAll")}</option>
                                        {(this.state.indicators) ? (this.state.indicators.map((attr, idy) =>{
                                            return(<option key={attr.id} value={idy} data-placement="right" title={attr.name}>
                                                {this.truncateText(attr.name, this.state.maxTextLength)}
                                            </option>);
                                        }) ) : ("")}
                                </select>
                            </div>)}
                            <div style={{height: "10px"}} />
                            <span className="fpdi-fill" />
                        </div>
                    </FiltersSideBarContainer>
                </div>

                <div className="col-md-10 col81pct">
                    <div className="dashboard-community-graphs">
                        <h3 style={{
						color: '#293a59',
						fontWeight: '600',
						fontSize: '26px',
                        marginBottom: '30px'}}>{Messages.getEditable("label.communityDashboard","fpdi-nav-label")}<span data-tip  data-type = 'light'  data-for='toolTipNotification' data-class='community-tool-tip'  > <i className="mdi mdi-information-outline cursorPointer" id="notificationIcons"/> </span> </h3>
                        <div className = "row">
                            <div className="col-md-8">
                                <PerformanceLevels plan={this.state.selectedPlan} subPlan={this.state.selectedSubplan} levelInstance={this.state.selectedLevelInstance} dashboardAxis={dashboardAxis} isAggregateIndicator = {this.state.aggregateIndicator} isIndicator = {this.state.indicator} />
                            </div>
                            <div className="col-md-4">
                                <LevelsCommunityDetails plan={this.state.selectedPlan} subPlan={this.state.selectedSubplan} />
                            </div>
                        </div>
                        <div>
                        {this.state.selectedPlan == -1 ? <LoadingGauge /> : 
                        <CommunityInfoTable plan={this.state.selectedPlan} subPlan={this.state.selectedSubplan} levelInstance={this.state.selectedLevelInstance} />}
                        </div>
                    </div>
			    </div>
        </div>
        </div>
        </div>
		);
	}
});
