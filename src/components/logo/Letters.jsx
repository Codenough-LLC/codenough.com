import React from 'react';

import LetterC from './letters/LetterC';
import LetterO from './letters/LetterO';
import LetterD from './letters/LetterD';
import LetterE from './letters/LetterE';
import LetterN from './letters/LetterN';
import LetterU from './letters/LetterU';
import LetterG from './letters/LetterG';
import LetterH from './letters/LetterH';

class Letters extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            lastClickedItems: [],
            clickedItemsTimeout: null
        };
    }

    handleClickedItem(clickedItem) {
        clearTimeout(this.state.clickedItemsTimeout);

        const lastClickedItems = [
            ...this.state.lastClickedItems,
            clickedItem
        ];

        this.setState({
            lastClickedItems,
            clickedItemsTimeout: setTimeout(() => {
                this.setState({
                    lastClickedItems: []
                })
            }, 1000)
        });

        if (this.checkClickedItemsSequence(lastClickedItems)) {
            window.location.href = '/create-invoice';
        }
    }

    checkClickedItemsSequence(lastClickedItems) {
        const items = [...lastClickedItems];

        return items.pop() === 'LetterO2' && items.pop() === 'LetterO1';
    }

    render() {
        return (
            <div className="logo-letters">
                <LetterC className="letter letter-c"></LetterC>
                <br></br>
                <LetterO onClick={() => this.handleClickedItem('LetterO1')} className="letter letter-o-1"></LetterO>
                <br></br>
                <LetterD className="letter letter-d"></LetterD>
                <br></br>
                <LetterE className="letter letter-e"></LetterE>
                <br></br>
                <LetterN className="letter letter-n"></LetterN>
                <br></br>
                <LetterO onClick={() => this.handleClickedItem('LetterO2')} className="letter letter-o-2"></LetterO>
                <br></br>
                <LetterU className="letter letter-u"></LetterU>
                <br></br>
                <LetterG className="letter letter-g"></LetterG>
                <br></br>
                <LetterH className="letter letter-h"></LetterH>
            </div>
        );
    }
}

export default Letters;
