import { h, FunctionComponent } from "preact";
import { useEffect, Reducer, useReducer, useCallback } from "preact/hooks";

import { tickRAF, waitForRAF } from "./util.js";

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

type State = {
  label: StateLabel;
  started: number | null;
  percentage: number;
  controller: AbortController;
};

const INITIAL_STATE: State = {
  label: "standby",
  started: null,
  percentage: 0,
  controller: new AbortController(),
};

type Action =
  | { type: "start" }
  | {
      type: "tick";
      payload: {
        percentage: number;
      };
    }
  | { type: "pause" }
  | { type: "resume"; payload: { durationMS: number } }
  | { type: "done" };

const reducer: Reducer<State, Action> = (s, a) => {
  switch (a.type) {
    case "start": {
      return {
        ...s,
        label: "active",
        percentage: 0,
        started: Date.now(),
        controller: new AbortController(),
      };
    }

    case "tick": {
      if (s.label !== "active") {
        return s;
      }

      return { ...s, percentage: a.payload.percentage };
    }

    case "pause": {
      if (s.label !== "active") {
        return s;
      }

      s.controller.abort();
      return { ...s, label: "paused" };
    }

    case "resume": {
      if (s.label !== "paused") {
        return s;
      }

      return {
        ...s,
        label: "active",
        started: Date.now() - a.payload.durationMS * s.percentage,
        controller: new AbortController(),
      };
    }

    case "done": {
      if (s.label !== "active") {
        return s;
      }

      s.controller.abort();
      return { ...s, label: "done", percentage: 1 };
    }
  }

  return s;
};

export const useCountDown = ({ durationMS, onTimeIsUP }: Option): Handler => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  useEffect(() => {
    if (state.label === "active") {
      (async () => {
        for await (const _ of tickRAF(state.controller)) {
          const elapsedMS = Date.now() - state.started;
          const percentage = Math.min(elapsedMS / durationMS, 1);

          if (percentage === 1) {
            dispatch({ type: "done" });
            if (onTimeIsUP !== undefined) {
              // call after rendering "done" state
              await waitForRAF();
              onTimeIsUP();
            }
            break;
          }

          dispatch({
            type: "tick",
            payload: { percentage },
          });
        }
      })();
    }

    return () => {
      state.controller.abort();
    };
  }, [state.label]);

  const start = useCallback(() => {
    dispatch({ type: "start" });
  }, [dispatch]);

  const pause = useCallback(() => {
    dispatch({ type: "pause" });
  }, [dispatch]);

  const resume = useCallback(() => {
    dispatch({ type: "resume", payload: { durationMS } });
  }, [dispatch]);

  const restart = useCallback(() => {
    dispatch({ type: "start" });
  }, [dispatch]);

  return {
    percentage: state.percentage,
    state: state.label,
    start,
    pause,
    restart,
    resume,
  };
};
