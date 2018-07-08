import lightShell from './lightshell.json';

export interface Example {
	name: string;
	file: string;
}

export const defaultExamples: Example[] = [
	{
		name: 'lightshell',
		file: JSON.stringify(lightShell),
	}
];

