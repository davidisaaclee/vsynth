import { createProgramWithFragmentShader } from '@davidisaaclee/video-graph';
import { VideoModule, ShaderModule } from './VideoModule';

// Holds all the necessary information to use a specific video module
// with a specific WebGL runtime.
export interface RuntimeModule {
	program: WebGLProgram;
}

export function runtimeModuleFromShaderModule(
	gl: WebGLRenderingContext,
	videoModule: VideoModule<ShaderModule>
): RuntimeModule {
	return {
		program: createProgramWithFragmentShader(gl, videoModule.details.shaderSource)
	};
}

