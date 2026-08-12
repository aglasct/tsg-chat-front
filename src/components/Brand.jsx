import React from "react";
import logo from "../assets/icon.gif";

export default function Brand() {
  return (
    <div className="login-brand">
      <div className="brand-icon">
        <img src={logo} alt="TsgChat" />
      </div>
      <span>TsgChat</span>
    </div>
  );
}
