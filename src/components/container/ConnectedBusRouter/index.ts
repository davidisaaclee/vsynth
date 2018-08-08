import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { defaultConstantBusIndex, nullSendBusIndex } from '../../../constants';
import { State as RootState } from '../../../modules';
import * as DocumentModule from '../../../modules/document';
import * as AppModule from '../../../modules/app';
import * as sharedSelectors from '../../../modules/sharedSelectors';
import BusRouter, { Props as BusRouterProps } from '../../presentational/BusRouter';
import * as selectors from './selectors';
import { LaneIndexer } from './types';

type StatePickedPropKeys =
	'busCount' | 'connections' | 'lanes' | 'isRouterCollapsed';
type StateProps =
	Pick<BusRouterProps, StatePickedPropKeys> & {
		laneIndexer: LaneIndexer,
	};

interface DispatchProps {
	makeSetConnection: (laneIndexer: LaneIndexer) => (laneIndex: number, busIndex: number) => any;
	makeRemoveConnection: (laneIndexer: LaneIndexer) => (laneIndex: number, busIndex: number) => any;
	makeSetParameter: (laneIndexer: LaneIndexer) => (laneIndex: number, value: number) => any;
	makePreviewParameter: (laneIndexer: LaneIndexer) => (laneIndex: number, value: number) => any;
	makeRemoveNodeForLane: (laneIndexer: LaneIndexer) => (laneIndex: number) => any;
	makeToggleCollapseRouter: (isRouterCollapsed: boolean) => () => any;
};

interface OwnProps {
	className?: string;
}

function mapStateToProps(state: RootState): StateProps {
	return {
		busCount: sharedSelectors.busCount(state),
		connections: selectors.connections(state),
		lanes: selectors.lanes(state),
		laneIndexer: selectors.laneIndexer(state),
		isRouterCollapsed: sharedSelectors.isRouterCollapsed(state),
	};
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
	return {
		makeSetConnection: (laneIndexer: LaneIndexer) => (laneIndex: number, busIndex: number) => {
			const lane = laneIndexer(laneIndex);
			if (lane.type === 'inlet') {
				dispatch(DocumentModule.actions.setInletConnection(lane.nodeKey, lane.inletKey, busIndex));
			}
			if (lane.type === 'outlet') {
				dispatch(DocumentModule.actions.setOutletConnection(lane.nodeKey, busIndex));
			}
		},

		makeRemoveConnection: (laneIndexer: LaneIndexer) => (laneIndex: number, busIndex: number) => {
			const lane = laneIndexer(laneIndex);
			if (lane.type === 'inlet') {
				dispatch(DocumentModule.actions.setInletConnection(lane.nodeKey, lane.inletKey, defaultConstantBusIndex));
			}
			if (lane.type === 'outlet') {
				dispatch(DocumentModule.actions.setOutletConnection(lane.nodeKey, nullSendBusIndex));
			}
		},

		makeSetParameter: (laneIndexer: LaneIndexer) => (laneIndex: number, value: number) => {
			const lane = laneIndexer(laneIndex);
			if (lane.type !== 'inlet') {
				throw new Error('Attempted to set parameter on non-inlet lane.');
			}
			if (lane.scale == null) {
				throw new Error('Attempted to set parameter on lane with no associated parameter.');
			}
			dispatch(DocumentModule.actions.setParameter(
				lane.nodeKey,
				lane.scale.parameterKey,
				value));
			dispatch(AppModule.actions.clearPreviewedParameter());
		},

		makePreviewParameter: (laneIndexer: LaneIndexer) => (laneIndex: number, value: number) => {
			const lane = laneIndexer(laneIndex);
			if (lane.type !== 'inlet') {
				throw new Error('Attempted to set parameter on non-inlet lane.');
			}
			if (lane.scale == null) {
				throw new Error('Attempted to set parameter on lane with no associated parameter.');
			}

			dispatch(AppModule.actions.previewParameter(
				lane.nodeKey,
				lane.scale.parameterKey,
				value));
		},

		makeRemoveNodeForLane: (laneIndexer: LaneIndexer) => (laneIndex: number) => {
			const lane = laneIndexer(laneIndex);
			dispatch(DocumentModule.actions.removeNode(lane.nodeKey));
		},

		makeToggleCollapseRouter: (isRouterCollapsed: boolean) => () => {
			dispatch(AppModule.actions.setRouterCollapsed(!isRouterCollapsed));
		},
	};
}

function mergeProps(
	stateProps: StateProps,
	dispatchProps: DispatchProps,
	ownProps: OwnProps
): BusRouterProps {
	const {
		laneIndexer,
		...restStateProps
	} = stateProps;

	const {
		makeSetConnection, makeRemoveConnection,
		makePreviewParameter, makeSetParameter,
		makeRemoveNodeForLane, makeToggleCollapseRouter
	} = dispatchProps;

	return {
		...restStateProps,
		setConnection: makeSetConnection(laneIndexer),
		removeConnection: makeRemoveConnection(laneIndexer),
		previewParameter: makePreviewParameter(laneIndexer),
		setParameter: makeSetParameter(laneIndexer),
		removeNodeForLane: makeRemoveNodeForLane(laneIndexer),
		toggleCollapseRouter: makeToggleCollapseRouter(restStateProps.isRouterCollapsed),
		...ownProps,
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)(BusRouter);

