import { h, FunctionComponent } from "preact";
import { useState, useRef, useEffect } from "preact/hooks";

type Prop = {
  percentage: number;
};

export const Timer: FunctionComponent<Prop> = ({ percentage }) => {
  const radius = 10;
  const arcLength = 2 * Math.PI * radius * percentage;
  const theta = arcLength / radius;
  const largeArcFlag = percentage < 0.5 ? 1 : 0;
  const color = "rebeccapurple";

  const arcX = Math.cos(theta) * radius;
  const arcY = Math.sin(theta) * radius * -1;

  return (
    <svg
      viewBox={`-11 -11 22 22`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ rotate: "-90deg" }}
    >
      <path
        fill="none"
        stroke={color}
        d={`M ${radius},0 A ${radius} ${radius} 0 ${largeArcFlag} 1 ${arcX} ${arcY}`}
        stroke-width={2}
      />

      <g fill="none" stroke={color} stroke-width="2">
        <path d="M -4,-4 4,4" />
        <path d="M 4,-4 -4,4" />
      </g>
    </svg>
  );
};

type TimerOption = {
  durationMS: number;
  onTimeIsUP: () => unknown;
};

type TimerHandler = {
  percentage: number;
  start: () => void;
  stop: () => void;
  restart: () => void;
  resume: () => void;
};

export const useTimer = ({
  durationMS,
  onTimeIsUP,
}: TimerOption): TimerHandler => {
  const started = useRef(Date.now());
  const animationID = useRef<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const elapsedMS = now - started.current;
  const percentage = elapsedMS / durationMS;
  const done = percentage >= 1;

  const start = () => {
    setNow(Date.now());
    animationID.current = window.requestAnimationFrame(start);
  };

  const stop = () => {
    window.cancelAnimationFrame(animationID.current);
    animationID.current = null;
  };

  const resume = () => {
    if (animationID.current !== null) {
      return;
    }
    started.current = Date.now() - elapsedMS;
    start();
  };

  const restart = () => {
    stop();
    started.current = Date.now();
    start();
  };

  useEffect(() => {
    if (done) {
      stop();
      onTimeIsUP();
    }

    return stop;
  }, [done]);

  return {
    percentage,
    start,
    stop,
    restart,
    resume,
  };
};
