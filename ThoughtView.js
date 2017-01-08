import React, {Component} from 'react';

import {View,
        StyleSheet,
        Animated,
        TextInput,
        PanResponder,
        Keyboard} from 'react-native';

export default class ThoughtView extends Component{
    constructor(props) {
        super(props);

        this._keyboardDidHide = this._keyboardDidHide.bind(this);
        this._keyboardDidShow = this._keyboardDidShow.bind(this);
        this._onMovePan = this._onMovePan.bind(this);

        this.state = {
            pan: new Animated.ValueXY(),
            canMove: true,
            isMoving: false
        };
        this.state.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => this.props.smiley !== enumSmiley.None
                                                                && this.state.canMove,
            onPanResponderMove: Animated.event([null, {
                                    dx: this.state.pan.x,
                                    dy: this.state.pan.y}]),
            onPanResponderRelease: () => {
                Animated.spring( this.state.pan,
                {toValue: {x: 0, y: 0}}
                ).start();
                this.props.goMain();
                this.setState({isMoving: false})
            },
        });
    }

    componentWillMount()
    {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow',
                                        this._keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide',
                                        this._keyboardDidHide);
    }

    componentWillUnmount () {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

     _keyboardDidShow () {
        this.setState({canMove: false});
    }

    _keyboardDidHide () {
        this.setState({canMove: true});
    }

    _onMovePan()
    {
        Animated.event([null, {
            dx: this.state.pan.x, // x,y are Animated.Value
            dy: this.state.pan.y}]);
        this.setState({isMoving: true})
    }

    render() {
        return (
            <Animated.View
                    {...this.state.panResponder.panHandlers}
                    style={this.state.pan.getLayout()}>
                <TextInput style={{ marginVertical: 20,
                                    marginHorizontal: 20,
                                    height : 300,
                                    width: 300,
                                    fontSize : 30,
                                    fontFamily : 'courier new',
                                    backgroundColor: '#e5eaf6',
                                    }}
                            multiline={true}
                            returnKeyType={'done'}
                            numberOfLine={9}
                />
                {this.props.children}
            </Animated.View>
        );
    }
}