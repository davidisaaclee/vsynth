import * as Graph from '@davidisaaclee/graph';
import { VideoModule, SubgraphModule } from '../VideoModule';
import * as Osc from './oscillator';
import * as Ramp from './ramp';
import * as Scanlines from './scanlines';

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
	ramp: 'ramp',
	scanlines: 'scanlines',
};

export const autoOsc: VideoModule<SubgraphModule> = {
	description: "A classic video synthesis oscillator.",

	inlets: {
		keys: [
			inletKeys.hue,
			inletKeys.size,
			inletKeys.speed,
			inletKeys.shape,
			inletKeys.rotation,
		],
		associatedParameters: {
			[inletKeys.hue]: paramKeys.hue,
			[inletKeys.size]: paramKeys.sizeAmount,
			[inletKeys.speed]: paramKeys.speedAmount,
			[inletKeys.shape]: paramKeys.shape,
			[inletKeys.rotation]: paramKeys.rotationAmount,
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
					nodeKey: nodeKeys.ramp,
					inletKey: Ramp.inletKeys.speed,
				},
			],
			[inletKeys.shape]: [{
				nodeKey: nodeKeys.osc,
				inletKey: Osc.inletKeys.shape,
			}],
			[inletKeys.rotation]: [{
				nodeKey: nodeKeys.scanlines,
				inletKey: Scanlines.inletKeys.rotation,
			}],
			[inletKeys.hue]: [{
				nodeKey: nodeKeys.osc,
				inletKey: Osc.inletKeys.hue,
			}]
		},

		parametersToSubParameters: params => ({
			[nodeKeys.osc]: {
				[Osc.parameterKeys.input]: 1,
				[Osc.parameterKeys.waveSizeAmount]: 1 - params[paramKeys.sizeAmount],
				[Osc.parameterKeys.speedAmount]: params[paramKeys.speedAmount],
				[Osc.parameterKeys.hue]: params[paramKeys.hue],
				[Osc.parameterKeys.phaseOffsetAmount]: params[paramKeys.phaseOffsetAmount],
				[Osc.parameterKeys.shape]: params[paramKeys.shape],
			},
			[nodeKeys.ramp]: {
				[Ramp.parameterKeys.speed]: params[paramKeys.speedAmount] - 0.5,
			},
			[nodeKeys.scanlines]: {
				[Scanlines.parameterKeys.rotationAmount]: params[paramKeys.rotationAmount],
				[Scanlines.parameterKeys.ditherAmount]: 0,
				[Scanlines.parameterKeys.phaseOffsetAmount]: 1,
			},
		}),

		buildSubgraph: () => {
			let result = Graph.empty;
			result = Graph.insertNode(
				result,
				'oscillator',
				nodeKeys.osc);
			result = Graph.insertNode(
				result,
				'ramp',
				nodeKeys.ramp);
			result = Graph.insertNode(
				result,
				'scanlines',
				nodeKeys.scanlines);

			result = Graph.insertEdge(
				result,
				{
					dst: nodeKeys.ramp,
					src: nodeKeys.scanlines,
					metadata: {
						inlet: Scanlines.inletKeys.phaseOffset,
					}
				},
				'ramp -> scanlines.phaseOffset');
			result = Graph.insertEdge(
				result,
				{
					dst: nodeKeys.scanlines,
					src: nodeKeys.osc,
					metadata: {
						inlet: Osc.inletKeys.input,
					}
				},
				'scanlines -> oscillator.input');

			return {
				graph: result,
				outputNodeKey: nodeKeys.osc
			};
		}
	},
};

