declare module 'gl-shader-extract' {
	// TODO: This does not support WebGL 2.0 types, but gl-shader-extract does.
	type DataType
		= "vec2"
		| "vec3"
		| "vec4"
		| "int"
		| "ivec2"
		| "ivec3"
		| "ivec4"
		| "bool"
		| "bvec2"
		| "bvec3"
		| "bvec4"
		| "mat2"
		| "mat3"
		| "mat4"
		| "sampler2D"
		| "samplerCube";

	interface Uniform {
		name: string;
		type: DataType;
	}
	interface Attribute {
		name: string;
		type: DataType;
	}

	function extract(gl: WebGLRenderingContext, program: WebGLProgram): { uniforms: Uniform[], attributes: Attribute[] };
	export default extract;
}

