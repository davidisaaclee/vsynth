import { merge } from 'lodash';
import extract from 'gl-shader-extract';
import { createProgramWithFragmentShader } from '@davidisaaclee/video-graph';
import { VideoModule, ShaderModule } from './VideoModule';

// Holds all the necessary information to use a specific video module
// with a specific WebGL runtime.
export interface RuntimeModule {
	program: WebGLProgram;
	uniformLocations: { [identifier: string]: WebGLUniformLocation };
}

export function runtimeModuleFromShaderModule(
	gl: WebGLRenderingContext,
	videoModule: VideoModule<ShaderModule>
): RuntimeModule {
	const program =
		createProgramWithFragmentShader(gl, videoModule.details.shaderSource);
	const uniformIdentifiers =
		extract(gl, program).uniforms.map(({ name }) => name);
	const uniformLocations =
		uniformIdentifiers.map(iden => {
			const loc = gl.getUniformLocation(program, iden);
			if (loc == null) {
				throw new Error(`Could not find uniform \`${iden}\`.`);
			}
			return { [iden]: loc };
		}).reduce(merge, {});

	return {
		program,
		uniformLocations
	};
}

