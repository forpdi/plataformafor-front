import React from "react";
import {Link} from 'react-router';
import _ from 'underscore';
import Messages from "forpdi/src/Messages.jsx";
import AttributeTypes from 'forpdi/src/forpdi/planning/enum/AttributeTypes.json';

export default React.createClass({
	contextTypes: {
		toastr: React.PropTypes.object.isRequired,
		accessLevel: React.PropTypes.number.isRequired,
        accessLevels: React.PropTypes.object.isRequired,
        permissions: React.PropTypes.array.isRequired,
        roles: React.PropTypes.object.isRequired
	},

	getInitialState() {
		return {			
			
		};
	},

	componentDidMount()	{
		
	},

	componentWillUnmount() {
		
	},
	
	getNotInformedMessage() {
		if (this.props.fieldDef.type === AttributeTypes.RESPONSIBLE_FIELD) {
			return  Messages.get("label.responsibleNotInformed");
		}
		
		return Messages.get("label.managerNotInformed");
	},

	render() {
		if (this.props.vizualization) {
			if (this.props.fieldDef.users && this.props.fieldDef.users.length > 0) {
				var exist = false;
				for (var i=0; i<this.props.fieldDef.users.length; i++) {
					if (this.props.fieldDef.users[i].id == this.props.fieldDef.value) {
						exist = true;
						return(
							<span className="pdi-normal-text">{this.props.fieldDef.users[i].name}</span>
						);
					}
				}
				if (!exist) {
					return(
						<span className="pdi-normal-text">{this.getNotInformedMessage()}</span>
					);
				}
			} else {
				return(
					<span className="pdi-normal-text">{Messages.get("label.userNoRegistered")}</span>
				);
			}
		} else {
			if (!this.props.fieldDef.users || this.props.fieldDef.users.length <= 0) {
				return (
					<input
						className="form-control"
						placeholder={Messages.get("label.noRegisteredUser")}
						name={this.props.fieldDef.name}
						id={this.props.fieldId}
						ref={this.props.fieldId}
						type={this.props.fieldDef.type}
						disabled
						title={Messages.get("label.toRegister")}
						>
					</input>
				);
			} else {
				return (
					<select
						className="form-control"
						placeholder={this.props.fieldDef.placeholder}
						name={this.props.fieldDef.name}
						id={this.props.fieldId}
						ref={this.props.fieldId}
						type={this.props.fieldDef.type}
						onChange={this.props.fieldDef.onChange || _.noop}
						defaultValue={this.props.fieldDef.value}
						>
							{this.props.fieldDef.users ? this.props.fieldDef.users.map((user,idx) => {
								return (<option key={'field-opt-'+this.props.fieldId+"-"+idx} value={user.id}
									data-placement="right" title={user.name}>
										{user.name}</option>);
							}):''}
					</select>
				);
			}
		}
	}

});