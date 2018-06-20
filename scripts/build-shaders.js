const glsl = require('glslify');
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const argv = require('minimist')(process.argv.slice(2));

// TODO: This is pretty weird, I bet there's a better way.
const { inputDir: _inputDir, outputDir: _outputDir } = argv;
const inputDir = path.resolve(__dirname, '..', _inputDir);
const outputDir = path.resolve(__dirname, '..', _outputDir);

glob(`${inputDir}/*.glsl`, (err, files) => {
	files
		.map(compileShader)
		.map(({ basename, shader }) => {
			fs.writeFileSync(
				path.join(outputDir, `${basename}.generated.ts`),
				wrapInES6StringExport(shader));
		});
});

// compileShader :: url -> { basename: string, shader: string }
function compileShader(filepath) {
	return {
		basename: path.basename(filepath, '.glsl'),
		shader: glsl(filepath)
	};
}

// wrapInES6StringExport :: string -> string
function wrapInES6StringExport(str) {
	return `
import { glsl } from '@davidisaaclee/video-graph';

export default glsl\`
${str}
\`;
	`;
}


