precision mediump float;

uniform vec2 inputTextureDimensions;

uniform float dividendAmount;
uniform sampler2D dividendTexture;

uniform float divisorAmount;
uniform sampler2D divisorTexture;

void main() {
	vec2 samplePoint =
		gl_FragCoord.xy / inputTextureDimensions;

	gl_FragColor =
		mod(texture2D(dividendTexture, samplePoint) * dividendAmount,
				texture2D(divisorTexture, samplePoint) * divisorAmount);
}
