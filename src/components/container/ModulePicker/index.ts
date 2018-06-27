import * as React from 'react';
import * as Kit from '../../../model/Kit';

const e = React.createElement;

interface Props {
	addModule: (modType: Kit.ModuleType) => any;
}

const ModulePicker: React.StatelessComponent<Props> = ({ addModule }) =>
	e('ul',
		{},
		...Kit.moduleKeys.map(key =>
			e('li',
				{},
				e('button',
					{
						onClick: () => addModule(key)
					},
					key))));

export default ModulePicker;

