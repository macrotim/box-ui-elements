// @flow
/* eslint-disable react/jsx-sort-props */
import * as React from 'react';
import AccessibleSVG from '../accessible-svg';
import type { Icon } from '../flowTypes';

const IconFileSpreadsheet32 = (props: Icon) => (
    <AccessibleSVG width={32} height={32} viewBox="0 0 32 32" {...props}>
        <g fill="none">
            <path
                fill="#3FB87F"
                d="M9 3h9.586a1 1 0 01.707.293l6.415 6.414a1 1 0 01.293.707V26A3 3 0 0123 29H9a3 3 0 01-3-3V6a3 3 0 013-3z"
            />
            <path
                fill="#FFF"
                fillOpacity={0.5}
                d="M19.286 3.286l5.01 5.009 1.412 1.412a1 1 0 01.203.293H21a2 2 0 01-2-2V3.09a1 1 0 01.286.196z"
            />
            <path
                fill="#FFF"
                d="M22 23.49c0 .282-.229.51-.5.51h-11a.505.505 0 01-.5-.51v-8.98c0-.282.229-.51.5-.51h11c.276 0 .5.228.5.51v8.98zM11 23h2v-2h-2v2zm10-2h-7v2h7v-2zm0-1v-2h-7v2h7zm-10 0h2v-2h-2v2zm10-3v-2h-7v2h7zm-8-2h-2v2h2v-2z"
            />
        </g>
    </AccessibleSVG>
);

export default IconFileSpreadsheet32;
