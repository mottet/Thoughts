import React, {Component} from 'react';
import {View,
        StyleSheet,
        Dimensions,
        Animated,
        TouchableOpacity,
        TextInput,
        Image} from 'react-native';

import ThoughtView from './ThoughtView';

export default class Smiley extends Component{

        constructor(props) {
            super(props);

            this.animThought = this.animThought.bind(this);
            this.goBackToMain = this.goBackToMain.bind(this);
            this.state = {textFlex: new Animated.Value(0),
                            listenTextFlex: 0,
                            listenFlexValue: 0,
                            heightWindow: Dimensions.get('window').height,
                            widthWindow: Dimensions.get('window').width};
        }

        componentWillMount(){
            this.state.textFlex.addListener((value) => this.state.listenTextFlex = value.value);
            this.props.flexValue.addListener((value) => this.state.listenFlexValue = value.value);
        }

        animThought()
        {
            this.props.moveSmiley();
            if (this.state.listenTextFlex === 1)
                Animated.timing(
                    this.state.textFlex,
                    {toValue: 0}
                ).start();
            else
                Animated.timing(
                    this.state.textFlex,
                    {toValue: 1,
                     delay: 600
                    }
                ).start();
        }

        goBackToMain()
        {
            Animated.timing(
                this.state.textFlex,
                {toValue: 0}
            ).start();
            this.props.goMain();
        }

        render() {
            console.log(Math.abs(this.state.listenFlexValue));
            return(

                <Animated.View style={[styles.band,
                                       {flex: this.props.smileysFlex.interpolate({
                                            inputRange: [0, 100, 200, 300, 400, 500],
                                            outputRange: this.props.bandRange
                                            }),
                                        backgroundColor: this.props.color}]}>

                    <Animated.View style={{flex: this.state.textFlex.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [1, 5]
                                                }),
                                            width : this.state.textFlex.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0, this.state.widthWindow]
                                                }),
                                            opacity: this.state.textFlex,
                                            flexDirection: 'row',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                            }}>
                        <ThoughtView smiley={this.props.smiley}
                                        goMain={this.goBackToMain}
                                        />
                    </Animated.View>

                    <View style={{flex: 2}}>
                    <TouchableOpacity onPressOut={this.animThought}
                                        disabled={
                                                    this.props.smiley !== enumSmiley.None}>
                        <Animated.Image source={this.props.smileyImg}
                         style={{width: this.state.widthWindow / 3,
                                height: this.state.widthWindow / 3,
                                opacity: this.props.flexValue.interpolate({
                                     inputRange: [-100, 1, 100],
                                     outputRange: this.props.imgRange
                                     })}} />
                   </TouchableOpacity>
                   </View>
               </Animated.View>
            )
        }
}

enumSmiley = {
    None : -1,
    Happy : 0,
    Neutral : 1,
    Sad : 2
}

const styles = StyleSheet.create({
    band : {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
    }
})