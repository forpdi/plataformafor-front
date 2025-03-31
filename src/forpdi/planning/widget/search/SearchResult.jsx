import moment from 'moment';
import React from 'react';
import { Link } from 'react-router';
import PlanStore from "forpdi/src/forpdi/planning/store/Plan.jsx";
import Messages from "forpdi/src/Messages.jsx";

export default React.createClass({
    propTypes: {
        resultSearch: React.PropTypes.array,
    },

    getInitialState() {
        return {
            page: 1,
            resultSearchMore: [],
            termsSearch: this.props.terms,
            parentIdSearch: this.props.parentId,
            subPlansSelectSearch: this.props.subPlansSelect,
            levelsSelectSearch: this.props.levelsSelect,
            dataInitSearch: this.props.dataInit,
            dataEndSearch: this.props.dataEnd,
            ordResultSearch: this.props.ordResult,
            hideShowMore: false,
            totalSearchOccurrence: null,
        };
    },

    componentDidMount() {
        PlanStore.on("planFind", (model, data) => {
            if (model != null) {
                if (data.page === 1) {
                    this.setState({
                        resultSearchMore: model.data,
                        resultSearchTotal: model.total,
                        page: 1,
                    });
                } else {
                    this.setState(prevState => ({
                        resultSearchMore: [...prevState.resultSearchMore, ...model.data],
                    }));
                }
            }
        }, this);
    },

    componentWillUnmount() {
        PlanStore.off(null, null, this);
    },

    showMoreOccurencesSearches() {
        const newPage = this.state.page + 1;
        PlanStore.dispatch({
            action: PlanStore.ACTION_FIND_TERMS,
            data: {
                parentId: this.props.parentId,
                terms: this.props.terms,
                subPlansSelect: this.props.subPlansSelect,
                levelsSelect: this.props.levelsSelect,
                dataInit: this.props.dataInit,
                dataEnd: this.props.dataEnd,
                ordResult: this.props.ordResult,
                limit: 10,
                page: newPage,
            },
            opts: {
                wait: true,
            },
        });
        this.setState({
            page: newPage,
        });
    },

    render() {
        const total = this.state.resultSearchTotal;
        return (
            <div className="fpdi-search">
                <div className="fpdi-search-view">
                    <p>{Messages.getEditable("label.searchReturned", "fpdi-nav-label")} {total} {total === 1 ? Messages.getEditable("label.result", "fpdi-nav-label") : Messages.getEditable("label.results", "fpdi-nav-label")}</p>
                </div>
                {this.state.resultSearchMore.length > 0 && (
                    <div>
                        {this.state.resultSearchMore.map((model, idx) => {
                            const isPlan = !model.level; // Verifica se é um plano de metas
                            const planMacroId = this.props.parentId; // O ID do plano macro
                            const planId = isPlan ? model.plan.id : model.id; // O ID do plano de metas ou do nível
                            const planName = isPlan ? model.plan.name : model.name; // O nome do plano de metas ou do nível

                            const generatedLink = isPlan
                                ? `/plan/${planMacroId}/details/subplan/${planId}`
                                : `/plan/${this.props.planId}/details/subplan/level/${model.id}`;

                            return (
                                <div key={`searchResult-${idx}`}>
                                    <div id="fpdi-result-search">
                                        <div id="fpdi-result-search-title">
                                            {isPlan ? `Plano de Metas` : model.level.name}
                                        </div>
                                        <Link
                                            to={generatedLink}
                                            activeClassName="active"
                                            title={Messages.get("label.title.viewMore")}
                                        >
                                            {planName}
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                        {this.state.resultSearchMore.length < this.state.resultSearchTotal && (
                            <div className="textAlignCenter marginTop20">
                                <a onClick={this.showMoreOccurencesSearches}>{Messages.getEditable("label.viewMore", "fpdi-nav-label")}</a>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    },
});
