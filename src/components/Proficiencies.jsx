import React from 'react';
import {Button} from 'reactstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import proficiencies from '../data/proficiencies';
import {hexToHSL, HSLToHex} from '../utils/color-functions';
import {isMobile} from '../utils/component-helpers';

const proficiencyIconModules = import.meta.glob('./proficiency-icons/*.jsx', {eager: true});

const randomizeOrder = (array) => {
    return array.map((element) => ({
        ...element,
        order: Math.random()
    })).sort((a, b) => a.order > b.order ? 1 : -1);
};

const randomProficiencies = randomizeOrder(proficiencies);

const Proficiencies = () =>
    <div className="proficiencies-wrapper home-page-section-wrapper">
        <div className="proficiency-icons-wrapper">
            {randomProficiencies.map(proficiency => {
                const SvgComponent = proficiencyIconModules[`./proficiency-icons/${proficiency.componentName}.jsx`].default;

                const hsl = hexToHSL(proficiency.color);
                hsl[2] = hsl[2] > 50 ? 10 : 90;
                const backgroundColor = HSLToHex(hsl);

                return (
                    <span
                        className='icon-span'
                        key={`icon-span-${proficiency.componentName}`}
                    >
                        <SvgComponent
                            key={`icon-${proficiency.componentName}`}
                            className="proficiency-icon no-select"
                            fill={proficiency.color}
                            onClick={() => {
                                if (isMobile() || !proficiency.url) {
                                    return;
                                }

                                window.open(proficiency.url, "_blank");
                            }}
                            onDoubleClick={() => {
                                if (!isMobile() || !proficiency.url) {
                                    return;
                                }

                                window.open(proficiency.url, "_blank");
                            }}
                            style={{background: backgroundColor, boxShadow: `${proficiency.color} 0 0 5px 5px`, cursor: proficiency.url ? 'pointer' : 'default'}}
                        />
                    </span>
                );
            })}
        </div>
        <Button
            color="primary"
            className="btn-circle proficiencies-circle-button"
            onClick={() => document.querySelector('.testimonials-wrapper').scrollIntoView({behavior: 'smooth'})}
        >
            <FontAwesomeIcon
                icon="arrow-down"
            />
        </Button>
    </div>;

export default Proficiencies;
