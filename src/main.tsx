import { h, render, FunctionComponent } from "preact";

import { CountDown, useCountDown } from "./count-down.jsx";

const App: FunctionComponent = () => {
  const durationMS = 3_000;
  const { percentage, start, pause, restart, resume, state } = useCountDown({
    durationMS,
    onTimeIsUP: () => alert("time's up!"),
  });

  return (
    <div>
      {state !== "done" ? (
        <CountDown percentage={percentage} />
      ) : (
        <div style={{ width: "100%", aspectRatio: "1 / 1" }}></div>
      )}

      {state === "standby" && (
        <div>
          <button type="button" onClick={start}>
            ▶️ start
          </button>
        </div>
      )}

      {state === "active" && (
        <div>
          <button type="button" onClick={pause}>
            ⏸️ pause
          </button>
        </div>
      )}

      {state === "paused" && (
        <div>
          <button type="button" onClick={resume}>
            ▶️ resume
          </button>
        </div>
      )}

      <div>
        <button type="button" onClick={restart}>
          ↪️ restart
        </button>
      </div>
    </div>
  );
};

function main() {
  render(<App />, document.body);
}

main();
