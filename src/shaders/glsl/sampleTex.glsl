float maxComponent(vec3 v) {
	return max(v.x, max(v.y, v.z));
}

float sampleTex(sampler2D t, vec2 pt, float scale) {
	return maxComponent(
			texture2D(
				t,
				pt).rgb)
		* scale;
}

#pragma glslify: export(sampleTex)

