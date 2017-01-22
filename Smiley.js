import React, {Component} from 'react';
import {View,
        StyleSheet,
        Dimensions,
        Animated,
        TouchableOpacity,
        TextInput,
        AsyncStorage,
        Image} from 'react-native';

import ThoughtView from './ThoughtView';

export default class Smiley extends Component{

        constructor(props) {
            super(props);

            this.animThought = this.animThought.bind(this);
            this.goBackToMain = this.goBackToMain.bind(this);


            this.state = {
                textFlex: new Animated.Value(0),
                listenTextFlex: 0,
                listenFlexValue: 0,
                heightWindow: Dimensions.get('window').height,
                widthWindow: Dimensions.get('window').width,
                bandRange: paramSmiley.bandRange[this.props.felling],
                color: paramSmiley.color[this.props.felling],
                smileyImg: paramSmiley.smileyImg[this.props.felling],
                text: this.props.text,
                index: this.props.index,
                data: this.props.data
                };

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
            {
                if (!this.props.isTop)
                    this.props._loadThought(this.props.felling).done();
                Animated.timing(
                    this.state.textFlex,
                    {toValue: 1,
                     delay: 600
                    }
                ).start();
            }
        }

        goBackToMain()
        {
            Animated.timing(
                this.state.textFlex,
                {toValue: 0,
                delay: 0}
            ).start();
            this.props.goMain();
        }

        render() {
            return(

                <Animated.View style={[styles.band,
                                       {flex: this.props.smileysFlex.interpolate({
                                            inputRange: [0, 100, 200, 300, 400, 500],
                                            outputRange: this.state.bandRange
                                            }),
                                        backgroundColor: this.state.color}]}>

                    {this.props.isTop &&
                    <Animated.View style={{flex: this.state.textFlex.interpolate({
                                               inputRange: [0, 1],
                                               outputRange: [1, 15]
                                               }),
                                           width : this.state.textFlex.interpolate({
                                               inputRange: [0, 1],
                                               outputRange: [0, this.state.widthWindow]
                                               }),
                                           opacity: this.state.textFlex,
                                           flexDirection: 'row',
                                           justifyContent: 'center',
                                           alignItems: 'flex-end'
                    }}>
                       <ThoughtView goMain={this.goBackToMain}
                                    isTop={this.props.isTop}
                                    felling={this.props.felling}
                                    text={this.props.text}
                                    _saveThought={this.props._saveThought}
                                    _deleteThought={this.props._deleteThought}/>
                    </Animated.View>
                    }

                    <View style={{  flex: 8,
                                    justifyContent: 'center',
                                    alignItems: 'center'}}>
                    <TouchableOpacity onPressIn={this.animThought}
                                        disabled={this.props.smiley !== enumSmiley.None ||
                                                  !this.props.canPress}>
                        <Animated.Image source={this.state.smileyImg}
                         style={{width: this.state.widthWindow / 3,
                                height: this.state.widthWindow / 3,
                                opacity: this.props.flexValue.interpolate({
                                     inputRange: [-100, 1, 100],
                                     outputRange: this.props.imgRange
                                     })}} />
                    </TouchableOpacity>
                    </View>

                    {!this.props.isTop &&
                    <Animated.View style={{flex: this.state.textFlex.interpolate({
                                               inputRange: [0, 1],
                                               outputRange: [1, 15]
                                               }),
                                           width : this.state.textFlex.interpolate({
                                               inputRange: [0, 1],
                                               outputRange: [0, this.state.widthWindow]
                                               }),
                                           opacity: this.state.textFlex,
                                           flexDirection: 'row',
                                           justifyContent: 'center',
                                           alignItems: 'flex-start'
                    }}>
                       <ThoughtView goMain={this.goBackToMain}
                                    isTop={this.props.isTop}
                                    felling={this.props.felling}
                                    text={this.props.text}
                                    _saveThought={this.props._saveThought}
                                    _deleteThought={this.props._deleteThought}
                                    thoughtIndex={this.state.index}/>
                    </Animated.View>
                    }

               </Animated.View>
            )
        }
}

paramSmiley = {
    bandRange: [[10000, 10000, 10000, 1, 10000, 1],
                [10000, 1, 10000, 10000, 10000, 1],
                [10000, 1, 10000, 1, 10000, 10000]],
    color: ['#002fa7', '#4c6dc1', '#99abdb'],
    smileyImg : [require('./images/happySmiley.png'),
                require('./images/neutralSmiley.png'),
                require('./images/sadSmiley.png')]
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