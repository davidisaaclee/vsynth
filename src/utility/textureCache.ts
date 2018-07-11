interface Cache {
	[k: string]: WebGLTexture;
};

export class TextureCache {

	private gl: WebGLRenderingContext;
	private textureCaches: [Cache, Cache] = [{}, {}];
	private texturePrecision: number;
	private filteringMode: number;


	constructor(gl: WebGLRenderingContext) {
		// Determine which precision and filtering modes are supported.
		this.texturePrecision = gl.UNSIGNED_BYTE;
		this.filteringMode = gl.NEAREST;

		const floatExt = gl.getExtension('OES_texture_float');
		// This extension is present if device can render to a floating point texture.
		// (e.g. iOS does not have this extension.)
		const renderFloatExt = gl.getExtension('WEBGL_color_buffer_float');

		if (floatExt != null && renderFloatExt != null) {
			const linearFloatExt = gl.getExtension('OES_texture_float_linear');

			this.texturePrecision = gl.FLOAT;
			// TODO: Is linear filtering even desirable?
			if (linearFloatExt != null) {
				this.filteringMode = gl.LINEAR;
			}
		} else {
			const halfFloatExt = gl.getExtension('OES_texture_half_float');

			if (halfFloatExt != null) {
				this.texturePrecision = halfFloatExt.HALF_FLOAT_OES;
				const linearHalfFloatExt = gl.getExtension('OES_texture_half_float_linear');
				if (linearHalfFloatExt != null) {
					this.filteringMode = gl.LINEAR;
				}
			}
		}

		this.gl = gl;
	}

	public getReadTextureForNode(key: string, frameIndex: number): WebGLTexture {
		const cache = this.textureCaches[frameIndex % 2];
		return this.getTextureForNode(key, cache, frameIndex);
	}

	public getWriteTextureForNode(key: string, frameIndex: number): WebGLTexture {
		const cache = this.textureCaches[(frameIndex + 1) % 2];
		return this.getTextureForNode(key, cache, frameIndex);
	}

	public clear() {
		this.textureCaches = [{}, {}];
	}

	private getTextureForNode(key: string, cache: Cache, frameIndex: number): WebGLTexture {
		if (cache[key] == null) {
			cache[key] = this.createAndSetupTexture(this.gl);
		}

		return cache[key];
	}

	private createAndSetupTexture(gl: WebGLRenderingContext): WebGLTexture {
		if (this.filteringMode == null || this.texturePrecision == null) {
			throw new Error("Did not resolve filter mode or texture precision.");
		}

		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);

		// Set up texture so we can render any size image and so we are
		// working with pixels.
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.filteringMode);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.filteringMode);

		gl.texImage2D(
			gl.TEXTURE_2D, 0, gl.RGBA, gl.canvas.width, gl.canvas.height, 0,
			gl.RGBA, this.texturePrecision, null);

		if (texture == null) {
			throw new Error("Failed to create texture");
		}

		return texture;
	}

}


let sharedTextureCache: TextureCache | null = null;
export function getSharedTextureCache() {
	return sharedTextureCache;
}
export function resetSharedTextureCache(gl: WebGLRenderingContext): TextureCache {
	const cache = new TextureCache(gl);
	sharedTextureCache = cache;
	return cache;
}

