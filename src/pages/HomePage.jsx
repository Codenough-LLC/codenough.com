import React from 'react';
import Matercolor from 'matercolors';
import { Button, PopoverBody, UncontrolledPopover } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { isMobile } from 'react-device-detect';

import Logo from '../components/logo/Logo';
import Letters from '../components/logo/Letters';
import Proficiencies from '../components/Proficiencies';
import Testimonials from '../components/Testimonials';
import StrangerThingsAdidasLogo from '../components/stranger-things/StrangerThingsAdidasLogo';
import { HSLToHex } from '../utils/color-functions';
import DiceSvg from '../components/DiceSvg';
import DotChaserLogo from '../components/dot-chaser/DotChaserLogo';

class HomePage extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            colorShowActive: false,
            defaultFaviconHref: null,
            hue: Math.round(Math.random() * 359),
            lastKeysDown: []
        };
    }

    componentDidMount() {
        const favicon = this.getFaviconElement();

        this.setState({
            defaultFaviconHref: favicon.href
        });

        this.randomColorShow();

        document.addEventListener("keydown", (event) => this.handleDocumentKeydown(event));
    }

    setDefaultColors() {
        document.querySelectorAll('.app-header-svg *').forEach(svgPath => {
            svgPath.style.fill = "white"
        });

        document.querySelectorAll('.app-header .logo').forEach((logo) => {
            logo.querySelectorAll('path').forEach((path, index) => {
                path.style.fill = index === 0 ? "#006680" : "#ffffff";
            });
        });

        document.querySelectorAll('.app-header .letter path').forEach(svgPath => {
            svgPath.style.fill = "inherit"
        });

        document.querySelector('.app').style.backgroundColor = "#1ccbd2";

        document.querySelectorAll('.btn-circle').forEach(circleButton => circleButton.classList.remove('btn-circle-dark'));

        const favicon = this.getFaviconElement();

        favicon.href = this.state.defaultFaviconHref;
    }

    randomColorShow() {
        if (!this.state.colorShowActive) {
            this.setDefaultColors();
        } else {
            const colorScheme = this.getRandomColorScheme();

            const svgPaths = document.querySelectorAll('.app-header-svg *');

            svgPaths.forEach((svgPath, index) => {
                svgPath.style.fill = `${colorScheme[index % colorScheme.length]}`;
            });

            document.querySelector('.app').style.backgroundColor = "#00141A";

            document.querySelectorAll('.btn-circle').forEach(circleButton => circleButton.classList.add('btn-circle-dark'));

            this.paintLogoOntoFavicon();
        }

        setTimeout(() => this.randomColorShow(), 200);
    }

    toggleColorShow() {
        this.setState({
            colorShowActive: !this.state.colorShowActive
        });
    }

    getRandomColorScheme() {
        const newHue = (this.state.hue + 1) % 360;

        this.setState({
            hue: newHue
        });

        const colorScheme = new Matercolor(HSLToHex([newHue, 100, 50]));

        return Object.values(colorScheme.palette.primary);
    }

    paintLogoOntoFavicon() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const context = canvas.getContext('2d');

        const encodedSvg = window.btoa(new XMLSerializer().serializeToString(document.querySelector('.logo')));
        const image = new Image();

        image.onload = () => {
            context.drawImage(image, 0, 0, image.width, image.height, 0, 0, 32, 32);

            const favicon = this.getFaviconElement();

            favicon.href = canvas.toDataURL("image/png");

            canvas.remove();
            image.remove();
        };

        image.src = `data:image/svg+xml;base64,${encodedSvg}`;
    }

    getFaviconElement() {
        return document.querySelector('link[rel*="icon"]');
    }

    updateLastKeysDown(newKey) {
        let lastKeysDown = this.state.lastKeysDown;

        if (lastKeysDown.length > 100) {
            lastKeysDown.shift();
        }
        lastKeysDown.push(newKey);

        this.setState({ lastKeysDown });
    }

    checkKeySequence(code) {
        return this.state.lastKeysDown.join('').includes(code);
    }

    handleDocumentKeydown(event) {
        this.updateLastKeysDown(event.key);
        if (this.checkKeySequence('admin')) {
            window.location.href = "/create-invoice";
        }
    }

    render() {
        return (
            <div className="app">
                <header className="app-header">
                    <Button
                        color="primary"
                        className="btn-circle btn-float-top-left app-header-svg"
                        onClick={() => this.toggleColorShow()}
                    >
                        <Logo className="logo" format="fillWhite" height="30" width="30" />
                    </Button>
                    <Button
                        id="GamesPopover"
                        color="primary"
                        className="btn-circle btn-float-top-right app-header-svg"
                    >
                        <DiceSvg height="50" width="50" />
                    </Button>
                    <UncontrolledPopover
                        className="games-popover app-header-svg"
                        placement="bottom"
                        target="GamesPopover"
                    >
                        <PopoverBody>
                            {!isMobile && <Button
                                color="primary"
                                className="btn-circle app-header-svg"
                                style={{ marginRight: '16px' }}
                                onClick={() => window.open("/skydiving")}
                            >
                                <FontAwesomeIcon icon="cloud" />
                            </Button>}
                            <Button
                                color="primary"
                                className="btn-circle app-header-svg"
                                style={{ marginRight: '16px' }}
                                onClick={() => window.open("/stranger-things")}
                            >
                                <StrangerThingsAdidasLogo height="50" width="50" />
                            </Button>
                            <Button
                                color="primary"
                                className="btn-circle app-header-svg"
                                onClick={() => window.open("/dot-chaser")}
                            >
                                <DotChaserLogo height="50" width="50" />
                            </Button>
                        </PopoverBody>
                    </UncontrolledPopover>
                    <Button
                        color="primary"
                        className="btn-circle btn-float-bottom-right"
                        onClick={() => document.querySelector('.proficiencies-wrapper').scrollIntoView({ behavior: 'smooth' })}
                    >
                        <FontAwesomeIcon icon="arrow-down" />
                    </Button>
                    <Logo className="logo" format="fillWhite" height="500" width="80%" />
                    <Letters />
                </header>
                <Proficiencies />
                <Testimonials />
            </div>
        );
    }
}

export default HomePage;
