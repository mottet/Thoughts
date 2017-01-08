import React, {Component, PropTypes} from 'react';
import {View,
        StyleSheet,
        Animated} from 'react-native';

export default class CenterText extends Component{

        constructor(props) {
            super(props);

        }

        render() {
            return(

				<View style={styles.center}>
				    <Animated.Text style={{ fontSize : 40,
                                            fontFamily : 'courier new',
				                            color : 'black',

                                            opacity: this.props.flexValue.interpolate({
                                                         inputRange: [-100, 0, 100],
                                                         outputRange: [0, 1, 0]
                                                         })
				    }}>
				        Thoughts
				    </Animated.Text>
				</View>
            )
        }
}

const styles = StyleSheet.create({
    center : {
        flex : 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor : '#e5eaf6'
    }
})