import React from 'react';
import { Helmet } from 'react-helmet';
import netlifyIdentity from 'netlify-identity-widget';
import {
    BrowserRouter as Router,
    Route,
    Navigate,
    Routes
} from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faArrowDown, faCloud } from '@fortawesome/free-solid-svg-icons';

import StrangerThingsSocketContext, { StrangerThingsSocket } from './contexts/StrangerThingsSocketContext';
import DotChaserSocketContext, { DotChaserSocket } from './contexts/DotChaserSocketContext';
import InternalPageLayout from './components/InternalPageLayout';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import CreateInvoicePage from './pages/CreateInvoicePage';
import CreateContractPage from './pages/CreateContractPage';
import SkydivingGame from './components/SkydivingGame';
import StrangerThings from './components/stranger-things/StrangerThings';
import DotChaser from './components/dot-chaser/DotChaser';
import AudioVisualizer from './components/equalizer/AudioVisualizer';

library.add(faArrowDown, faCloud);

const App = () =>
    <>
        <Helmet>
            <link href="https://fonts.googleapis.com/css?family=Roboto|Montserrat&display=swap" rel="stylesheet"></link>
        </Helmet>
        <Router>
            <Routes>
                <Route exact path="/" element={<HomePage />} />
                <Route path="/login" element={<InternalPageLayout pageTitle="Login"><LoginPage /></InternalPageLayout>} />
                <Route path="/skydiving" element={<SkydivingGame />} />
                <Route path="/stranger-things" element={
                    <StrangerThingsSocketContext.Provider value={StrangerThingsSocket}>
                        <StrangerThings />
                    </StrangerThingsSocketContext.Provider>
                } />
                <Route path="/dot-chaser" element={
                    <DotChaserSocketContext.Provider value={DotChaserSocket}>
                        <DotChaser />
                    </DotChaserSocketContext.Provider>
                } />
                <Route path="/audio-visualizer" element={
                    <AudioVisualizer />
                } />
                <Route path="/create-invoice" element={
                    <ProtectedRoute redirectPath="/create-invoice">
                        <InternalPageLayout pageTitle="Create Invoice"><CreateInvoicePage /></InternalPageLayout>
                    </ProtectedRoute>
                } />
                <Route path="/create-contract" element={<InternalPageLayout pageTitle="Create Contract"><CreateContractPage /></InternalPageLayout>} />
                <Route path="*" element={<Navigate to={'/'} replace />} />
            </Routes>
        </Router>
    </>;

const ProtectedRoute = ({
    redirectPath,
    children
}) => {
    return netlifyIdentity.currentUser() ? children : <Navigate to={`/login?redirect=${redirectPath}`} replace />;
};

export default App;
