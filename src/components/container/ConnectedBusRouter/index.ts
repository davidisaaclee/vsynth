import { connect } from 'react-redux';
import { State as RootState } from '../../../modules';
import * as sharedSelectors from '../../../modules/sharedSelectors';
import BusRouter from '../../presentational/BusRouter';
import * as selectors from '../BusRouter/selectors';

function mapStateToProps(state: RootState) {
	return {
		graph: sharedSelectors.graph(state),
		busCount: sharedSelectors.busCount(state),
		connections: selectors.connections(state),
		lanes: selectors.lanes(state),
	};
}

export default connect(
	mapStateToProps
)(BusRouter);

