import React from 'react'

const Logo = props => {
    if (props.format === 'fill') {
        return (
            <svg width={230} height={210} viewBox="0 0 60.854 55.563" {...props}>
                <g paintOrder="markers stroke fill">
                    <path d="M0 0v55.563h31.75v-13.23H13.23V13.23h18.52V0z" fill="#006680" />
                    <path d="M39.688 0h21.166v13.23H39.687z" fill="#1ccbd2" />
                    <path d="M21.167 21.167h39.687v13.229H21.167z" fill="#1ccbd2" />
                    <path d="M39.687 42.333h21.167v13.23H39.687z" fill="#1ccbd2" />
                </g>
            </svg>
        );
    } else if (props.format === 'fillAndOutline') {
        return (
            <svg width={233.024} height={213.024} viewBox="0 0 61.654 56.362" {...props}>
                <g
                    stroke="#006680"
                    strokeWidth={0.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    paintOrder="markers stroke fill"
                >
                    <path d="M.4.4v55.563h31.75v-13.23H13.63V13.63h18.52V.4z" fill="#006680" />
                    <path d="M40.088.4h21.166v13.23H40.087z" fill="#1ccbd2" />
                    <path d="M21.567 21.567h39.687v13.229H21.567z" fill="#1ccbd2" />
                    <path d="M40.087 42.733h21.167v13.23H40.087z" fill="#1ccbd2" />
                </g>
            </svg>
        );
    } else if (props.format === 'fillWhite') {
        return (
            <svg width={230} height={210} viewBox="0 0 60.854 55.563" {...props}>
                <g paintOrder="markers stroke fill">
                    <path d="M0 0v55.563h31.75v-13.23H13.23V13.23h18.52V0z" fill="#006680" />
                    <path d="M39.688 0h21.166v13.23H39.687z" fill="#ffffff" />
                    <path d="M21.167 21.167h39.687v13.229H21.167z" fill="#ffffff" />
                    <path d="M39.687 42.333h21.167v13.23H39.687z" fill="#ffffff" />
                </g>
            </svg>
        );
    }
};

export default Logo
