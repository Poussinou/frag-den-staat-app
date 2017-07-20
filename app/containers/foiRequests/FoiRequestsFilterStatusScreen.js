import React from 'react';
import { View, FlatList } from 'react-native';
import { connect } from 'react-redux';
import { ListItem, Icon, Text } from 'react-native-elements';

import statusList from '../../data/status.json';

// remove overdue and 'with costs' because it is not implemented yet.
statusList.pop();
statusList.pop();

import { foiRequestsFilterChange } from '../../actions/foiRequests';

class FoiRequestsFilterStatusScreen extends React.Component {
  _onSwitch = (id, switched) => {
    let newFilter = { status: null };

    if (!switched) {
      newFilter = { status: id };
    }
    this.props.changeFilter(newFilter);
  };

  _renderItem = ({ item }) => {
    const switched = this.props.currentFilter === item.id;
    return (
      <ListItem
        title={item.name}
        key={item.id}
        hideChevron
        switchButton
        switched={switched}
        onSwitch={() => this._onSwitch(item.id, switched)}
      />
    );
  };

  render() {
    return (
      <View>
        <FlatList
          data={statusList}
          extraData={this.props.currentFilter}
          renderItem={this._renderItem}
        />
      </View>
    );
  }
}

FoiRequestsFilterStatusScreen.navigationOptions = {
  title: 'Filter',
  tabBarLabel: 'Status',
  tabBarIcon: ({ tintColor }) =>
    <Icon name="chart-gantt" type="material-community" color={tintColor} />,
};

const mapStateToProps = state => {
  return {
    currentFilter: state.foiRequests.filter.status,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    changeFilter: filter => dispatch(foiRequestsFilterChange(filter)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  FoiRequestsFilterStatusScreen
);