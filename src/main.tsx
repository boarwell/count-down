import { h, render, FunctionComponent } from "preact";
import { useState, useRef, useEffect, useCallback } from "preact/hooks";

type ArcProp = {
  durationMS: number;
  ellapsedMS: number;
};

const ArcX: FunctionComponent<ArcProp> = ({ durationMS, ellapsedMS }) => {
  const radius = 10;
  const percentage = ellapsedMS / durationMS;
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
};

const useTimer = (option: TimerOption) => {
  const started = useRef(Date.now());
  const animationID = useRef<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const ellapsed = now - started.current;

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
    started.current = Date.now() - ellapsed;
    start();
  };

  const restart = () => {
    stop();
    started.current = Date.now();
    start();
  };

  return {
    ellapsed,
    start,
    stop,
    restart,
    resume,
  };
};

const Arc: FunctionComponent = () => {
  const durationMS = 10_000;
  const { ellapsed, start, stop, restart, resume } = useTimer({
    durationMS,
  });

  useEffect(() => {
    start();
  }, []);

  return (
    <div>
      <ArcX durationMS={durationMS} ellapsedMS={ellapsed % durationMS} />

      <div>
        <button type="button" onClick={restart}>
          restart
        </button>
      </div>

      <div>
        <button type="button" onClick={stop}>
          stop
        </button>
      </div>

      <div>
        <button type="button" onClick={resume}>
          resume
        </button>
      </div>
    </div>
  );
};

const App: FunctionComponent = () => {
  return (
    <div>
      <Arc />
    </div>
  );
};

function main() {
  render(<App />, document.body);
}

main();
