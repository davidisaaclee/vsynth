import simple from './simple.json';
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
		name: 'shingles',
		file: JSON.stringify(shingles),
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

