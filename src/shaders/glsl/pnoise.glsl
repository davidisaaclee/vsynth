precision mediump float;

#pragma glslify: sampleTex = require('./sampleTex');

const float PI = 3.14159;

uniform vec2 inputTextureDimensions;

uniform float resolutionAmount;
uniform sampler2D resolutionTexture;

uniform float seedAmount;
uniform sampler2D seedTexture;

float rand(float n){return fract(sin(n) * 43758.5453123);}

float rand(vec2 c){
	return fract(sin(dot(c.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float noise(vec2 p, float freq){
	float unit = 1./freq;
	vec2 ij = floor(p/unit);
	vec2 xy = mod(p,unit)/unit;
	//xy = 3.*xy*xy-2.*xy*xy*xy;
	xy = .5*(1.-cos(PI*xy));
	float a = rand((ij+vec2(0.,0.)));
	float b = rand((ij+vec2(1.,0.)));
	float c = rand((ij+vec2(0.,1.)));
	float d = rand((ij+vec2(1.,1.)));
	float x1 = mix(a, b, xy.x);
	float x2 = mix(c, d, xy.x);
	return mix(x1, x2, xy.y);
}

float pNoise(vec2 p, int res){
	float persistance = .5;
	float n = 0.;
	float normK = 0.;
	float f = 4.;
	float amp = 1.;
	int iCount = 0;
	for (int i = 0; i<50; i++){
		n+=amp*noise(p, f);
		f*=2.;
		normK+=amp;
		amp*=persistance;
		if (iCount == res) break;
		iCount++;
	}
	float nf = n/normK;
	return nf*nf*nf*nf;
}

vec2 randVec2FromFloat(float s) {
	float r = rand(s);
	return vec2(r, rand(r));
}

void main() {
	vec2 uv = gl_FragCoord.xy / inputTextureDimensions;
	float resolution = sampleTex(resolutionTexture, uv, resolutionAmount * 100.);
	float seed = sampleTex(seedTexture, uv, seedAmount);

  vec4 texColor = 
		// vec4(vec3(rand(noise(uv * resolution))), 1.);
		vec4(vec3(pNoise(uv + randVec2FromFloat(seed), 100)), 1.);
  gl_FragColor = texColor;
}
