precision mediump float;

#pragma glslify: sampleTex = require('./sampleTex');

uniform vec2 inputTextureDimensions;

uniform float inputAmount;
uniform sampler2D inputTexture;

uniform float hueAmount;
uniform sampler2D hueTexture;

uniform float saturationAmount;
uniform sampler2D saturationTexture;

uniform float valueAmount;
uniform sampler2D valueTexture;


// https://gist.github.com/sugi-cho/6a01cae436acddd72bdf
vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}


void main() {
	vec2 uv =
		gl_FragCoord.xy / inputTextureDimensions;

	float hueSample =
		sampleTex(hueTexture, uv, hueAmount);
	float saturationSample =
		sampleTex(saturationTexture, uv, 2. * (saturationAmount - 0.5));
	float valueSample =
		sampleTex(valueTexture, uv, 2. * (valueAmount - 0.5));
	vec4 inputSample =
		texture2D(inputTexture, uv) * inputAmount;

	vec3 hsv =
		rgb2hsv(inputSample.rgb)
		+ vec3(
				hueSample,
				saturationSample,
				valueSample);
	hsv.x = fract(hsv.x);
	hsv.yz = clamp(hsv.yz, 0., 1.);

	gl_FragColor =
		vec4(hsv2rgb(hsv), 1.);
}

