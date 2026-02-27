import React, {useCallback, useState} from 'react';
import {Progress} from 'reactstrap';
import {Unity, useUnityContext} from 'react-unity-webgl';

function SkydivingGame() {
    const {unityProvider, loadingProgression, isLoaded} = useUnityContext({
        loaderUrl: "skydiving-game/Build/skydiving-game.loader.js",
        dataUrl: "skydiving-game/Build/skydiving-game.data",
        frameworkUrl: "skydiving-game/Build/skydiving-game.framework.js",
        codeUrl: "skydiving-game/Build/skydiving-game.wasm",
    });

    const [devicePixelRatio, setDevicePixelRatio] = useState(window.devicePixelRatio);

    useCallback(() => {
        const updateDevicePixelRatio = function () {
            setDevicePixelRatio(window.devicePixelRatio);
        };

        const mediaMatcher = window.matchMedia(
            `screen and (resolution: ${devicePixelRatio}dppx)`
        );

        mediaMatcher.addEventListener("change", updateDevicePixelRatio);

        return function () {
            mediaMatcher.removeEventListener("change", updateDevicePixelRatio);
        };
    }, [devicePixelRatio]);

    const loadingPercentage = Math.round(loadingProgression * 100);

    return (
        <>
            {!isLoaded && <Progress
                animated
                color="success"
                value={loadingPercentage}
                style={{height: '32px'}}
            />}
            <Unity
                unityProvider={unityProvider}
                style={{width: '100vw', height: '100vh', visibility: isLoaded ? "visible" : "hidden"}}
                devicePixelRatio={devicePixelRatio}
            />
        </>
    );
}

export default SkydivingGame;
