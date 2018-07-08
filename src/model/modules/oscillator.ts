import * as Graph from '@davidisaaclee/graph';
import { VideoModule, SubgraphModule } from '../VideoModule';
import { InletSpecification} from '../SimpleVideoGraph';
import { SubgraphModuleType, ShaderModuleType, ModuleType } from '../Kit';
import * as Periodic from './periodic';
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
	periodic: 'periodic',
	ramp: 'ramp',
	scanlines: 'scanlines',
};

export const oscillator: VideoModule<SubgraphModule> = {
	name: 'oscillator',

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
					nodeKey: nodeKeys.periodic,
					inletKey: Periodic.inletKeys.waveSize,
				}
			],
			[inletKeys.speed]: [
				{
					nodeKey: nodeKeys.periodic,
					inletKey: Periodic.inletKeys.speed,
				},
				{
					nodeKey: nodeKeys.ramp,
					inletKey: Ramp.inletKeys.speed,
				},
			],
			[inletKeys.shape]: [{
				nodeKey: nodeKeys.periodic,
				inletKey: Periodic.inletKeys.shape,
			}],
			[inletKeys.rotation]: [{
				nodeKey: nodeKeys.scanlines,
				inletKey: Scanlines.inletKeys.rotation,
			}],
			[inletKeys.hue]: [{
				nodeKey: nodeKeys.periodic,
				inletKey: Periodic.inletKeys.hue,
			}]
		},

		parametersToSubParameters: params => ({
			[nodeKeys.periodic]: {
				[Periodic.parameterKeys.input]: 1,
				[Periodic.parameterKeys.waveSizeAmount]: 1 - params[paramKeys.sizeAmount],
				[Periodic.parameterKeys.speedAmount]: params[paramKeys.speedAmount],
				[Periodic.parameterKeys.hue]: params[paramKeys.hue],
				[Periodic.parameterKeys.phaseOffsetAmount]: params[paramKeys.phaseOffsetAmount],
				[Periodic.parameterKeys.shape]: params[paramKeys.shape],
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
			let result: Graph.Graph<ModuleType, InletSpecification> = Graph.empty();
			result = Graph.insertNode(
				result,
				ShaderModuleType.periodic,
				nodeKeys.periodic);
			result = Graph.insertNode(
				result,
				SubgraphModuleType.ramp,
				nodeKeys.ramp);
			result = Graph.insertNode(
				result,
				ShaderModuleType.scanlines,
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
					src: nodeKeys.periodic,
					metadata: {
						inlet: Periodic.inletKeys.input,
					}
				},
				'scanlines -> oscillator.input');

			return {
				graph: result,
				outputNodeKey: nodeKeys.periodic
			};
		}
	},
};

