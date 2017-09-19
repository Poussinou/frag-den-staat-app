import { StyleSheet } from 'react-native';

import { greyLight } from '../../styles/colors';

const styles = StyleSheet.create({
  listItemContainer: {
    borderBottomColor: greyLight,
    // marginTop: 20,
    borderTopWidth: 0,
    borderBottomWidth: 1,
  },
  firstItemContainer: {
    borderTopWidth: 1,
    borderTopColor: greyLight,
  },
});

export { styles };
