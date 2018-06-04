import { UniformSpecification } from 'video-graph';
import { keyBy } from 'lodash';

export default function uniformDictFromArray(
	uniforms: UniformSpecification[]
): { [iden: string]: UniformSpecification } {
	return keyBy(uniforms, s => s.identifier);
}

