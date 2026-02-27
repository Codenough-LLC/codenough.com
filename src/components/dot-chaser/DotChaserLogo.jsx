import * as React from "react"

const DotChaserLogo = (props) =>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={400}
        height={400}
        viewBox="0 0 400 400"
        {...props}
    >
        <g fillRule="evenodd">
            <circle cx={120} cy={120} r={75} />
            <circle cx={280} cy={280} r={75} />
        </g>
    </svg>;

export default DotChaserLogo;
