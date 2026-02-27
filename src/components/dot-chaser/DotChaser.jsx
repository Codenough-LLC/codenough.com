import React from 'react';
import ShortUniqueId from 'short-unique-id';
import DotChaserSocketContext from '../../contexts/DotChaserSocketContext';
import { Button, Form, FormFeedback, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import { areClose } from '../../utils/geolocation-helpers';

const roomUniqueId = new ShortUniqueId({ length: 6, dictionary: 'alphanum_upper' });
const playerUniqueId = new ShortUniqueId({ length: 12 });

const gameRoles = { chaser: 'chaser', chasee: 'chasee' };
const geolocationFoundEvent = 'geolocation-found';
const geolocationJoinEvent = 'geolocation-join';
const joinRoomSocketEvent = 'join-room';
const nextMoveSocketEvent = 'next-move';
const gameStateChangeSocketEvent = 'game-state-change';

const gameBoardPositions = new Map([
  ['[1,1]', { top: 0, left: 0 }],
  ['[1,2]', { top: 0, left: '50%', transform: 'translateX(-50%)' }],
  ['[1,3]', { top: 0, left: '100%', transform: 'translateX(-100%)' }],
  ['[2,1]', { top: '40%', left: 0 }],
  ['[2,2]', { top: '40%', left: '50%', transform: 'translateX(-50%)' }],
  ['[2,3]', { top: '40%', left: '100%', transform: 'translateX(-100%)' }],
  ['[3,1]', { top: '80%', left: 0 }],
  ['[3,2]', { top: '80%', left: '50%', transform: 'translateX(-50%)' }],
  ['[3,3]', { top: '80%', left: '100%', transform: 'translateX(-100%)' }]
]);

const DotChaser = () => {
  const socket = React.useContext(DotChaserSocketContext);

  const [gameOverModalOpen, setGameOverModalOpen] = React.useState(false);
  const [playerRole, setPlayerRole] = React.useState();
  const [playerNameInvalid, setPlayerNameInvalid] = React.useState(false);
  const [gameState, setGameState] = React.useState();

  const searchParams = React.useMemo(
    () => new URLSearchParams(window.location.search),
    []
  );
  const roomId = searchParams.get('roomId');
  const playerName = searchParams.get('player');

  let playerId = sessionStorage.getItem('dot-chaser-private-id');
  if (!playerId) {
    playerId = playerUniqueId.randomUUID();
    sessionStorage.setItem('dot-chaser-private-id', playerId);
  }

  const handleGameStateChange = React.useCallback((gameState) => {
    setGameState(gameState);

    if (gameState.playerNames[gameRoles.chaser] === playerName) {
      setPlayerRole(gameRoles.chaser);
    } else if (gameState.playerNames[gameRoles.chasee] === playerName) {
      setPlayerRole(gameRoles.chasee);
    }
  }, [playerName]);

  React.useEffect(() => {
    socket.on('connect', () => {
      console.log('socket connected');

      if (roomId) {
        socket.emit(joinRoomSocketEvent, {
          roomId,
          playerId,
          playerName
        }, handleGameStateChange);
      }
    });

    socket.on(geolocationFoundEvent, (geolocation) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (areClose(position, JSON.parse(geolocation))) {
            socket.off(geolocationFoundEvent);
            const roomId = roomUniqueId.randomUUID();
            socket.emit(geolocationJoinEvent, JSON.stringify(position), roomId, gameRoles.chaser);
            socket.off(geolocationJoinEvent);
            searchParams.set('roomId', roomId);
            window.location.search = searchParams.toString();
          }
        },
        (error) => { console.error(error); },
        { enableHighAccuracy: true }
      );
    });

    socket.on(geolocationJoinEvent, (geolocation, roomId) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (areClose(position, JSON.parse(geolocation))) {
            socket.off(geolocationFoundEvent);
            socket.emit(geolocationJoinEvent, JSON.stringify(geolocation), roomId, gameRoles.chasee);
            socket.off(geolocationJoinEvent);
            searchParams.set('roomId', roomId);
            window.location.search = searchParams.toString();
          }
        },
        (error) => { console.error(error); },
        { enableHighAccuracy: true }
      );
    });

    return () => {
      socket.off(geolocationFoundEvent);
      socket.off(geolocationJoinEvent);
    }
  }, [socket, handleGameStateChange, playerId, playerName, roomId, searchParams]);

  React.useEffect(() => {
    socket.on(gameStateChangeSocketEvent, handleGameStateChange);

    return () => {
      socket.off(gameStateChangeSocketEvent);
    };
  }, [socket, handleGameStateChange]);

  React.useEffect(() => {
    if (gameOverModalOpen || !gameState) {
      return;
    }

    const chaserCoords = gameState.currentPositions[gameRoles.chaser];
    const chaseeCoords = gameState.currentPositions[gameRoles.chasee];

    if (JSON.stringify(chaserCoords) === JSON.stringify(chaseeCoords)) {
      setTimeout(() => { setGameOverModalOpen(true) }, 1000);
    }
  }, [gameState, gameOverModalOpen]);

  if (!roomId) {
    return (
      <div>
        <Row style={{ margin: '16px' }}>
          <Button>Invite an opponent 🔗</Button>
        </Row>
        <Row style={{ margin: '16px' }}>
          <Button disabled={!navigator.geolocation} onClick={() => {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                socket.emit(geolocationFoundEvent, JSON.stringify(position));
              },
              (error) => { console.error(error); },
              { enableHighAccuracy: true }
            );
          }
          }>Find an opponent close to you! 🌎</Button>
        </Row>
      </div >
    );
  }

  if (!playerName) {
    const maxPlayerNameLength = 50;
    const handleFormSubmit = (event) => {
      event.preventDefault();
      const inputValue = document.getElementById('playerName').value;
      const inputLength = inputValue?.length;
      if (!inputLength || inputLength > maxPlayerNameLength) {
        setPlayerNameInvalid(true);
      } else {
        setPlayerNameInvalid(false);
        searchParams.set('player', inputValue);
        window.location.search = searchParams.toString();
      }
    };
    return <div>
      <Form onSubmit={handleFormSubmit}>
        <Label for="playerName">
          What is your name?
        </Label>
        <Input maxLength={maxPlayerNameLength} id="playerName" invalid={playerNameInvalid} />
        {playerNameInvalid && <FormFeedback>
          Invalid name
        </FormFeedback>}
        <Button onClick={handleFormSubmit}>Save name</Button>
      </Form>
    </div>
  }

  const getBoardGameSpaceDot = (coords) => {
    const indicator = '🔘';
    let isPossibleNextMove = false;
    if (gameState) {
      const otherPlayerCoords = gameState.currentPositions[
        playerRole === gameRoles.chaser ? gameRoles.chasee : gameRoles.chaser
      ];
      const playerCoords = gameState.currentPositions[playerRole];
      if ((coords[0] !== playerCoords[0] || coords[1] !== playerCoords[1]) &&
        Math.abs(coords[0] - playerCoords[0]) <= 1 &&
        Math.abs(coords[1] - playerCoords[1]) <= 1 &&
        !(coords[0] === otherPlayerCoords[0] && coords[1] === otherPlayerCoords[1])
      ) {
        isPossibleNextMove = true;
      }
    }

    return <span
      style={{
        opacity: isPossibleNextMove ? 1 : 0.5,
        cursor: isPossibleNextMove ? 'pointer' : 'default'
      }}
      onClick={() => {
        isPossibleNextMove && socket.emit(nextMoveSocketEvent, { roomId, playerId, nextMove: coords });
      }}
    >
      {indicator}
    </span>
  }

  const getBoardGamePlayerDots = () => {
    if (gameState) {
      const chaserCoords = gameState.currentPositions[gameRoles.chaser];
      const chaseeCoords = gameState.currentPositions[gameRoles.chasee];

      return <>
        <span style={{ transition: 'top 1s, left 1s', position: 'absolute', ...gameBoardPositions.get(JSON.stringify(chaserCoords)) }}>{'🔴'}</span>
        <span style={{ transition: 'top 1s, left 1s', position: 'absolute', ...gameBoardPositions.get(JSON.stringify(chaseeCoords)) }}>{'🔵'}</span>
      </>;
    }

    return null;
  }

  return (
    <>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div>{`You are in room ${roomId}`}</div>
          <div>{`You are ${playerName}, the ${playerRole}`}</div>
        </div>

        <div style={{
          position: 'relative',
          height: 'min(90vh, 90vw)',
          width: 'min(90vh, 90vw)',
          fontSize: '6rem'
        }}>
          <span style={{ position: 'absolute', ...gameBoardPositions.get('[1,1]') }}>
            {getBoardGameSpaceDot([1, 1])}
          </span>
          <span style={{ position: 'absolute', ...gameBoardPositions.get('[1,2]') }}>
            {getBoardGameSpaceDot([1, 2])}
          </span>
          <span style={{ position: 'absolute', ...gameBoardPositions.get('[1,3]') }}>
            {getBoardGameSpaceDot([1, 3])}
          </span>
          <span style={{ position: 'absolute', ...gameBoardPositions.get('[2,1]') }}>
            {getBoardGameSpaceDot([2, 1])}
          </span>
          <span style={{ position: 'absolute', ...gameBoardPositions.get('[2,2]') }}>
            {getBoardGameSpaceDot([2, 2])}
          </span>
          <span style={{ position: 'absolute', ...gameBoardPositions.get('[2,3]') }}>
            {getBoardGameSpaceDot([2, 3])}
          </span>
          <span style={{ position: 'absolute', ...gameBoardPositions.get('[3,1]') }}>
            {getBoardGameSpaceDot([3, 1])}
          </span>
          <span style={{ position: 'absolute', ...gameBoardPositions.get('[3,2]') }}>
            {getBoardGameSpaceDot([3, 2])}
          </span>
          <span style={{ position: 'absolute', ...gameBoardPositions.get('[3,3]') }}>
            {getBoardGameSpaceDot([3, 3])}
          </span>
          {getBoardGamePlayerDots()}
        </div>
      </div>

      <Modal isOpen={gameOverModalOpen} toggle={() => setGameOverModalOpen(false)}>
        <ModalHeader toggle={() => setGameOverModalOpen(false)}>Game Over</ModalHeader>
        <ModalBody>
          The game is now over.
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={() => setGameOverModalOpen(false)}>
            Play Again
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default DotChaser;
