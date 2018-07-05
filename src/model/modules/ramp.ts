import * as Graph from '@davidisaaclee/graph';
import { VideoModule, SubgraphModule } from '../VideoModule';
import * as PhaseDelta from './phaseDelta';
import * as AddFract from './addFract';

export const parameterKeys = {
	speed: 'speed',
};

export const inletKeys = {
	speed: 'speed',
};

export const nodeKeys = {
	addFract: 'addFract',
	phaseDelta: 'phaseDelta',
};

// Generates a uniform texture of a linearly ramping value.
export const ramp: VideoModule<SubgraphModule> = {
	description: 'Outputs a repeating linear ramping value.',

	parameters: {
		keys: [parameterKeys.speed],
		defaultValues: {
			[parameterKeys.speed]: 0.01,
		}
	},

	inlets: {
		keys: [inletKeys.speed],

		associatedParameters: {
			[inletKeys.speed]: parameterKeys.speed,
		}
	},

	details: {
		type: 'subgraph',

		inletsToSubInlets: {
			[inletKeys.speed]: [{
				nodeKey: nodeKeys.phaseDelta,
				inletKey: PhaseDelta.inletKeys.speed,
			}],
		},

		parametersToSubParameters: params => ({
			[nodeKeys.phaseDelta]: {
				[PhaseDelta.parameterKeys.speedAmount]: 0.5 * params[parameterKeys.speed],
			},
		}),

		buildSubgraph: () => {
			let result = Graph.empty;
			result = Graph.insertNode(
				result,
				'addFract',
				nodeKeys.addFract);
			result = Graph.insertNode(
				result,
				'phaseDelta',
				nodeKeys.phaseDelta);

			result = Graph.insertEdge(
				result,
				{
					src: nodeKeys.addFract,
					dst: nodeKeys.phaseDelta,
					metadata: {
						inlet: AddFract.inletKeys.a,
					}
				},
				'phaseDelta -> addFract.a');
			result = Graph.insertEdge(
				result,
				{
					src: nodeKeys.addFract,
					dst: nodeKeys.addFract,
					metadata: {
						inlet: AddFract.inletKeys.b,
					}
				},
				'addFract -> addFract.b');

			return {
				graph: result,
				outputNodeKey: nodeKeys.addFract
			};
		}
	}

};

