import React, {Component} from 'react';
import {View,
        StyleSheet,
        Dimensions,
        PanResponder,
        Animated} from 'react-native';

import CenterText from './CenterText';
import Smiley from './Smiley';
import ThoughtView from './ThoughtView';

export default class ScrollTest extends Component{

        constructor(props) {
            super(props);
            this.moveSmileysFlex = this.moveSmileysFlex.bind(this);
            this.moveAnimation = this.moveAnimation.bind(this);

            this.moveHappySmiley = this.moveHappySmiley.bind(this);
            this.moveNeutralSmiley = this.moveNeutralSmiley.bind(this);
            this.moveSadSmiley = this.moveSadSmiley.bind(this);

            this.goBackToMain = this.goBackToMain.bind(this);

            this.state = {flexValue: new Animated.Value(0),
                            smileysFlex: new Animated.Value(0),
                            listenToFlexValue: 0,
                            listenToSmileyFlex: 0,
                            slide: enumSlide.Center,
                            smiley: enumSmiley.None,
                            heightWindow: Dimensions.get('window').height,
                            widthWindow: Dimensions.get('window').width}
        }

    componentWillMount() {
        this.state.flexValue.addListener((value) => this.state.listenToFlexValue = value.value);
        this.state.smileysFlex.addListener((value) => this.state.listenToSmileyFlex = value.value);


        this._panResponder = PanResponder.create({
            onMoveShouldSetPanResponder: (evt, gestureState) => this.state.smiley === enumSmiley.None,
            onPanResponderMove: (evt, gestureState) => this.moveUpView(gestureState.dy),
            onPanResponderRelease: () => this.moveFinished(),
            onPanResponderTerminate: () => this.moveFinished(),
        })
    }

    moveUpView(top) {
        if (this.state.slide === enumSlide.Up && top < 0) {
            this.state.flexValue.setValue(100 - (-top) / this.state.heightWindow * 100);
        } else if (this.state.slide === enumSlide.Center) {
            this.state.flexValue.setValue((top) / this.state.heightWindow * 100);
        }
        else if(this.state.slide === enumSlide.Down && top > 0) {
           this.state.flexValue.setValue(-100 + (top) / this.state.heightWindow * 100);
        }
    }

    moveAnimation(value)
    {
        Animated.timing(
            this.state.flexValue,
            {toValue: value}
        ).start();
    }

    moveHappySmiley()
    {
        this.moveSmileysFlex(enumSmiley.Happy);
    }

    moveNeutralSmiley()
    {
        this.moveSmileysFlex(enumSmiley.Neutral);
    }

    moveSadSmiley()
    {
        this.moveSmileysFlex(enumSmiley.Sad);
    }

    moveSmileysFlex(_smiley)
    {
        if (this.state.slide !== enumSlide.Center)
        {
            let value = this.state.listenToSmileyFlex;

            if (this.state.smiley === enumSmiley.None)
            {
                switch(_smiley){
                case enumSmiley.Happy :
                    this.state.smileysFlex.setValue(0);
                    value = 100;
                    break;
                case enumSmiley.Neutral :
                    this.state.smileysFlex.setValue(200);
                    value = 300;
                    break;
                case enumSmiley.Sad :
                    this.state.smileysFlex.setValue(400);
                    value = 500;
                    break;
                }
                this.setState({smiley: _smiley});
            }
            else
            {
                value = value - 100;
                this.setState({smiley: enumSmiley.None});
            }
            Animated.timing(
                this.state.smileysFlex,
                {toValue: value}
            ).start();
        }
    }

    moveFinished()
    {
        let value = this.state.listenToFlexValue;
        if (this.state.slide === enumSlide.Center)
        {
            if (value > 25)
            {
                value = 100;
                this.state.slide = enumSlide.Up;
            }
            else if (value < -25)
            {
                value = -100;
                this.state.slide = enumSlide.Down;
            }
            else
                value = 0;
         }
        else if (this.state.slide === enumSlide.Up)
        {
            if(value < 75)
            {
                value = 0;
                if (this.state.smiley !== enumSmiley.None)
                    this.moveSmileysFlex(this.state.smiley);
                this.state.slide = enumSlide.Center;
            }
            else
                value = 100;
        }
        else if (this.state.slide === enumSlide.Down)
        {
            if(value > -75)
            {
                value = 0;
                if (this.state.smiley !== enumSmiley.None)
                    this.moveSmileysFlex(this.state.smiley);
                this.state.slide = enumSlide.Center;
            }
            else
                value = -100;
        }

        this.moveAnimation(value);
    }

