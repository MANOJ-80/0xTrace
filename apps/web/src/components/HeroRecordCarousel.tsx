"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Pause, Play } from "lucide-react";

export interface HeroRecordRound {
  name: string;
  type: string;
  questions: number;
}

export interface HeroRecord {
  id: string;
  company: string;
  role: string;
  year: string;
  rounds: HeroRecordRound[];
  placeholder?: boolean;
}

const DWELL_MS = 3500;

export default function HeroRecordCarousel({ records }: { records: HeroRecord[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const held = paused || hovered;
  const running = !held && !reducedMotion && records.length > 1;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => {
      setActive((current) => (current + 1) % records.length);
    }, DWELL_MS);
    return () => window.clearTimeout(timer);
  }, [active, running, records.length]);

  if (records.length === 0) return null;

  return (
    <div
      className="record-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Recent interview records"
      style={{ "--dwell": `${DWELL_MS}ms` } as CSSProperties}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="record-viewport">
        {running && <span className="record-progress" key={active} aria-hidden="true" />}
        <div className="record-track" style={{ transform: `translateX(-${active * 100}%)` }}>
          {records.map((record, index) => (
            <article
              key={record.id}
              className={`record-slide${index === active ? " is-active" : ""}${index < active ? " is-past" : " is-next"}`}
              aria-roledescription="slide"
              aria-label={`${record.company}, record ${index + 1} of ${records.length}`}
              aria-hidden={index !== active}
            >
              <div className="record-preview">
                <div className="record-topline">
                  <span>Candidate account · {record.year}</span>
                  <span className="font-mono">{record.id}</span>
                </div>
                <div className="preview-content">
                  <p className="preview-kicker">Interview record</p>
                  <div className="preview-heading-row">
                    <div>
                      <h2>{record.company}</h2>
                      <p>{record.role}</p>
                    </div>
                    <span className="record-badge">
                      {record.placeholder ? "Preview record" : "Candidate-reported"}
                    </span>
                  </div>
                  <div className="round-list">
                    {record.rounds.map((round, roundIndex) => (
                      <div className="round-row" key={`${record.id}-${round.name}`} style={{ "--i": roundIndex } as CSSProperties}>
                        <span className="round-index">{String(roundIndex + 1).padStart(2, "0")}</span>
                        <span className="round-main">
                          <strong>{round.name}</strong>
                          <span>{round.type.replace(/_/g, " ")}</span>
                        </span>
                        <span className="round-count">
                          {round.questions}
                          <span> questions</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="record-controls">
        <div className="record-dots" role="group" aria-label="Choose a record">
          {records.map((record, index) => (
            <button
              key={record.id}
              type="button"
              aria-label={`Show ${record.company} record`}
              aria-current={index === active}
              className="record-dot"
              onClick={() => setActive(index)}
            >
              {String(index + 1).padStart(2, "0")}
            </button>
          ))}
        </div>
        <div className="record-meta">
          <span>
            {String(active + 1).padStart(2, "0")} / {String(records.length).padStart(2, "0")}
          </span>
          <button
            type="button"
            className="record-play"
            onClick={() => setPaused((value) => !value)}
            aria-label={paused ? "Play slideshow" : "Pause slideshow"}
            aria-pressed={paused}
          >
            {paused ? <Play size={11} aria-hidden="true" /> : <Pause size={11} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </div>
  );
}
