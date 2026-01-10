"use client";

import React from "react";

export const ContactFloatButton = () => {
  return (
    <img
      className="fixed bottom-8 right-8 w-[84px] h-12 aspect-[1.74] object-cover z-50 cursor-pointer hover:scale-105 transition-transform"
      alt="Inquiry"
      src="https://c.animaapp.com/oAayiH1p/img/21091175afdf2-1@2x.png"
      onClick={() => {
        // Add functionality if needed, e.g., scroll to contact or open modal
      }}
    />
  );
};
