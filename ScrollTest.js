import React, {Component} from 'react';
import {View,
        StyleSheet,
        Dimensions,
        PanResponder,
        AsyncStorage,
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

            this._loadThought = this._loadThought.bind(this);
            this._saveThought = this._saveThought.bind(this);
            this._deleteThought = this._deleteThought.bind(this);

            this.goBackToMain = this.goBackToMain.bind(this);

            this._initialLoadData = this._initialLoadData.bind(this);

            this.state = {flexValue: new Animated.Value(0),
                            smileysFlex: new Animated.Value(0),
                            listenToFlexValue: 0,
                            listenToSmileyFlex: 0,
                            slide: enumSlide.Center,
                            smiley: enumSmiley.None,
                            canPress: false,
                            heightWindow: Dimensions.get('window').height,
                            widthWindow: Dimensions.get('window').width,
                        	data: require('./Thoughts'),
                        	felling: -1}
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

        this._initialLoadData().done();
    }

    _initialLoadData = async() =>
    {
        try{
            var value = await AsyncStorage.getItem(this.state.data.KEY_STORAGE);
            if (value !== null)
            {
                this.setState({data:{...this.state.data, keyList: JSON.parse(value)}});
                this.forceUpdate();
                console.log('Key List load');
            }
            else
            {
                console.log('No Key List on storage disk. Creating one.');
                this.setState({data:{...this.state.data, keyList: [{index: 0, list: []},{index: 0, list: []},{index: 0, list: []}]}});
                this._setKeyList();
            }
        }
        catch(error){
            console.log(error.message);
        }
        console.log( 'value = ' + value );
    }

    _setKeyList = async() =>
    {
        try{
            AsyncStorage.setItem(this.state.data.KEY_STORAGE, JSON.stringify(this.state.data.keyList));
            console.log('Key List saved.');
        }
        catch(error){
            console.log('Fall to save key list: ' + error.message);
        }
    }

    _replace(curVal, index){
        if (index === this.props.felling)
            return {text: this.state.text, index: this.state.index};
        else
            return curVal;
    }

    _loadThought = async(felling) =>
    {
        console.log('keyList of ' + felling.toString() + ' inside Smiley: '
                    + this.state.data.keyList[felling].index.toString() + ' with ' +
                    this.state.data.keyList[felling].list.toString());
        if (this.state.data.keyList[felling].list.length === 0)
        {
            console.log('En effet! C\'est vide! LOL!!');

            this.setState({data : {...this.state.data,
                                    thought : {text: 'No thought...', index: -1}},
                				text: 'No thought...',
                				index: -1});
            return;
        }
        try{
            var index = Math.floor(Math.random() * this.state.data.keyList[felling].list.length);
            console.log('bim');
            var value = await AsyncStorage.getItem(this.state.data.KEY_THOUGHT[felling] +
                                                   this.state.data.keyList[felling].list[index]);
            console.log('OK');
            if (value !== null)
            {
                this.setState({data : {...this.state.data, 
                                        thought : { text: JSON.parse(value).text,
                                					index: parseInt(this.state.data.keyList[felling].list[index])}},
                				text: JSON.parse(value).text,
                				index: parseInt(this.state.data.keyList[felling].list[index])});

                console.log('Thought loaded: ' + this.state.data.thought.text);
            }
            else
            {
                this.setState({data : {...this.state.data, 
                                        thought : { text: 'Trouble with thought index: ' + index.toString(),
                                					index: -1}},
                				text: 'Trouble with thought index: ' + index.toString(),
                				index: -1});
            }

        }
        catch(error){
            console.log(error.message);
        }
    }

    _delete(curVal, index){
        if (index === this.state.felling)
            return {index: curVal.index, 
                    list: curVal.list.filter((e, index) => index !== this.state.data.thought.index)};
        else
            return curVal;
    }

    _deleteThought = async(felling) =>
    {
        try{
        	let list = this.state.data.keyList.slice();
        	list[felling] = {index: list[felling].index, list: list[felling].list.filter((e, index) => e !== this.state.index)};
            this.setState({data : {...this.state.data, 
                                    keyList: list
                            }});

            console.log('Thought delete');
            AsyncStorage.setItem(this.state.data.KEY_STORAGE, JSON.stringify(this.state.data.keyList));
            console.log('Key List saved.');
        }
        catch(error){
            console.log('Fall to save key list: ' + error.message);
        }
    }

    _save(curVal, index){
        if (index === this.props.felling)
            return {index: curVal.index + 1, 
                    list: curVal.list.concat(curVal.index.toString())};
        else
            return curVal;
    }

    _saveThought = async(newText, felling) =>
    {
        try{
            const index = this.state.data.keyList[felling].index;

            AsyncStorage.setItem(this.state.data.KEY_THOUGHT[felling] + index.toString(),
                                JSON.stringify({text: newText}));

            console.log('Thought "' + newText + '" saved.');

        	let list = this.state.data.keyList.slice();
        	list[felling] = {index: list[felling].index + 1, list: list[felling].list.concat(list[felling].index)};
            this.setState({data : {...this.state.data, 
                                    keyList: list
                            }});

            console.log('Index push inside key list.', 'Index increment inside key list.');
            console.log('keyList of ' + felling.toString() + ' inside ThoughtView: '
                        + this.state.data.keyList[felling].index.toString() + ' with ' +
                        this.state.data.keyList[felling].list.toString())

            AsyncStorage.setItem(this.state.data.KEY_STORAGE, JSON.stringify(this.state.data.keyList));
            console.log('Key List saved.');
        }
        catch(error){
            console.log('Fall to save thought or/and key list: ' + error.message);
        }
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

    moveAnimation(value, _delay = 0)
    {
        Animated.timing(
            this.state.flexValue,
            {toValue: value,
            delay: _delay}
        ).start(() => {
            if (Math.abs(this.state.listenToFlexValue) === 100)
                this.setState({canPress: true});
            else if (this.state.listenToFlexValue === 0)
                this.setState({canPress: false});
        });
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

    moveSmileysFlex(_smiley, _delay = 0)
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
                {toValue: value,
                delay: _delay}
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
            this.moveSmileysFlex(this.state.smiley, 500);
        this.state.slide = enumSlide.Center;
        this.moveAnimation(0, 100);
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
                            felling={enumSmiley.Happy}
                            moveSmiley={this.moveHappySmiley}
                            flexValue={this.state.flexValue}
                            imgRange={[0, 0, 1]}
                            smiley={this.state.smiley}
                            goMain={this.goBackToMain}
                            isTop={true}
                            canPress={this.state.canPress}
                            data={this.state.data}
                            text={this.state.text}
                            index={this.state.index}
            				_loadThought={this._loadThought}
            				_saveThought={this._saveThought}
            				_deleteThought={this._deleteThought}
                            />

                    <Smiley smileysFlex={this.state.smileysFlex}
                            felling={enumSmiley.Neutral}
                            moveSmiley={this.moveNeutralSmiley}
                            flexValue={this.state.flexValue}
                            imgRange={[0, 0, 1]}
                            smiley={this.state.smiley}
                            goMain={this.goBackToMain}
                            isTop={true}
                            canPress={this.state.canPress}
                            data={this.state.data}
                    		text={this.state.text}
                            index={this.state.index}
            				_loadThought={this._loadThought}
            				_saveThought={this._saveThought}
            				_deleteThought={this._deleteThought}
                            />

                    <Smiley smileysFlex={this.state.smileysFlex}
                            felling={enumSmiley.Sad}
                            moveSmiley={this.moveSadSmiley}
                            flexValue={this.state.flexValue}
                            imgRange={[0, 0, 1]}
                            smiley={this.state.smiley}
                            goMain={this.goBackToMain}
                            isTop={true}
                            canPress={this.state.canPress}
                            data={this.state.data}
                            text={this.state.text}
                            index={this.state.index}
            				_loadThought={this._loadThought}
            				_saveThought={this._saveThought}
            				_deleteThought={this._deleteThought}                            
                            />
                </Animated.View>


                <CenterText flexValue={this.state.flexValue}/>


                <Animated.View style={{flex: this.state.flexValue.interpolate({
                                                                 inputRange: [-100, 0, 100],
                                                                 outputRange: [100, 1, 1]
                                                                 }),
                                        flexDirection: 'row'}}>

                   <Smiley felling={enumSmiley.Happy}
                           smileysFlex={this.state.smileysFlex}
                           moveSmiley={this.moveHappySmiley}
                           flexValue={this.state.flexValue}
                           imgRange={[1, 0, 0]}
                           smiley={this.state.smiley}
                           goMain={this.goBackToMain}
                           isTop={false}
                           canPress={this.state.canPress}
                           data={this.state.data}
                            text={this.state.text}
                            index={this.state.index}
            				_loadThought={this._loadThought}
            				_saveThought={this._saveThought}
            				_deleteThought={this._deleteThought}                           
                           />

                   <Smiley felling={enumSmiley.Neutral}
                           smileysFlex={this.state.smileysFlex}
                           moveSmiley={this.moveNeutralSmiley}
                           flexValue={this.state.flexValue}
                           imgRange={[1, 0, 0]}
                           smiley={this.state.smiley}
                           goMain={this.goBackToMain}
                           isTop={false}
                           canPress={this.state.canPress}
                           data={this.state.data}
                            text={this.state.text}
                            index={this.state.index}
            				_loadThought={this._loadThought}
            				_saveThought={this._saveThought}
            				_deleteThought={this._deleteThought}                           
                           />

                   <Smiley felling={enumSmiley.Sad}
                           smileysFlex={this.state.smileysFlex}
                           moveSmiley={this.moveSadSmiley}
                           flexValue={this.state.flexValue}
                           imgRange={[1, 0, 0]}
                           smiley={this.state.smiley}
                           goMain={this.goBackToMain}
                           isTop={false}
                           canPress={this.state.canPress}
                           data={this.state.data}
                            text={this.state.text}
                            index={this.state.index}
            				_loadThought={this._loadThought}
            				_saveThought={this._saveThought}
            				_deleteThought={this._deleteThought}                           
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