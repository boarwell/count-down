import { h, render, FunctionComponent } from "preact";
import { useEffect } from "preact/hooks";

import { Timer, useTimer } from "./timer.js";

const App: FunctionComponent = () => {
  const durationMS = 10_000;
  const { percentage, start, stop, restart, resume } = useTimer({
    durationMS,
    onTimeIsUP: () => alert("time's up!"),
  });

  useEffect(() => {
    start();
  }, []);

  return (
    <div>
      <Timer percentage={percentage} />

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

function main() {
  render(<App />, document.body);
}

main();
