import constantFragmentShader from './shaders/constant';
import oscillatorShader from './shaders/oscillator';
import { VideoGraph, createProgramWithFragmentShader } from 'video-graph';
import uniformDictFromArray from './utility/uniformDictFromArray';

export default function createGraph(
	gl: WebGLRenderingContext,
	oscFreq: number,
	lfoFreq: number,
): VideoGraph {
	return {
		nodes: {
			'constant': {
				program: createProgramWithFragmentShader(gl, constantFragmentShader),
				uniforms: uniformDictFromArray([
					{
						identifier: 'value',
						value: { type: '3f', data: [1, 0, 0] }
					}
				])
			},

			'oscillator': {
				program: createProgramWithFragmentShader(gl, oscillatorShader),
				uniforms: uniformDictFromArray(
					[
						{
							identifier: 'frequency',
							value: { type: 'f', data: oscFreq }
						},
					])
			},

			'lfo': {
				program: createProgramWithFragmentShader(gl, oscillatorShader),
				uniforms: uniformDictFromArray(
					[
						{
							identifier: 'frequency',
							value: { type: 'f', data: lfoFreq }
						},
					])
			},

		},
		edges: {
				'osc.rotation <- constant': {
					src: 'oscillator',
					dst: 'constant',
					metadata: { uniformIdentifier: 'rotationTheta' }
				},

			/*
			'osc.rotation <- lfo': {
				src: 'oscillator',
				dst: 'lfo',
				metadata: { uniformIdentifier: 'rotationTheta' }
			},

			'lfo.rotation <- constant': {
				src: 'lfo',
				dst: 'constant',
				metadata: { uniformIdentifier: 'rotationTheta' }
			},
			*/
		}
	};
}
