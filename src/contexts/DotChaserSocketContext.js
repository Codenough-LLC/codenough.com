import React from 'react';
import io from 'socket.io-client';

export const DotChaserSocket = process.env.REACT_APP_LOCAL_RUN ? io('http://localhost:7242') : io('https://lounsbrough.com/', {path: '/dot-chaser/socket.io'});

export default React.createContext(DotChaserSocket);
