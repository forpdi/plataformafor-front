import React from "react";
import GoalBoard from "forpdi/src/forpdi/dashboard/widget/GoalBoard.jsx";
import DashboardStore from "forpdi/src/forpdi/dashboard/store/Dashboard.jsx";

export default React.createClass({
  getInitialState() {
    return {
      plan: this.props.plan,
      subPlan: this.props.subPlan,
      belowMinimum: 0,
      belowExpected: 0,
      reached: 0,
      aboveExpected: 0,
      notStarted: 0,
      loading: true
    };
  },

  componentDidMount() {
    this._handleGoalsInfo = (store) => {
      const data = store?.data || {};

      const toNumber = (v, def = 0) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : def;
      };

      const pctToCount = (pct, tot) => {
        if (!Number.isFinite(tot) || tot <= 0) return 0;
        const p = Number(pct);
        if (!Number.isFinite(p)) return 0;
        const normalized = p <= 1 ? p : p / 100;
        return Math.round(normalized * tot);
      };

      const total =
        toNumber(
          data.totalGoals ?? data.goalsAmount ?? data.total,
          0
        );

      const pick = ({ amount, typo, pctKey }) => {
        if (Number.isFinite(Number(data[amount]))) return Number(data[amount]);
        if (typo && Number.isFinite(Number(data[typo]))) return Number(data[typo]);
        return pctToCount(data[pctKey], total);
      };

      const mapped = {
        belowMinimum: pick({ amount: "belowMinimum", typo: "belowMininum", pctKey: "belowMinimumPercentage" }),
        belowExpected: pick({ amount: "belowExpected", pctKey: "belowExpectedPercentage" }),
        reached:       pick({ amount: "reached",      pctKey: "reachedPercentage" }),
        aboveExpected: pick({ amount: "aboveExpected",pctKey: "aboveExpectedPercentage" }),
        notStarted:    pick({ amount: "notStarted",   pctKey: "notStartedPercentage" })
      };

      this.setState({
        belowMinimum: toNumber(mapped.belowMinimum, 0),
        belowExpected: toNumber(mapped.belowExpected, 0),
        reached: toNumber(mapped.reached, 0),
        aboveExpected: toNumber(mapped.aboveExpected, 0),
        notStarted: toNumber(mapped.notStarted, 0),
        loading: false
      });
    };

    DashboardStore.on("goalsinfoadminretrivied", this._handleGoalsInfo, this);
    DashboardStore.on("goalsinfoadminretrieved", this._handleGoalsInfo, this);

    this.refreshComponent(this.props.plan, this.props.subPlan);
  },

  componentWillUnmount() {
    DashboardStore.off(null, null, this);
  },

  componentWillReceiveProps(newProps) {
    if (this.props.plan !== newProps.plan || this.props.subPlan !== newProps.subPlan) {
      this.setState({ plan: newProps.plan, subPlan: newProps.subPlan, loading: true });
      this.refreshComponent(newProps.plan, newProps.subPlan);
    }
  },

  refreshComponent(plan, subPlan) {
    const getId = (obj) => (obj?.get ? obj.get("id") : obj?.id);

    const payload = {
      macro: (plan != -1) ? getId(plan) : null,
      plan: (subPlan != -1) ? getId(subPlan) : null
    };

    DashboardStore.dispatch({
      action: DashboardStore.ACTION_GET_GOALS_INFO_ADM,
      data: payload
    });
  },

  render() {
    return (
      <div className="row marginRight20">
        <div className="col-sm-2 goals-board-group">
          <GoalBoard
            className="dashboard-goal-panel-color-red dashboard-goal-colaborator-box"
            numberValue={this.state.belowMinimum}
            goalSubLabel={"abaixo do mínimo"}
            goalSubLabelSingular={"abaixo do mínimo"}
            loading={this.state.loading}
          />
        </div>
        <div className="col-sm-2 goals-board-group">
          <GoalBoard
            className="dashboard-goal-panel-color-yellow dashboard-goal-colaborator-box"
            numberValue={this.state.belowExpected}
            goalSubLabel={"abaixo do esperado"}
            goalSubLabelSingular={"abaixo do esperado"}
            loading={this.state.loading}
          />
        </div>
        <div className="col-sm-2 goals-board-group">
          <GoalBoard
            className="dashboard-goal-panel-color-green dashboard-goal-colaborator-box"
            numberValue={this.state.reached}
            goalSubLabel={"suficientes"}
            goalSubLabelSingular={"suficiente"}
            loading={this.state.loading}
          />
        </div>
        <div className="col-sm-2 goals-board-group">
          <GoalBoard
            className="dashboard-goal-panel-color-blue dashboard-goal-colaborator-box"
            numberValue={this.state.aboveExpected}
            goalSubLabel={"acima do máximo"}
            goalSubLabelSingular={"acima do máximo"}
            loading={this.state.loading}
          />
        </div>
        <div className="col-sm-2 goals-board-group">
          <GoalBoard
            className="dashboard-goal-panel-color-gray dashboard-goal-colaborator-box"
            numberValue={this.state.notStarted}
            goalSubLabel={"não iniciadas"}
            goalSubLabelSingular={"não iniciada"}
            loading={this.state.loading}
          />
        </div>
        <div className="clearfix" />
      </div>
    );
  }
});
