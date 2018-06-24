import * as Graph from '@davidisaaclee/graph';
import { VideoModule, SubgraphModule } from '../VideoModule';
import * as Osc from './oscillator';

const inletKeys = {
	size: 'size',
	speed: 'speed',
	rotation: 'rotation',
	phaseOffset: 'phase offset',
};

const paramKeys = {
	red: 'red',
	green: 'green',
	blue: 'blue',
	rotationAmount: 'rotationAmount',
	phaseOffsetAmount: 'phaseOffsetAmount',
};

const nodeKeys = {
	osc: 'osc',
};

export const autoOsc: VideoModule<SubgraphModule> = {
	inlets: {
		keys: [
			inletKeys.size,
			inletKeys.speed,
			inletKeys.rotation,
			inletKeys.phaseOffset
		],
		associatedParameters: {
			[inletKeys.rotation]: [paramKeys.rotationAmount],
			[inletKeys.phaseOffset]: [paramKeys.phaseOffsetAmount],
		}
	},

	parameters: {
		keys: [
			paramKeys.red,
			paramKeys.green,
			paramKeys.blue,
			paramKeys.rotationAmount,
			paramKeys.phaseOffsetAmount,
		],
		defaultValues: {
			[paramKeys.red]: 1,
			[paramKeys.green]: 0,
			[paramKeys.blue]: 0,
			[paramKeys.rotationAmount]: 0,
			[paramKeys.phaseOffsetAmount]: 0,
		}
	},

	details: {
		type: 'subgraph',

		inletsToSubInlets: {
			[inletKeys.size]: [{
				nodeKey: nodeKeys.osc,
				inletKey: Osc.inletKeys.waveSize,
			}],
			[inletKeys.speed]: [{
				nodeKey: nodeKeys.osc,
				inletKey: Osc.inletKeys.speed,
			}],
			[inletKeys.rotation]: [{
				nodeKey: nodeKeys.osc,
				inletKey: Osc.inletKeys.rotation,
			}],
			[inletKeys.phaseOffset]: [{
				nodeKey: nodeKeys.osc,
				inletKey: Osc.inletKeys.phaseOffset,
			}],
		},

		parametersToSubParameters: params => ({
			[nodeKeys.osc]: {
				[Osc.parameterKeys.red]: params[paramKeys.red],
				[Osc.parameterKeys.green]: params[paramKeys.green],
				[Osc.parameterKeys.blue]: params[paramKeys.blue],
				[Osc.parameterKeys.rotationAmount]: params[paramKeys.rotationAmount],
				[Osc.parameterKeys.phaseOffsetAmount]: params[paramKeys.phaseOffsetAmount],
			},
		}),

		buildSubgraph: () => {
			let result = Graph.empty;
			result = Graph.insertNode(
				result,
				'oscillator',
				nodeKeys.osc);
			return {
				graph: result,
				outputNodeKey: nodeKeys.osc
			};
		}
	},
};

