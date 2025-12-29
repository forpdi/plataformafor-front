import moment from 'moment';
import React from 'react';
import Messages from "forpdi/src/Messages.jsx";

export default React.createClass({

	getInitialState() {
		return {
		};
	},


	componentDidMount() {
		var me = this;
	},
	componentWillUnmount() {

	},
	componentWillReceiveProps() {

	},


	render() {
		return (
			<div style={{ width: '380px', marginRight: '160px'}}>
				<div className='displayFlex-goals'>
					<h4 id="TitleSubtitleGoal" className="textAlign"> {Messages.get("label.peformanceScale")} </h4>
				</div>
				<div className="row" style={{ backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 10px', margin: 0 }}>

					{/* GRUPO 1 */}
					<div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'center', minWidth: 0 }}>
						<div style={{ borderBottom: '2px solid #cccccc', width: '100%', textAlign: 'right' }}>
							<p className="toolTipGoalItem" style={{ fontSize: '10px', fontWeight: 'bold', margin: 0, lineHeight: '1.1' }}>
								{Messages.get("label.goals.belowMinimum")}
							</p>
						</div>
						<div className="boxIcon" style={{ margin: 0, width: 'auto', height: 'auto', marginTop: '8px', marginLeft: '5px' }}>
							<input type="text" className="btn-action-goals-minimumbelow" style={{ width: '12px', height: '12px', display: 'block', margin: 0 }} disabled />
						</div>
					</div>

					{/* GRUPO 2 */}
					<div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'center', minWidth: 0, marginLeft: '10px' }}>
						<div style={{ borderBottom: '2px solid #cccccc', width: '100%', textAlign: 'right' }}>
							<p className="toolTipGoalItem" style={{ fontSize: '10px', fontWeight: 'bold', margin: 0, lineHeight: '1.1' }}>
								{Messages.get("label.min")}
							</p>
						</div>
						<div className="boxIcon" style={{ margin: 0, width: 'auto', height: 'auto', marginTop: '8px', marginLeft: '5px' }}>
							<input type="text" className="btn-action-goals-minimum" style={{ width: '12px', height: '12px', display: 'block', margin: 0 }} disabled />
						</div>
					</div>

					{/* GRUPO 3 */}
					<div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'center', minWidth: 0, marginLeft: '10px' }}>
						<div style={{ borderBottom: '2px solid #cccccc', width: '100%', textAlign: 'right' }}>
							<p className="toolTipGoalItem" style={{ fontSize: '10px', fontWeight: 'bold', margin: 0, lineHeight: '1.1' }}>
								{Messages.get("label.goals.reached")}
							</p>
						</div>
						<div className="boxIcon" style={{ margin: 0, width: 'auto', height: 'auto', marginTop: '8px', marginLeft: '5px' }}>
							<input type="text" className="btn-action-goals-enoughabove" style={{ width: '12px', height: '12px', display: 'block', margin: 0 }} disabled />
						</div>
					</div>

					{/* GRUPO 4 */}
					<div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'center', minWidth: 0, marginLeft: '10px' }}>
						<div style={{ borderBottom: '2px solid #cccccc', width: '100%', textAlign: 'right' }}>
							<p className="toolTipGoalItem" style={{ fontSize: '10px', fontWeight: 'bold', margin: 0, lineHeight: '1.1' }}>
								{Messages.get("label.max")}
							</p>
						</div>
						<div className="boxIcon" style={{ margin: 0, width: 'auto', height: 'auto', marginTop: '8px', marginLeft: '5px' }}>
							<input type="text" className="btn-action-goals-maximumup" style={{ width: '12px', height: '12px', display: 'block', margin: 0 }} disabled />
						</div>
					</div>

				</div>
			</div>);}
});

