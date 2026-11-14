"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { LiquidMetal } from "@paper-design/shaders-react";

const PORTFOLIO_URL = "https://manojganesan.vercel.app/?ref=0xtrace";

export default function TeamAvatar() {
  const [webglAvailable, setWebglAvailable] = useState(false);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      setWebglAvailable(Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl")));
    } catch {
      setWebglAvailable(false);
    }
  }, []);

  return (
    <a
      href={PORTFOLIO_URL}
      target="_blank"
      rel="noreferrer"
      className="about-team-avatar-link"
      aria-label="Open Manoj Ganesan's portfolio"
    >
      <span className="about-team-avatar-metal" aria-hidden="true">
        {webglAvailable && (
          <LiquidMetal
            width="100%"
            height="100%"
            colorBack="#6b5828"
            colorTint="#ffd700"
            speed={0.3}
            repetition={4}
            distortion={0.2}
            softness={0}
            shiftRed={0.3}
            shiftBlue={-0.3}
            angle={45}
            shape="none"
            scale={1}
            fit="cover"
          />
        )}
      </span>
      <Image
        src="/team/manoj-ganesan.webp"
        alt=""
        width={58}
        height={58}
        sizes="58px"
        className="about-team-avatar"
      />
    </a>
  );
}
