import React from 'react';
import {
  FlatList,
  View,
  Animated,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { NavigationActions } from 'react-navigation';

import {
  foiRequestsFetchData,
  foiRequestsRefreshData,
  foiRequestsErrorClearAction,
} from '../../actions/foiRequests';

import FoiRequestsListFilterButton from './FoiRequestsListFilterButton';
import FoiRequestsListHeader from './FoiRequestsListHeader';
import { primaryColorLight } from '../../styles/colors';

import { LIST_HEADER_HEIGHT, styles } from './styles';

import {
  renderNumberOfResultHeader,
  renderItem,
  renderFooter,
  renderSeparator,
} from '../../components/ListRenderer';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

class FoiRequestsListScreen extends React.Component {
  constructor(props) {
    super(props);

    const scrollAnim = new Animated.Value(0);
    const offsetAnim = new Animated.Value(0);

    this.state = {
      scrollAnim,
      offsetAnim,
      clampedScroll: Animated.diffClamp(
        Animated.add(
          scrollAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
            extrapolateLeft: 'clamp',
          }),
          offsetAnim
        ),
        0,
        LIST_HEADER_HEIGHT
      ),
    };
  }

  componentDidMount() {
    this.props.fetchData();
  }

  componentDidUpdate() {
    // https://github.com/facebook/react-native/issues/1878
    if (
      Platform.OS === 'ios' &&
      this.props.requests.length <= 20 &&
      !this.props.isRefreshing &&
      !(this.props.isPending && this.props.requests.length !== 0)
    ) {
      this.listRef.getNode().scrollToOffset({
        offset: -LIST_HEADER_HEIGHT,
        animated: false,
      });
    }
  }

  _fetchData = () => {
    if (!this.props.isPending) {
      const timeDif = Date.now() - this.props.firstPageFetchedAt;
      // Prevent fetching data twice on initalizition because the `onEndReachEd` event fires with an empy list
      // value in mili seconds
      if (timeDif > 1000) {
        this.props.fetchData();
      }
    }
  };

  _refreshData = () => {
    this.props.refreshData();
  };

  _renderNumberOfResultHeader = () =>
    renderNumberOfResultHeader(this.props.nResults);

  _renderFooter = () => renderFooter(this.props.isPending);

  _renderItem = ({ item }) => {
    const onPress = () => this.props.navigateToSingle({ request: item });
    return renderItem(item, onPress);
  };

  _renderSeparator = () => renderSeparator();

  render() {
    const { clampedScroll } = this.state;

    const headerTranslate = clampedScroll.interpolate({
      inputRange: [0, LIST_HEADER_HEIGHT],
      outputRange: [0, -LIST_HEADER_HEIGHT],
      extrapolate: 'clamp',
    });

    const headerOpacity = clampedScroll.interpolate({
      inputRange: [0, LIST_HEADER_HEIGHT],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    const hasError = this.props.error !== '';
    if (hasError) {
      const errorText = `Sorry, there has been an error with the message '${this
        .props.error}'`;
      Alert.alert(
        'Error',
        errorText,
        [{ text: 'OK', onPress: this.props.clearError }],
        { cancelable: false }
      );
    }

    const androidContainerStyle =
      Platform.OS === 'android' ? { paddingTop: LIST_HEADER_HEIGHT } : null;

    return (
      <View style={styles.background}>
        <AnimatedFlatList
          refreshControl={
            <RefreshControl
              refreshing={this.props.isRefreshing}
              onRefresh={this._refreshData}
              progressViewOffset={LIST_HEADER_HEIGHT}
              tintColor={primaryColorLight}
              progressBackgroundColor={primaryColorLight}
            />
          } // progresViewOffset for anodroid
          contentInset={{ top: LIST_HEADER_HEIGHT }} // iOS
          data={this.props.requests}
          extraData={this.props.isPending}
          contentContainerStyle={androidContainerStyle}
          renderItem={this._renderItem}
          onEndReached={this._fetchData}
          onEndReachedThreshold={0.5}
          ListFooterComponent={this._renderFooter}
          ListHeaderComponent={this._renderNumberOfResultHeader}
          ItemSeparatorComponent={this._renderSeparator}
          ref={ref => (this.listRef = ref)}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: this.state.scrollAnim } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={10} // iOS only, between onScroll calls are at least 500ms
          style={{ backgroundColor: 'white' }} // this fixes a bug with not appearing activity spinner
        />
        <Animated.View
          style={[
            styles.header,
            { transform: [{ translateY: headerTranslate }] },
          ]}
        >
          <Animated.View style={[styles.title, { opacity: headerOpacity }]}>
            <FoiRequestsListHeader />
          </Animated.View>
        </Animated.View>
      </View>
    );
  }
}

FoiRequestsListScreen.navigationOptions = {
  title: 'Requests',
  headerRight: <FoiRequestsListFilterButton />,
};

FoiRequestsListScreen.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  requests: PropTypes.array.isRequired,
  fetchData: PropTypes.func.isRequired,
  isRefreshing: PropTypes.bool.isRequired,
  isPending: PropTypes.bool.isRequired,
  nResults: PropTypes.number.isRequired,
  // eslint-disable-next-line react/require-default-props
  firstPageFetchedAt: PropTypes.number,
  error: PropTypes.string.isRequired,
  clearError: PropTypes.func.isRequired,
  refreshData: PropTypes.func.isRequired,
  navigateToSingle: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    ...state.foiRequests,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    clearError: () => dispatch(foiRequestsErrorClearAction()),
    fetchData: () => dispatch(foiRequestsFetchData()),
    refreshData: () => dispatch(foiRequestsRefreshData()),
    navigateToSingle: params =>
      dispatch(
        NavigationActions.navigate({ routeName: 'FoiRequestsSingle', params })
      ),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  FoiRequestsListScreen
);