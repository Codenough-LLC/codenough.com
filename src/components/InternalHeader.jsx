import React, {useState} from 'react';
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink
} from 'reactstrap';
import netlifyIdentity from 'netlify-identity-widget';

import Logo from './logo/Logo';

const InternalHeader = () => {
    const user = netlifyIdentity.currentUser();

    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen(!isOpen);

    return (
        <div>
            <Navbar expand="md" className="site-header no-print">
                <NavbarBrand href="/">
                    <Logo format="fill" height={50} width={50} />
                    <span className="site-header-company">CODENOUGH LLC</span>
                </NavbarBrand>
                {user && (
                    <>
                        <NavbarToggler onClick={toggle} />
                        <Collapse isOpen={isOpen} navbar>
                            <Nav className="mr-auto" navbar style={{fontSize: '24px'}}>
                                <NavItem>
                                    <NavLink href="/create-invoice">Create Invoice</NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink href="/create-contract">Create Contract</NavLink>
                                </NavItem>
                            </Nav>
                        </Collapse>
                    </>
                )}
            </Navbar>
        </div>
    );
}

export default InternalHeader;
