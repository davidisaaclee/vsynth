import * as Graph from '@davidisaaclee/graph';
import { VideoModule, SubgraphModule, ModuleConfigurationType } from '../VideoModule';
import { InletSpecification} from '../SimpleVideoGraph';
import { SubgraphModuleType, ShaderModuleType, ModuleType } from '../Kit';
import * as Periodic from './periodic';
import * as Ramp from './ramp';
import * as Scanlines from './scanlines';

const inletKeys = {
	shape: 'shape',
	size: 'size',
	speed: 'speed',
	rotation: 'rotation',
	phaseOffset: 'phaseOffset',
};

const paramKeys = {
	sizeAmount: 'sizeAmount',
	speedAmount: 'speedAmount',
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
			inletKeys.size,
			inletKeys.speed,
			inletKeys.shape,
			inletKeys.rotation,
			inletKeys.phaseOffset,
		],
		associatedParameters: {
			[inletKeys.size]: paramKeys.sizeAmount,
			[inletKeys.speed]: paramKeys.speedAmount,
			[inletKeys.shape]: paramKeys.shape,
			[inletKeys.rotation]: paramKeys.rotationAmount,
			[inletKeys.phaseOffset]: paramKeys.phaseOffsetAmount,
		}
	},

	parameters: {
		keys: [
			paramKeys.sizeAmount,
			paramKeys.speedAmount,
			paramKeys.shape,
			paramKeys.rotationAmount,
			paramKeys.phaseOffsetAmount,
		],
		defaultValues: {
			[paramKeys.sizeAmount]: 0.5,
			[paramKeys.speedAmount]: 0.5,
			[paramKeys.shape]: 0,
			[paramKeys.rotationAmount]: 0,
			[paramKeys.phaseOffsetAmount]: 0,
		}
	},

	details: {
		type: ModuleConfigurationType.subgraph,

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
			[inletKeys.phaseOffset]: [{
				nodeKey: nodeKeys.periodic,
				inletKey: Periodic.inletKeys.phaseOffset,
			}],
		},

		parametersToSubParameters: params => ({
			[nodeKeys.periodic]: {
				[Periodic.inletKeys.input]: 1,
				[Periodic.inletKeys.waveSize]: 1 - params[paramKeys.sizeAmount],
				[Periodic.inletKeys.speed]: 0,
				[Periodic.inletKeys.phaseOffset]: params[paramKeys.phaseOffsetAmount],
				[Periodic.inletKeys.shape]: params[paramKeys.shape],
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

