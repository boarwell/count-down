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

type TimerOption = {
  durationMS: number;
  onTimeIsUP: () => unknown;
};

type TimerHandler = {
  percentage: number;
  start: () => void;
  pause: () => void;
  restart: () => void;
  resume: () => void;
};

export const useTimer = ({
  durationMS,
  onTimeIsUP,
}: TimerOption): TimerHandler => {
  const started = useRef<number | null>(null);
  const animationID = useRef<number | null>(null);
  const [percentage, setPercentage] = useState(0);

  const done = percentage >= 1;

  const start = () => {
    if (started.current === null) {
      started.current = Date.now();
    }

    const elapsedMS = Date.now() - started.current;
    setPercentage(elapsedMS / durationMS);
    animationID.current = window.requestAnimationFrame(start);
  };

  const pause = () => {
    window.cancelAnimationFrame(animationID.current);
    animationID.current = null;
  };

  const resume = () => {
    if (animationID.current !== null) {
      return;
    }
    started.current = Date.now() - durationMS * percentage;
    start();
  };

  const restart = () => {
    pause();
    started.current = Date.now();
    setPercentage(0);
    start();
  };

  useEffect(() => {
    if (done) {
      pause();
      onTimeIsUP();
    }

    return pause;
  }, [done]);

  return {
    percentage,
    start,
    pause,
    restart,
    resume,
  };
};
