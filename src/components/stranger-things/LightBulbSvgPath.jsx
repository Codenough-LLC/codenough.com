import * as React from 'react';

const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    return result ? {
        red: parseInt(result[1], 16),
        green: parseInt(result[2], 16),
        blue: parseInt(result[3], 16)
    } : null
};

const LightBulbSvgPath = ({transformOrigin, coordinates, hexColor, on, clickHandler}) => {
    const rgb = hexToRgb(hexColor);

    return (
        <path
            style={{cursor: 'pointer', transformOrigin}}
            className="light-bulb-svg"
            d={coordinates}
            fill={`rgba(${rgb.red}, ${rgb.green}, ${rgb.blue}, ${on ? 1 : 0.25})`}
            stroke={`rgba(${rgb.red}, ${rgb.green}, ${rgb.blue}, ${on ? 0.3 : 0.9})`}
            strokeWidth={on ? 0.75 : 0.056}
            filter="url(#blurred_border)"
            onClick={() => clickHandler()}
        />
    )
};

export default LightBulbSvgPath;
