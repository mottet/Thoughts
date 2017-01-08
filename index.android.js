import React, { Component } from 'react';
import {
  AppRegistry,
  Navigator,
  View,
  LayoutAnimation,
  TouchableOpacity,
  Animated
} from 'react-native';

import ScrollTest from './ScrollTest';

class AwesomeProject extends Component{

    render(){
        return(
            <ScrollTest />
        )
    }
}

AppRegistry.registerComponent('AwesomeProject', () => AwesomeProject);
