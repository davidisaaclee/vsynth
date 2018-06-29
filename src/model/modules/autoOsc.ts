import * as Graph from '@davidisaaclee/graph';
import { VideoModule, SubgraphModule } from '../VideoModule';
import * as Osc from './oscillator';
import * as AddFract from './addFract';
import * as PhaseDelta from './phaseDelta';

const inletKeys = {
	hue: 'hue',
	shape: 'shape',
	size: 'size',
	speed: 'speed',
	rotation: 'rotation',
};

const paramKeys = {
	sizeAmount: 'sizeAmount',
	speedAmount: 'speedAmount',
	hue: 'hue',
	rotationAmount: 'rotationAmount',
	phaseOffsetAmount: 'phaseOffsetAmount',
	shape: 'shape',
};

const nodeKeys = {
	osc: 'osc',
	add: 'add',
	phase: 'phase',
};

export const autoOsc: VideoModule<SubgraphModule> = {
	inlets: {
		keys: [
			inletKeys.hue,
			inletKeys.size,
			inletKeys.speed,
			inletKeys.shape,
			inletKeys.rotation,
		],
		associatedParameters: {
			[inletKeys.hue]: [paramKeys.hue],
			[inletKeys.size]: [paramKeys.sizeAmount],
			[inletKeys.speed]: [paramKeys.speedAmount],
			[inletKeys.shape]: [paramKeys.shape],
			[inletKeys.rotation]: [paramKeys.rotationAmount],
		}
	},

	parameters: {
		keys: [
			paramKeys.hue,
			paramKeys.sizeAmount,
			paramKeys.speedAmount,
			paramKeys.shape,
			paramKeys.rotationAmount,
			// TODO: phaseOffsetAmount should be hidden...
			paramKeys.phaseOffsetAmount,
		],
		defaultValues: {
			[paramKeys.sizeAmount]: 0.5,
			[paramKeys.speedAmount]: 0.5,
			[paramKeys.shape]: 0,
			[paramKeys.hue]: 1,
			[paramKeys.rotationAmount]: 0,
			[paramKeys.phaseOffsetAmount]: 1,
		}
	},

	details: {
		type: 'subgraph',

		inletsToSubInlets: {
			[inletKeys.size]: [
				{
					nodeKey: nodeKeys.osc,
					inletKey: Osc.inletKeys.waveSize,
				}
			],
			[inletKeys.speed]: [
				{
					nodeKey: nodeKeys.osc,
					inletKey: Osc.inletKeys.speed,
				},
				{
					nodeKey: nodeKeys.phase,
					inletKey: PhaseDelta.inletKeys.speed,
				},
			],
			[inletKeys.shape]: [{
				nodeKey: nodeKeys.osc,
				inletKey: Osc.inletKeys.shape,
			}],
			[inletKeys.rotation]: [{
				nodeKey: nodeKeys.osc,
				inletKey: Osc.inletKeys.rotation,
			}],
			[inletKeys.hue]: [{
				nodeKey: nodeKeys.osc,
				inletKey: Osc.inletKeys.hue,
			}]
		},

		parametersToSubParameters: params => ({
			[nodeKeys.osc]: {
				[Osc.parameterKeys.waveSizeAmount]: 1 - params[paramKeys.sizeAmount],
				[Osc.parameterKeys.speedAmount]: params[paramKeys.speedAmount],
				[Osc.parameterKeys.hue]: params[paramKeys.hue],
				[Osc.parameterKeys.rotationAmount]: params[paramKeys.rotationAmount],
				[Osc.parameterKeys.phaseOffsetAmount]: params[paramKeys.phaseOffsetAmount],
				[Osc.parameterKeys.shape]: params[paramKeys.shape],
			},
			[nodeKeys.phase]: {
				[PhaseDelta.parameterKeys.speedAmount]: params[paramKeys.speedAmount],
			}
		}),

		buildSubgraph: () => {
			let result = Graph.empty;
			result = Graph.insertNode(
				result,
				'oscillator',
				nodeKeys.osc);
			result = Graph.insertNode(
				result,
				'addFract',
				nodeKeys.add);
			result = Graph.insertNode(
				result,
				'phaseDelta',
				nodeKeys.phase);

			result = Graph.insertEdge(
				result,
				{
					src: nodeKeys.add,
					dst: nodeKeys.phase,
					metadata: {
						inlet: AddFract.inletKeys.a,
					}
				},
				'phaseDelta -> add.a');
			result = Graph.insertEdge(
				result,
				{
					src: nodeKeys.add,
					dst: nodeKeys.add,
					metadata: {
						inlet: AddFract.inletKeys.b,
					}
				},
				'add -> add.b');
			result = Graph.insertEdge(
				result,
				{
					src: nodeKeys.osc,
					dst: nodeKeys.add,
					metadata: {
						inlet: Osc.inletKeys.phaseOffset,
					}
				},
				'add -> oscillator.phaseOffset');

			return {
				graph: result,
				outputNodeKey: nodeKeys.osc
			};
		}
	},
};

