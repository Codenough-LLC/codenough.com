import React from 'react';

import InternalHeader from './InternalHeader';
import InternalFooter from './InternalFooter';

const InternalPageLayout = (props) =>
    <>
        <InternalHeader />
        <h4 style={{textTransform: 'uppercase'}} className="page-title no-print">{props.pageTitle}</h4>
        <div className="layout-container-main">
            {props.children}
        </div>
        <InternalFooter />
    </>

export default InternalPageLayout;
