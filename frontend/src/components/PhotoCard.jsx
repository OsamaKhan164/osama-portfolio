import React from "react";
import osamaPhoto from "../assets/osama-khan.png";

export default function PhotoCard() {
  return (
    <img
      src={osamaPhoto}
      alt="Osama Khan, Full Stack Developer"
      className="mx-auto h-auto w-full max-w-sm"
    />
  );
}
