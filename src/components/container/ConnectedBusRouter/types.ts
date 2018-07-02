
interface InletLaneInfo {
	type: 'inlet',
	nodeKey: string,
	inletKey: string,
	scale?: {
		parameterKey: string,
		value: number,
	}
}
interface OutletLaneInfo {
	type: 'outlet',
	nodeKey: string
}

type LaneInfo = InletLaneInfo | OutletLaneInfo;

export type LaneIndexer = (laneIndex: number) => LaneInfo;

