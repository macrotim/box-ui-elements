// @flow
/* eslint-disable react/jsx-sort-props */
import * as React from 'react';
import AccessibleSVG from '../accessible-svg';
import type { Icon } from '../flowTypes';

const IconPlatformSandbox32 = (props: Icon) => (
    <AccessibleSVG width={32} height={32} viewBox="0 0 32 32" {...props}>
        <g fill="none">
            <rect width={32} height={32} fill="#2486FC" rx={6} />
            <path
                fill="#FFF"
                d="M9 12v3.223a.93.93 0 00.939 1c.599 0 .999-.64 1.578-.73a1.937 1.937 0 011.907 2.968c-.41.64-1.156.98-1.907.87-.62-.09-.999-.72-1.578-.73a.938.938 0 00-.939 1V23h11v-3.459c.1-.5.635-1 1.204-1 .57 0 1 .64 1.578.73a1.937 1.937 0 001.907-2.967 1.937 1.937 0 00-1.907-.87c-.629.09-.998.719-1.578.729C20.676 16.13 20 15.529 20 15v-3h-3.466c-.529.001-.701-.646-.733-1.175 0-.56.59-.88.71-1.45a1.946 1.946 0 10-3.825-.13c.09.63.718 1 .738 1.58.002.634-.347 1.175-.998 1.175H9z"
            />
        </g>
    </AccessibleSVG>
);

export default IconPlatformSandbox32;