    goBackToMain()
    {
        if (this.state.smiley !== enumSmiley.None)
            this.moveSmileysFlex(this.state.smiley);
        this.state.slide = enumSlide.Center;
        this.moveAnimation(0);
    }

	render(){
		return (
			<View
			 style={{flex: 1, flexDirection: 'column'}}
                {...this._panResponder.panHandlers}
			 >

                <Animated.View style={{flex: this.state.flexValue.interpolate({
                                                                 inputRange: [-100, 0, 100],
                                                                 outputRange: [1, 1, 100]
                                                                 }),
                                        flexDirection: 'row'}}>

                    <Smiley smileysFlex={this.state.smileysFlex}
                            bandRange={[10000, 10000, 10000, 1, 10000, 1]}
                            color={'#002fa7'}
                            moveSmiley={this.moveHappySmiley}
                            smileyImg={require('./images/happySmiley.png')}
                            flexValue={this.state.flexValue}
                            imgRange={[0, 0, 1]}
                            smiley={this.state.smiley}
                            goMain={this.goBackToMain}
                            />

                    <Smiley smileysFlex={this.state.smileysFlex}
                            bandRange={[10000, 1, 10000, 10000, 10000, 1]}
                            color={'#4c6dc1'}
                            moveSmiley={this.moveNeutralSmiley}
                            smileyImg={require('./images/neutralSmiley.png')}
                            flexValue={this.state.flexValue}
                            imgRange={[0, 0, 1]}
                            smiley={this.state.smiley}
                            goMain={this.goBackToMain}
                            />

                    <Smiley smileysFlex={this.state.smileysFlex}
                            bandRange={[10000, 1, 10000, 1, 10000, 10000]}
                            color={'#99abdb'}
                            moveSmiley={this.moveSadSmiley}
                            smileyImg={require('./images/sadSmiley.png')}
                            flexValue={this.state.flexValue}
                            imgRange={[0, 0, 1]}
                            smiley={this.state.smiley}
                            goMain={this.goBackToMain}
                            />
                </Animated.View>


                <CenterText flexValue={this.state.flexValue}/>


                <Animated.View style={{flex: this.state.flexValue.interpolate({
                                                                 inputRange: [-100, 0, 100],
                                                                 outputRange: [100, 1, 1]
                                                                 }),
                                        flexDirection: 'row'}}>

                   <Smiley smileysFlex={this.state.smileysFlex}
                           bandRange={[10000, 10000, 10000, 1, 10000, 1]}
                           color={'#002fa7'}
                           moveSmiley={this.moveHappySmiley}
                           smileyImg={require('./images/happySmiley.png')}
                           flexValue={this.state.flexValue}
                           imgRange={[1, 0, 0]}
                           smiley={this.state.smiley}
                           goMain={this.goBackToMain}
                           />

                   <Smiley smileysFlex={this.state.smileysFlex}
                           bandRange={[10000, 1, 10000, 10000, 10000, 1]}
                           color={'#4c6dc1'}
                           moveSmiley={this.moveNeutralSmiley}
                           smileyImg={require('./images/neutralSmiley.png')}
                           flexValue={this.state.flexValue}
                           imgRange={[1, 0, 0]}
                           smiley={this.state.smiley}
                           goMain={this.goBackToMain}
                           />

                   <Smiley smileysFlex={this.state.smileysFlex}
                           bandRange={[10000, 1, 10000, 1, 10000, 10000]}
                           color={'#99abdb'}
                           moveSmiley={this.moveSadSmiley}
                           smileyImg={require('./images/sadSmiley.png')}
                           flexValue={this.state.flexValue}
                           imgRange={[1, 0, 0]}
                           smiley={this.state.smiley}
                           goMain={this.goBackToMain}
                           />

                </Animated.View>
			</View>
		)
	}

}

enumSlide = {
    Up : 1,
    Center : 0,
    Down : -1
}

enumSmiley = {
    None : -1,
    Happy : 0,
    Neutral : 1,
    Sad : 2
}

const styles = StyleSheet.create({
    center : {
        flex : 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor : '#e5eaf6'
    }
})