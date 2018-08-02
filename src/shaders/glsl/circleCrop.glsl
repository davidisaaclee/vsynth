precision mediump float;

uniform sampler2D inputTexture;
uniform float inputAmount;
uniform vec2 inputTextureDimensions;

float sqrDistance(vec2 a, vec2 b) {
	float xLeg = a.x - b.x;
	float yLeg = a.y - b.y;
	return xLeg * xLeg + yLeg * yLeg;
}

void main() {
	vec2 center = vec2(0.5);
	float radius = 0.3;

	vec2 uv = gl_FragCoord.xy / inputTextureDimensions;
  vec4 texColor = texture2D(inputTexture, uv) * inputAmount * (1. - step(radius * radius, sqrDistance(uv, center)));
  gl_FragColor = texColor;
}
