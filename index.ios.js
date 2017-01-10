import React, { Component } from 'react';
import {AppRegistry} from 'react-native';

import ScrollTest from './ScrollTest';

export default class AwesomeProject extends Component{

    render(){
        return(
            <ScrollTest />
        )
    }
}

AppRegistry.registerComponent('AwesomeProject', () => AwesomeProject);
