import { ScrollView, View } from 'react-native';
import React from 'react';

import { styles } from './styles';

const BlankContainer = ({
  children,
  innerStyle,
  outerStyle,
  scrollViewRef,
}) => (
  <ScrollView style={[styles.outer, outerStyle]} ref={scrollViewRef}>
    <View style={[styles.inner, innerStyle]}>{children}</View>
  </ScrollView>
);

export default BlankContainer;
