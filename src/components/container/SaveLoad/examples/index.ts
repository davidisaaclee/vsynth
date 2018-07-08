import lightShell from './lightshell.json';
import coloredShell from './coloredshell.json';
import shingles from './shingles.json';

export interface Example {
	name: string;
	file: string;
}

export const defaultExamples: Example[] = [
	{
		name: 'lightshell',
		file: JSON.stringify(lightShell),
	},
	{
		name: 'coloredshell',
		file: JSON.stringify(coloredShell),
	},
	{
		name: 'shingles',
		file: JSON.stringify(shingles),
	},
];

