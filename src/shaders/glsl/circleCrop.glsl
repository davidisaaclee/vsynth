precision mediump float;

uniform sampler2D inputTexture;
uniform float inputAmount;
uniform vec2 inputTextureDimensions;

uniform vec2 radius;
uniform vec2 center;

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
  vec4 texColor = texture2D(inputTexture, uv) * inputAmount * pointInsideEllipse(uv, center, radius);
  gl_FragColor = texColor;
}
