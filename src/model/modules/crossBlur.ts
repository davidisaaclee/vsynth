import * as Graph from '@davidisaaclee/graph';
import { VideoModule, SubgraphModule } from '../VideoModule';
import * as SinglePassBlur from './singlePassBlur';

export const parameterKeys = {
	input: 'input',
};

export const inletKeys = {
	input: 'input',
};

export const nodeKeys = {
	first: 'first',
	last: 'last',
};

export const crossBlur: VideoModule<SubgraphModule> = {
	parameters: {
		keys: [parameterKeys.input],
		defaultValues: {
			[parameterKeys.input]: 1,
		}
	},

	inlets: {
		keys: [inletKeys.input],

		associatedParameters: {
			[inletKeys.input]: [parameterKeys.input],
		}
	},

	details: {
		type: 'subgraph',

		inletsToSubInlets: {
			[inletKeys.input]: [{
				nodeKey: nodeKeys.first,
				inletKey: SinglePassBlur.inletKeys.input,
			}],
		},

		parametersToSubParameters: params => ({
			[nodeKeys.first]: {
				[SinglePassBlur.inletKeys.input]: params[parameterKeys.input],
				[SinglePassBlur.parameterKeys.dx]: 1,
				[SinglePassBlur.parameterKeys.dy]: 0,
			},
			[nodeKeys.last]: {
				[SinglePassBlur.parameterKeys.dx]: 0,
				[SinglePassBlur.parameterKeys.dy]: 1,
			},
		}),

		buildSubgraph: () => {
			let result = Graph.empty;
			result = Graph.insertNode(
				result,
				'singlePassBlur',
				nodeKeys.first);
			result = Graph.insertNode(
				result,
				'singlePassBlur',
				nodeKeys.last);

			result = Graph.insertEdge(
				result,
				{
					dst: nodeKeys.first,
					src: nodeKeys.last,
					metadata: {
						inlet: SinglePassBlur.inletKeys.input,
					}
				},
				'first -> last.input');

			return {
				graph: result,
				outputNodeKey: nodeKeys.last
			};
		}
	}

};

