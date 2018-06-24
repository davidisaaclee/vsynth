import * as Graph from '@davidisaaclee/graph';
import { VideoModule, SubgraphModule } from '../VideoModule';
import * as Osc from './oscillator';
import * as AddFract from './addFract';
import * as PhaseDelta from './phaseDelta';

const inletKeys = {
	size: 'size',
	speed: 'speed',
	rotation: 'rotation',
};

const paramKeys = {
	sizeAmount: 'sizeAmount',
	speedAmount: 'speedAmount',
	red: 'red',
	green: 'green',
	blue: 'blue',
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
			inletKeys.size,
			inletKeys.speed,
			inletKeys.rotation,
		],
		associatedParameters: {
			[inletKeys.size]: [paramKeys.sizeAmount],
			[inletKeys.speed]: [paramKeys.speedAmount],
			[inletKeys.rotation]: [paramKeys.rotationAmount],
		}
	},

	parameters: {
		keys: [
			paramKeys.sizeAmount,
			paramKeys.speedAmount,
			paramKeys.shape,
			paramKeys.red,
			paramKeys.green,
			paramKeys.blue,
			paramKeys.rotationAmount,
			// TODO: phaseOffsetAmount should be hidden...
			paramKeys.phaseOffsetAmount,
		],
		defaultValues: {
			[paramKeys.sizeAmount]: 0.5,
			[paramKeys.speedAmount]: 0.5,
			[paramKeys.shape]: 0,
			[paramKeys.red]: 1,
			[paramKeys.green]: 0,
			[paramKeys.blue]: 0,
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
				},
				{
					nodeKey: nodeKeys.phase,
					inletKey: PhaseDelta.inletKeys.size,
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
			[inletKeys.rotation]: [{
				nodeKey: nodeKeys.osc,
				inletKey: Osc.inletKeys.rotation,
			}],
		},

		parametersToSubParameters: params => ({
			[nodeKeys.osc]: {
				[Osc.parameterKeys.waveSizeAmount]: params[paramKeys.sizeAmount],
				[Osc.parameterKeys.speedAmount]: params[paramKeys.speedAmount],
				[Osc.parameterKeys.red]: params[paramKeys.red],
				[Osc.parameterKeys.green]: params[paramKeys.green],
				[Osc.parameterKeys.blue]: params[paramKeys.blue],
				[Osc.parameterKeys.rotationAmount]: params[paramKeys.rotationAmount],
				[Osc.parameterKeys.phaseOffsetAmount]: params[paramKeys.phaseOffsetAmount],
				[Osc.parameterKeys.shape]: params[paramKeys.shape],
			},
			[nodeKeys.phase]: {
				[PhaseDelta.parameterKeys.sizeAmount]: params[paramKeys.sizeAmount],
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

