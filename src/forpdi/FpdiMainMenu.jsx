import React from "react";
import UserSession from "forpdi/src/forpdi/core/store/UserSession.jsx";
import PlanMacroStore from "forpdi/src/forpdi/planning/store/PlanMacro.jsx";
import StructureStore from "forpdi/src/forpdi/planning/store/Structure.jsx";
import _ from "underscore";
import Messages from "forpdi/src/Messages.jsx";
import PermissionsTypes from "forpdi/src/forpdi/planning/enum/PermissionsTypes.json";
import Modal from "forpdi/src/forpdi/core/widget/Modal.jsx";
import MainMenu from 'forpdi/src/components/MainMenu';
import Logo from 'forpdi/img/logo_fpdi_white.png';

import $ from 'jquery';
import Toastr from 'toastr';
import { cutPhrase } from 'forpdi/src/utils/stringUtil';

export default React.createClass({
    contextTypes: {
        router: React.PropTypes.object,
        accessLevel: React.PropTypes.number.isRequired,
        accessLevels: React.PropTypes.object.isRequired,
        permissions: React.PropTypes.array.isRequired,
		roles: React.PropTypes.object.isRequired,
	},
    getInitialState() {
        return {
            user: UserSession.get("user"),
            logged: !!UserSession.get("logged"),
            hidden: false,
            plans: [],
            domainError:true,
            archivedPlans: [],
            archivedPlansHidden:true,
            plansHidden: true,
			showBudgetElement:false,
        };
    },
    componentDidMount() {
        var me = this;

        me.setState({
            showBudgetElement : (this.state.logged && EnvInfo.company != null)
                ? EnvInfo.company.showBudgetElement
                : null
        });

        if (this.state.logged && EnvInfo.company != null) {
            me.refreshPlans();
        }
        UserSession.on("login", session => {
            me.setState({
                user: session.get("user"),
                logged: true
            });

            if(EnvInfo.company != null){
                me.refreshPlans();
            }
        }, me);
        UserSession.on("logout", session => {
            me.setState({
                user: null,
                logged: false,
                plans: null
            });
        }, me);

        PlanMacroStore.on("unarchivedplanmacrolisted", (store) => {
             if(store.status == 400){
                me.setState({
                    domainError:true
                });
            }else if(store.status == 200 || store.status == undefined){
                me.setState({
                    plans:  store.data,
                    domainError:false
                });
            }
        }, me);

        PlanMacroStore.on("archivedplanmacrolisted", (store) => {
            if(store.status == 400){
                me.setState({
                    domainError:true
                });
            }else if(store.status == 200 || store.status == undefined){
                me.setState({
                    archivedPlans: store.data,
                    domainError:false
                });
            }
        }, me);

        PlanMacroStore.on("planmacroarchived", (model) => {
            me.setState({
                archivedPlansHidden:false
            });
        }, me);

        PlanMacroStore.on("sync", (model) => {
            for(var i = 0; i < this.state.plans.length; i++) {
                if(this.state.plans[i].id == model.attributes.id) {
                    var plans = this.state.plans;
                    plans[i] = model.attributes;
                    this.setState({
                        plans: plans
                    })
                }
            }
        }, me);

        StructureStore.on("retrieve-level-instance-performance", (models) => {
            if (models && (models.length > 0)) {
                this.setState({
                    hidden: true
                });
            }
        }, me);

        me.checkRoute(me.props.location.pathname);
    },
    componentWillUnmount() {
        UserSession.off(null, null, this);
        PlanMacroStore.off(null, null, this);
        StructureStore.off(null, null, this);
    },

    componentWillReceiveProps() {
        this.setState({
            showBudgetElement : (this.state.logged && EnvInfo.company != null ? EnvInfo.company.showBudgetElement : null)
        });

    },
    checkRoute(pathname) {
        this.setState({
            hidden: false
        });
    },


    onLogout() {
        UserSession.dispatch({
            action: UserSession.ACTION_LOGOUT
        });
    },

    refreshPlans() {
        PlanMacroStore.dispatch({
            action: PlanMacroStore.ACTION_FIND_UNARCHIVED
        });
        PlanMacroStore.dispatch({
            action: PlanMacroStore.ACTION_FIND_ARCHIVED
        });
    },

    listArchivedPlans(){
        if(this.state.archivedPlansHidden){
                this.setState({
                    archivedPlansHidden: false
                });
        }else{
            this.setState({
                    archivedPlansHidden: true
            });
        }
	},


	importPlans(event) {
		event && event.preventDefault();

		var formatsBlocked = "(exe*)";

		Modal.uploadFile(
			Messages.get("label.importPlans"),
			<p id="fbkupload">{Messages.get("label.uploadFbk")}</p>,
			"/forpdi/api/company/fbkupload",
			"fbk",
			formatsBlocked,
			() => {
				jQuery.ajax({
					method: "POST",
					url: BACKEND_URL + "company/restore",
					dataType: 'json',
					timeout: 60000*5,
					success(data, status, opts) {
						if (data.success) {
							Modal.hide();
							Toastr.success("Planos foram importados.");
							console.log("Planos foram importados.");
							clearInterval(interval);
						}else{
							Modal.hide();
							console.log("Importação falhou");
							Toastr.error("Importação falhou");
							clearInterval(interval);
						}
					},
					error(opts, status, errorMsg) {
						/*
						timeout
						*/

						if(opts.responseJSON != null){
							Modal.hide();
							clearInterval(interval);
							Toastr.error(opts.responseJSON.message);
						}

						if(opts.responseJSON != null){
							console.log(opts.responseJSON.message)
							console.log(status)
							console.log(errorMsg)
						}

					}
				});
			},
			(response) => {
				if(response.message != null){
					clearInterval(interval);
					Modal.hide();
					console.log("Importação falhou: "+response.message);
					Toastr.error("Importação falhou: "+response.message);
				}
			},
			"fbk."
		);
	},

    showExportPlansModal() {
		Modal.exportPlanMacros(this.state.plans, this.exportPlans);
	},

    exportPlans(selectedPlanIds) {
        const params = selectedPlanIds.join(',');
        jQuery.ajax({
            method: "GET",
            url: BACKEND_URL + "company/export",
            success(data, status, opts) {
                Modal.hide();
                if (data.success) {
                    window.location.href = `forpdi/company/export?ids=${params}`
                }else{
                    Toastr.error("Exportação falhou, verifique se há instituição cadastrada");
                }
            },
            error(opts, status, errorMsg) {
                console.log(opts)
                Toastr.error(JSON.parse(opts.responseText).message);
            }
        });
	},

    shouldDisplayBudgetElementOption() {
        const { domainError, showBudgetElement } = this.state;

        return (this.context.roles.MANAGER || this.hasPlanMacroPermission()) && !domainError &&  showBudgetElement;
    },

    shouldDisplayNewPlanOption() {
        const { domainError } = this.state;

        return (this.context.roles.ADMIN || this.hasPlanMacroPermission()) && !domainError;
    },

    hasPlanMacroPermission() {
        return _.contains(this.context.permissions, PermissionsTypes.MANAGE_PLAN_MACRO_PERMISSION);
    },

    onArchivedPlansClick() {
        const { archivedPlansHidden } = this.state;
        if (this.mainMenuRef) {
            this.mainMenuRef.setExpanded(true);
        }
        this.setState({
            archivedPlansHidden: !archivedPlansHidden,
        });
    },

    onPlansClick() {
        const { plansHidden } = this.state;
        if (this.mainMenuRef) {
            this.mainMenuRef.setExpanded(true);
        }
        this.setState({
            plansHidden: !plansHidden,
        });
    },

    renderPlans(plans, icon) {
        const { location } = this.props;

        return (
            _.map(plans, plan => (
				<MainMenu.MenuItem
                    key={plan.id}
					label={cutPhrase(plan.name, 30)}
                    title={plan.name}
					icon={icon}
					to={`/plan/${plan.id}`}
					location={location}
				/>
            ))
        )
    },

    render() {
        if (!this.state.logged) {
            return <div style={{display: 'none'}} />;
        }

        const { plans, archivedPlans } = this.state;
        const { location } = this.props;
        const { roles } = this.context;
      
        return (
			<MainMenu
                appLogo={Logo}
                ref={(el) => {this.mainMenuRef = el;}}
                onExpandChange={() => this.setState({ archivedPlansHidden: true, plansHidden: true })}
            >
				<MainMenu.MenuItem
					label="Painel de bordo"
					icon="chart-pie"
					to="/home"
					location={location}
				/>

                {
                    this.shouldDisplayBudgetElementOption() && (
                        <MainMenu.MenuItem
                            label="Elementos orçamentários"
                            icon="money-check-alt"
                            to="/budget-element"
                            location={location}
                        />    
                    )
                }

                {
                    plans && plans.length > 0 && (
                        <MainMenu.MultiMenuItems
                            label="Planos de desenvolvimento"
                            icon="list"
                            onClick={this.onPlansClick}
                            location={location}
                            expanded={!this.state.plansHidden}
                        >
                            {this.renderPlans(this.state.plans)}
                        </MainMenu.MultiMenuItems>
                    )
                }

                <MainMenu.Separator />

                {
                    this.shouldDisplayNewPlanOption() && (
                        <MainMenu.MenuItem
                            label="Novo plano"
                            icon="plus-circle"
                            to="/plan/new"
                            location={location}
                        />
                    )
                }

                {
                    archivedPlans && archivedPlans.length > 0 && (
                        <MainMenu.MultiMenuItems
                            label="Planos arquivados"
                            icon="list"
                            onClick={this.onArchivedPlansClick}
                            location={location}
                            expanded={!this.state.archivedPlansHidden}
                        >
                            {this.renderPlans(this.state.archivedPlans)}
                        </MainMenu.MultiMenuItems>

                    )
                }

                {
                    roles.SYSADMIN && (
                        <MainMenu.MenuItem
                            label="Importar planos"
                            icon="file-import"
                            onClick={this.importPlans}
                            location={location}
                        />
                    )
                }

                {
                    roles.ADMIN && (
                        <MainMenu.MenuItem
                            label="Exportar planos"
                            icon="file-export"
                            onClick={this.showExportPlansModal}
                            location={location}
                        />
                    )
                }
                {
                    roles.ADMIN && (
                        <MainMenu.MenuItem
                            label="Relatórios"
                            icon="download"
                            to="/reports"
                            location={location}
                        />
                    )
                }
			</MainMenu>
		);
    }
});
