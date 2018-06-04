import { ActionType } from 'typesafe-actions';
import { VideoGraph } from 'video-graph';
import { BUILD_GRAPH } from './constants';
import * as actions from './actions';
import buildGraph from '../../oscillator-mod';

export interface State {
	graph: VideoGraph;
	outputNodeKey: string | null;
};

const initialState: State = {
	graph: {
		nodes: {},
		edges: {}
	},
	outputNodeKey: null
};

type RootAction = ActionType<typeof actions>;

export const reducer = (state: State = initialState, action: RootAction) => {
	switch (action.type) {
		case BUILD_GRAPH:
			return {
				...state,
				graph: buildGraph(action.payload, 20, 0.2),
				outputNodeKey: 'oscillator',
			};

		default:
			return state;
	}
};


