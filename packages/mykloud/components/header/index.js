import React from 'react';
import './header.scss';

const Header = () => {
    return (
        <div className="header_container">
            <div className="left_side">
                <div className="mykloud_logo" />
            </div>
            <div className="right_side">
                <p className="right_text mr-2">Already have an account?</p>
                <button className="signin_btn">Register</button>
            </div>
        </div>
    );
};

export default Header;
