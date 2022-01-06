import React from 'react';
import './header.scss';

const Header = () => {
    return (
        <div className="header-container">
            <div className="left_side">
                <div className="mykloud-logo" />
            </div>
            <div className="right-side">
                <p className="right-text mr-2">Already have an account?</p>
                <button className="signin-btn">Register</button>
            </div>
        </div>
    );
};

export default Header;
