import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { defaultConstantBusIndex, nullSendBusIndex } from '../../../constants';
import { State as RootState } from '../../../modules';
import * as GraphModule from '../../../modules/graph';
import * as sharedSelectors from '../../../modules/sharedSelectors';
import BusRouter, { Props as BusRouterProps } from '../../presentational/BusRouter';
import * as selectors from './selectors';

type StatePickedPropKeys =
	'graph' | 'busCount' | 'connections' | 'lanes';
type StateProps =
	Pick<BusRouterProps, StatePickedPropKeys>;

type DispatchPickedPropKeys =
	'setInletConnection' | 'setOutletConnection'
	| 'removeInletConnection' | 'removeOutletConnection'
	| 'setParameter' | 'previewParameter' | 'removeNode';
type DispatchProps =
	Pick<BusRouterProps, DispatchPickedPropKeys>;

function mapStateToProps(state: RootState): StateProps {
	return {
		graph: sharedSelectors.graph(state),
		busCount: sharedSelectors.busCount(state),
		connections: selectors.connections(state),
		lanes: selectors.lanes(state),
	};
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
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

