precision mediump float;
 
uniform sampler2D inputTexture;
uniform vec2 inputTextureDimensions;

uniform sampler2D rOffset;
uniform float rOffsetAmount;
uniform sampler2D gOffset;
uniform float gOffsetAmount;
uniform sampler2D bOffset;
uniform float bOffsetAmount;

float maxComponent(vec3 v) {
	return max(v.x, max(v.y, v.z));
}
 
void main() {
	vec2 uv = gl_FragCoord.xy / inputTextureDimensions;
	vec3 rgbOffset = vec3(
			maxComponent(texture2D(rOffset, uv).rgb * rOffsetAmount),
			maxComponent(texture2D(gOffset, uv).rgb * gOffsetAmount),
			maxComponent(texture2D(bOffset, uv).rgb * bOffsetAmount)) - 0.5;

  gl_FragColor = vec4(
			texture2D(inputTexture, uv + vec2(rgbOffset.r, 0.)).r,
			texture2D(inputTexture, uv + vec2(rgbOffset.g, 0.)).g,
			texture2D(inputTexture, uv + vec2(rgbOffset.b, 0.)).b,
			texture2D(inputTexture, uv).a);
}
