precision mediump float;

#pragma glslify: sampleTex = require('./sampleTex');

uniform vec2 inputTextureDimensions;

uniform sampler2D inputTexture;
uniform float inputAmount;

uniform sampler2D radiusTexture;
uniform float radiusAmount;

uniform sampler2D centerXTexture;
uniform float centerXAmount;

uniform sampler2D centerYTexture;
uniform float centerYAmount;

float sqrDistance(vec2 a, vec2 b) {
	float xLeg = a.x - b.x;
	float yLeg = a.y - b.y;
	return xLeg * xLeg + yLeg * yLeg;
}

float pointInsideEllipse(vec2 pt, vec2 origin, vec2 radius) {
	vec2 numerators = (pt - origin) * (pt - origin);
	vec2 sqrRadius = radius * radius;
	return 1. - step(1., numerators.x / sqrRadius.x + numerators.y / sqrRadius.y);
}

void main() {
	vec2 uv = gl_FragCoord.xy / inputTextureDimensions;

	float radius = sampleTex(radiusTexture, uv, radiusAmount);
	vec2 aspectRatioRadius =
		vec2(radius, inputTextureDimensions.x / inputTextureDimensions.y * radius);
	vec2 center = vec2(
		sampleTex(centerXTexture, uv, centerXAmount),
		sampleTex(centerYTexture, uv, centerYAmount)
	);

  vec4 texColor = texture2D(inputTexture, uv) * inputAmount * pointInsideEllipse(uv, center, aspectRatioRadius);
  gl_FragColor = texColor;
}
