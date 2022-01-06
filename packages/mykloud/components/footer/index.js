import React from 'react';
import "./footer.scss";
import twitter from "../../common/assets/twitter.png";
import linked from "../../common/assets/linkedin.png";





const Footer = ()=>{


    return (
        <div className="footer">
        <div className="first_line">
          <div className="footer_logo" />
          <div className="link_container">
            <a href="https://twitter.com/mykloudplatform" className="mr-8">
            Terms of Service
            </a>
            <a href="https://twitter.com/mykloudplatform">
            Privacy Policy
            </a>
          </div>
        </div>
        <div className="second_line mt-8">
          <p className="copyright">Copyright © 2021. All rights reserved by myKloud Company.</p>

          <div className="flex">
            <p className="join mr-6">Join our community</p>
            <img
              src={twitter}
              alt="twitter"
              className="mr-3"
              
            />
            <img
              alt="linked"
              src={linked}
              
            />
          </div>
        </div>
      </div>
    )
}

export default Footer