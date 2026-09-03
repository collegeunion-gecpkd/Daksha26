import React from "react";

import "./Landing.scss";
import DakshaFont from "../assets/DakshaFont.svg";

function Landing() {
  return (
    <div className="Landing">
      <section className="Hero">
        <p>SECULAR COLLEGE UNION PRESENTS</p>
        <img src={DakshaFont} alt="Daksha" />
        <h4>ARTS FEST</h4>
        <p className="month">SEPTEMBER</p>
        <h3>22 23 24</h3>
        <p>GEC PALAKKAD</p>
        <a href="https://drive.google.com/file/d/18av_nSavGaPboWRiNu1ACp-oZCtJ5x4O/view?usp=sharing" target="_blank">See Guidelines</a>
      </section>
    </div>
  );
}

export default Landing;
