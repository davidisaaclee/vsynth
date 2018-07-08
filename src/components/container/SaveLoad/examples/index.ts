import simple from './simple.json';
import trails from './trails.json';
import vines from './vines.json';
import lightShell from './lightshell.json';
import coloredShell from './coloredshell.json';
import shingles from './shingles.json';

export interface Example {
	name: string;
	file: string;
}

export const defaultExamples: Example[] = [
	{
		name: 'simple',
		file: JSON.stringify(simple),
	},
	{
		name: 'vines',
		file: JSON.stringify(vines),
	},
	{
		name: 'shingles',
		file: JSON.stringify(shingles),
	},
	{
		name: 'trails',
		file: JSON.stringify(trails),
	},
	{
		name: 'lightshell',
		file: JSON.stringify(lightShell),
	},
	{
		name: 'coloredshell',
		file: JSON.stringify(coloredShell),
	},
];

