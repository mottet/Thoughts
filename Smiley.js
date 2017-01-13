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
            this._loadThought = this._loadThought.bind(this);
            this._saveThought = this._saveThought.bind(this);
            this._deleteThought = this._deleteThought.bind(this);

            this.state = {
                textFlex: new Animated.Value(0),
                listenTextFlex: 0,
                listenFlexValue: 0,
                heightWindow: Dimensions.get('window').height,
                widthWindow: Dimensions.get('window').width,
                bandRange: paramSmiley.bandRange[this.props.felling],
                color: paramSmiley.color[this.props.felling],
                smileyImg: paramSmiley.smileyImg[this.props.felling],
                text: '',
                index: -1,
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
                    this._loadThought().done();
                Animated.timing(
                    this.state.textFlex,
                    {toValue: 1,
                     delay: 600
                    }
                ).start();
            }
        }

        _replace(curVal, index){
            if (index === this.props.felling)
                return {text: this.state.text, index: this.state.index};
            else
                return curVal;
        }

        _loadThought = async() =>
        {
            console.log('keyList of ' + this.props.felling.toString() + ' inside Smiley: '
                        + this.state.data.keyList[this.props.felling].index.toString() + ' with ' +
                        this.state.data.keyList[this.props.felling].list.toString());
            if (this.state.data.keyList[this.props.felling].index === 0)
            {
                console.log('En effet! C\'est vide! LOL!!');

                this.setState({ text: 'No thought...',
                                index: -1});

                this.setState({data : {...this.state.data, 
                                        thought : this.state.data.thought.map(this._replace.bind(this))}});
                return;
            }
            try{
                var index = Math.floor(Math.random() * this.state.data.keyList[this.props.felling].list.length);
                console.log('bim');
                var value = await AsyncStorage.getItem(this.state.data.KEY_THOUGHT[this.props.felling] +
                                                       this.state.data.keyList[this.props.felling].list[index]);
                console.log('OK');
                if (value !== null)
                {
                    this.setState({ text: JSON.parse(value).text,
                                    index: index});

                    this.setState({data : {...this.state.data, 
                                            thought : this.state.data.thought.map(this._replace.bind(this))}});

                    console.log('Thought loaded: ' + this.state.data.thought[this.props.felling].text);
                }
                else
                {
                    this.setState({ text: 'Trouble with thought index: ' + index.toString(),
                                    index: -1});

                    this.setState({data : {...this.state.data, 
                                            thought : this.state.data.thought.map(this._replace.bind(this))}});
                }

            }
            catch(error){
                console.log(error.message);
            }
        }

        _delete(curVal, index){
            if (index === this.props.felling)
                return {index: curVal.index, 
                        list: curVal.list.filter((e, index) => index !== this.state.data.thought[this.props.felling].index)};
            else
                return curVal;
        }

        _deleteThought = async() =>
        {
            try{
                this.setState({data : {...this.state.data, 
                                        keyList: this.state.data.keyList.map(this._delete.bind(this))
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

        _saveThought = async(newText) =>
        {
            try{
                const index = this.state.data.keyList[this.props.felling].index;

                AsyncStorage.setItem(this.state.data.KEY_THOUGHT[this.props.felling] + index.toString(),
                                    JSON.stringify({text: newText}));

                console.log('Thought "' + newText + '"saved.');

                this.setState({data : {...this.state.data, 
                                        keyList: this.state.data.keyList.map(this._save.bind(this))
                                }});

                console.log('Index push inside key list.', 'Index increment inside key list.');
                console.log('keyList of ' + this.props.felling.toString() + ' inside ThoughtView: '
                            + this.state.data.keyList[this.props.felling].index.toString() + ' with ' +
                            this.state.data.keyList[this.props.felling].list.toString())

                AsyncStorage.setItem(this.state.data.KEY_STORAGE, JSON.stringify(this.state.data.keyList));
                console.log('Key List saved.');
            }
            catch(error){
                console.log('Fall to save thought or/and key list: ' + error.message);
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
                                    text={this.state.text}
                                    _saveThought={this._saveThought}
                                    _deleteThought={this._deleteThought}/>
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
                                    text={this.state.text}
                                    _saveThought={this._saveThought}
                                    _deleteThought={this._deleteThought}
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