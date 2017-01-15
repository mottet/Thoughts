import React, {Component} from 'react';

import {View,
        StyleSheet,
        Animated,
        TextInput,
        Text,
        PanResponder,
        Dimensions,
        Keyboard,
        AsyncStorage,
        TouchableWithoutFeedback} from 'react-native';

const dismissKeyboard = require('dismissKeyboard');

export default class ThoughtView extends Component{
    constructor(props) {
        super(props);

        this._keyboardDidHide = this._keyboardDidHide.bind(this);
        this._keyboardDidShow = this._keyboardDidShow.bind(this);
        this._onReleasePan = this._onReleasePan.bind(this);
        this._canMovePan = this._canMovePan.bind(this);

        this.state = {
            pan: new Animated.ValueXY(),
            canMove: true,
            isMoving: false,
            listenPan: 0,
            text: '',
            heightWindow: Dimensions.get('window').height,
            widthWindow: Dimensions.get('window').width
        };
        this.state.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => this._canMovePan(evt, gestureState),
            onPanResponderMove: Animated.event([null, {
                                    dx: this.state.pan.x,
                                    dy: this.state.pan.y}]),
            onPanResponderRelease: this._onReleasePan
        });
    }

    componentWillMount()
    {
        this.state.pan.addListener((value) => this.state.listenPan = value)
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

    _canMovePan(evt, gestureState)
    {
        if (this.state.canMove &&
            (Math.abs(gestureState.dy) > 5 ||
            Math.abs(gestureState.dx) > 5))
        {
            this._inputText.setNativeProps({editable : false});
            return (true);
        }
        else
            return (false);
    }

    _onReleasePan()
    {
        if (Math.abs(this.state.listenPan.y) > Math.abs(this.state.listenPan.x) &&
            (this.props.isTop && this.state.listenPan.y / this.state.heightWindow < -0.15) ||
            (!this.props.isTop && this.state.listenPan.y / this.state.heightWindow > 0.15))
        {
            // Need to send the massage
            Animated.spring( this.state.pan,
                            {toValue: { x: this.state.listenPan.x * 3,
                                        y: this.state.listenPan.y * 3}}).start();

            if (this.props.isTop)
                this.props._saveThought(this.state.text, this.props.felling).done();

            this.props.goMain();
            this.state.pan.setValue({x: 0, y: 0});

            if (this.props.isTop)
                this._inputText.setNativeProps({text:''});
        }

        else if (Math.abs(this.state.listenPan.x) > Math.abs(this.state.listenPan.y) &&
                Math.abs(this.state.listenPan.x) / this.state.widthWindow > 0.4)
        {
            // Need to delete the massage
            Animated.spring( this.state.pan,
                            {toValue: { x: this.state.listenPan.x * 3,
                                        y: this.state.listenPan.y * 3}}).start();

            if (!this.props.isTop && this.props.thoughtindex !== -1)
                this.props._deleteThought(this.props.felling).done();

            this.props.goMain();
            this.state.pan.setValue({x: 0, y: 0});

            if (this.props.isTop)
                this._inputText.setNativeProps({text:''});
        }
        else
            Animated.spring( this.state.pan,
                            {toValue: {x: 0, y: 0}}
            ).start();
        if (this.props.isTop)
            this._inputText.setNativeProps({editable : true});
    }



    render() {
        return (
            <Animated.View
                    {...this.state.panResponder.panHandlers}
                    style={this.state.pan.getLayout()}>

                {
                this.props.isTop &&
                <TextInput style={{
                                    height : 300,
                                    width: 300,
                                    fontSize : 30,
                                    fontFamily : 'courier new',
                                    backgroundColor: '#e5eaf6',
                                    }}
                            multiline={true}
                            returnKeyType={'done'}
                            ref={component => this._inputText = component}
                            maxLength={1027}
                            autoFocus={false}
                            onChangeText={(text) => this.setState({text})}
                            editable={this.props.isTop}
                />
                }

                {
                !this.props.isTop &&
                <Text style={{
                                height : 300,
                                width: 300,
                                fontSize : 30,
                                fontFamily : 'courier new',
                                backgroundColor: '#e5eaf6',
                                }}
                        multiline={true}
                        ref={component => this._inputText = component}
                        maxLength={1027}
                >
                {this.props.text}
                </Text>
                }

            </Animated.View>
        );
    }
}