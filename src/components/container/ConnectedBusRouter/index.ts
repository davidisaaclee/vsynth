import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { defaultConstantBusIndex, nullSendBusIndex } from '../../../constants';
import { State as RootState } from '../../../modules';
import * as GraphModule from '../../../modules/graph';
import * as sharedSelectors from '../../../modules/sharedSelectors';
import BusRouter from '../../presentational/BusRouter';
import * as selectors from './selectors';

// TODO: It'd be nice to have type safety
function mapStateToProps(state: RootState) {
	return {
		graph: sharedSelectors.graph(state),
		busCount: sharedSelectors.busCount(state),
		connections: selectors.connections(state),
		lanes: selectors.lanes(state),
	};
}

function mapDispatchToProps(dispatch: Dispatch) {
	return {
		setInletConnection: (nodeKey: string, inletKey: string, busIndex: number) => (
			dispatch(GraphModule.actions.setInletConnection(nodeKey, inletKey, busIndex))
		),

		setOutletConnection: (nodeKey: string, busIndex: number) => (
			dispatch(GraphModule.actions.setOutletConnection(nodeKey, busIndex))
		),

		removeInletConnection: (nodeKey: string, inletKey: string, busIndex: number) => (
			dispatch(GraphModule.actions.setInletConnection(nodeKey, inletKey, defaultConstantBusIndex))
		),

		removeOutletConnection: (nodeKey: string, busIndex: number) => (
			dispatch(GraphModule.actions.setOutletConnection(nodeKey, nullSendBusIndex))
		),

		/*
		openNodeControls: (nodeKey) => (
			dispatch(App.actions.setModal(App.Modals.nodeControls(nodeKey)))
		),
		*/

		setParameter: (nodeKey: string, paramKey: string, value: number) => (
			dispatch(GraphModule.actions.setParameter(nodeKey, paramKey, value))
		),

		previewParameter: (nodeKey: string, paramKey: string, value: number) => (
			dispatch(GraphModule.actions.previewParameter(nodeKey, paramKey, value))
		),

		removeNode: (nodeKey: string) => (
			dispatch(GraphModule.actions.removeNode(nodeKey))
		),
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(BusRouter);

