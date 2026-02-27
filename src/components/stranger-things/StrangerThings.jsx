import React from 'react';
import ShortUniqueId  from 'short-unique-id';
import StrangerThingsSocketContext from '../../contexts/StrangerThingsSocketContext';
import LightsWallSvg from './LightsWallSvg';
import lightBulbConfigs from '../../data/light-bulb-configs.json';

const uid = new ShortUniqueId({
    length: 6,
    dictionary: 'alphanum_upper'
});

const letterStateChangeSocketEvent = 'letter-state-change';
const joinRoomSocketEvent = 'join-room';

const StrangerThings = () => {
    const socket = React.useContext(StrangerThingsSocketContext);

    const [letterStates, setLetterStates] = React.useState(lightBulbConfigs.map((config) => ({
        letter: config.letter,
        on: false
    })));

    const searchParams = new URLSearchParams(window.location.search);
    const roomId = searchParams.get('roomId');

    React.useEffect(() => {
        socket.on('connect', () => {
            roomId && socket.emit(joinRoomSocketEvent, roomId, (newLetterStates) => {
                setLetterStates(newLetterStates);
            });
        });

        socket.on(letterStateChangeSocketEvent, (newLetterStates) => {
            setLetterStates(newLetterStates);
        });

        return () => {
            socket.off(letterStateChangeSocketEvent);
        };
    }, [roomId, socket]);

    if (!roomId) {
        window.location.replace(`${window.location.protocol}//${window.location.host}${window.location.pathname}?roomId=${uid.randomUUID()}`);

        return;
    }

    return (
        <div className="stranger-things-wall">
            <LightsWallSvg
                letterStates={letterStates}
                handleLetterStateChanged={(letter, on) => {
                    const newLetterStates = [...letterStates];

                    newLetterStates.find((letterState) => letterState.letter === letter).on = on;

                    setLetterStates([...newLetterStates]);

                    socket.emit(letterStateChangeSocketEvent, {
                        letter,
                        on
                    });
                }}
            />
        </div>
    );
};

export default StrangerThings;
