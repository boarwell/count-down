import { h, FunctionComponent } from "preact";
import { useEffect, useCallback, useRef, useState } from "preact/hooks";

import { tickRAF } from "./util.js";

type Prop = {
  percentage: number;
};

export const CountDown: FunctionComponent<Prop> = ({ percentage }) => {
  const radius = 10;
  const arcLength = 2 * Math.PI * radius * percentage;
  const theta = arcLength / radius;
  const largeArcFlag = percentage < 0.5 ? 1 : 0;
  const color = "#333";

  const arcX = Math.cos(theta) * radius;
  const arcY = Math.sin(theta) * radius * -1;

  return (
    <svg
      viewBox={`-11 -11 22 22`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ rotate: "-90deg" }}
    >
      {percentage === 0 ? (
        <circle
          cx="0"
          cy="0"
          r={radius}
          fill="none"
          stroke-width="2"
          stroke={color}
        />
      ) : (
        <path
          fill="none"
          stroke={color}
          d={`M ${radius},0 A ${radius} ${radius} 0 ${largeArcFlag} 1 ${arcX} ${arcY}`}
          stroke-width={2}
        />
      )}
      <g fill="none" stroke={color} stroke-width="2">
        <path d="M -4,-4 4,4" />
        <path d="M 4,-4 -4,4" />
      </g>
    </svg>
  );
};

type Option = {
  durationMS: number;
  onTimeIsUP?: () => unknown;
};

type StateLabel = "standby" | "active" | "paused" | "done";

type Handler = {
  percentage: number;
  state: StateLabel;
  start: () => void;
  pause: () => void;
  restart: () => void;
  resume: () => void;
};

export const useCountDown = ({ durationMS, onTimeIsUP }: Option): Handler => {
  const [label, setLabel] = useState<StateLabel>("standby");
  const [percentage, setPercentage] = useState<number>(0);

  const started = useRef<number | null>(null);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    if (label !== "active") {
      return;
    }

    (async () => {
      for await (const _ of tickRAF(controller.current)) {
        const elapsedMS = Date.now() - started.current;
        const p = Math.min(elapsedMS / durationMS, 1);
        setPercentage(p);

        if (p < 1) {
          continue;
        }

        setLabel("done");
        controller.current.abort();
      }
    })();

    return () => {
      controller.current?.abort();
    };
  }, [label, controller.current, started.current]);

  useEffect(() => {
    if (label !== "done" || onTimeIsUP === undefined) {
      return;
    }

    onTimeIsUP();
  }, [label, onTimeIsUP]);

  const start = useCallback(() => {
    started.current = Date.now();
    controller.current = new AbortController();
    setPercentage(0);
    setLabel("active");
  }, []);

  const pause = useCallback(() => {
    setLabel("paused");
    controller.current?.abort();
  }, [controller.current]);

  const resume = useCallback(() => {
    started.current = Date.now() - percentage * durationMS;
    controller.current = new AbortController();
    setLabel("active");
  }, [percentage, durationMS]);

  const restart = useCallback(() => {
    started.current = Date.now();
    controller.current = new AbortController();
    setLabel("active");
    setPercentage(0);
  }, []);

  return {
    percentage: percentage,
    state: label,
    start,
    pause,
    restart,
    resume,
  };
};
