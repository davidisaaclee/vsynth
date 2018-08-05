precision mediump float;

#pragma glslify: sampleTex = require('./sampleTex');

uniform vec2 inputTextureDimensions;

uniform sampler2D foregroundTexture;
uniform float foregroundAmount;

uniform sampler2D backgroundTexture;
uniform float backgroundAmount;

void main() {
	vec2 uv =
		gl_FragCoord.xy / inputTextureDimensions;

	vec4 foreground =
		texture2D(foregroundTexture, uv) * foregroundAmount;
	vec4 background =
		texture2D(backgroundTexture, uv) * backgroundAmount;

	float flippedForegroundA = 1. - foreground.a;

  gl_FragColor =
		vec4(
			background.rgb * flippedForegroundA + foreground.rgb,
			foreground.a + background.a * flippedForegroundA
		);
}
