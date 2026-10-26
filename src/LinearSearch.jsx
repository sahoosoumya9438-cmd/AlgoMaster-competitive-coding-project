import { useEffect, useRef, useState } from "react";
import "./LinearSearch.css";

const ARRAY_SIZE = 25;

function generateArray() {
  return Array.from(
    { length: ARRAY_SIZE },
    () => Math.floor(Math.random() * 90) + 10
  );
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function LinearSearch() {
  const [array, setArray] = useState(generateArray);
  const [target, setTarget] = useState("");
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [foundIndex, setFoundIndex] = useState(-1);

  const [comparisons, setComparisons] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const [speed, setSpeed] = useState(150);
  const [isSearching, setIsSearching] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  const [message, setMessage] = useState("");

  const pauseRef = useRef(false);
  const cancelRef = useRef(false);
  const searchingRef = useRef(false);
  const operationIdRef = useRef(0);
  const startTimeRef = useRef(0);
  const speedRef = useRef(speed);

  async function waitForStep(isCancelled) {
    let elapsed = 0;
    let previousTime = performance.now();

    while (!isCancelled()) {
      while (pauseRef.current && !isCancelled()) {
        await wait(20);
        previousTime = performance.now();
      }

      if (isCancelled() || elapsed >= speedRef.current) return;

      await wait(Math.min(20, speedRef.current - elapsed));

      const currentTime = performance.now();

      if (!pauseRef.current) {
        elapsed += currentTime - previousTime;
      }

      previousTime = currentTime;
    }
  }

  useEffect(() => {
    pauseRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    return () => {
      cancelRef.current = true;
      operationIdRef.current += 1;
    };
  }, []);

  function resetSearch() {
    cancelRef.current = true;
    operationIdRef.current += 1;
    searchingRef.current = false;
    pauseRef.current = false;

    setIsSearching(false);
    setIsPaused(false);
    setArray(generateArray());
    setTarget("");
    setCurrentIndex(-1);
    setFoundIndex(-1);
    setComparisons(0);
    setElapsed(0);
    setFinished(false);
    setMessage("");
  }

  async function startSearch() {
    if (searchingRef.current) return;

    if (target.trim() === "") {
      setMessage("Please enter a number to search.");
      return;
    }

    const targetNumber = Number(target);

    if (!Number.isFinite(targetNumber)) {
      setMessage("Please enter a valid number.");
      return;
    }

    if (!Number.isInteger(targetNumber)) {
      setMessage("Please enter a whole number.");
      return;
    }

    if (targetNumber < 10 || targetNumber > 99) {
      setMessage("Please enter a number between 10 and 99.");
      return;
    }

    searchingRef.current = true;
    cancelRef.current = false;
    pauseRef.current = false;

    const operationId = ++operationIdRef.current;

    setIsSearching(true);
    setIsPaused(false);
    setFinished(false);
    setCurrentIndex(-1);
    setFoundIndex(-1);
    setComparisons(0);
    setElapsed(0);
    setMessage("");

    let comparisonCount = 0;

    startTimeRef.current = performance.now();

    const isCancelled = () =>
      cancelRef.current ||
      operationId !== operationIdRef.current;

    try {
      for (let i = 0; i < array.length; i++) {
        if (isCancelled()) return;

        while (pauseRef.current && !isCancelled()) {
          await wait(50);
        }

        if (isCancelled()) return;

        setCurrentIndex(i);
        comparisonCount += 1;
        setComparisons(comparisonCount);

        setElapsed(
          performance.now() - startTimeRef.current
        );

        await waitForStep(isCancelled);

        if (isCancelled()) return;

        if (array[i] === targetNumber) {
          setFoundIndex(i);
          setMessage(
            `Target ${targetNumber} found at index ${i}.`
          );
          setElapsed(
            performance.now() - startTimeRef.current
          );
          setFinished(true);
          return;
        }
      }

      if (isCancelled()) return;

      setMessage(`Target ${targetNumber} was not found.`);
      setCurrentIndex(-1);
      setElapsed(
        performance.now() - startTimeRef.current
      );
      setFinished(true);
    } finally {
      if (operationId === operationIdRef.current) {
        searchingRef.current = false;
        setIsSearching(false);
        setIsPaused(false);
      }
    }
  }

  function pauseSearch() {
    if (!searchingRef.current || pauseRef.current) return;

    pauseRef.current = true;
    setIsPaused(true);
  }

  function resumeSearch() {
    if (!searchingRef.current || !pauseRef.current) return;

    pauseRef.current = false;
    setIsPaused(false);
  }

  return (
    <div className="linear-page">
      {/* Page heading */}
      <div className="linear-heading">
        <div>
          <span className="linear-eyebrow">
            SEARCHING ALGORITHM / 01
          </span>

          <h1>Linear Search Visualizer</h1>

          <p>
            Search an array element by element and watch
            how the algorithm finds the target.
          </p>
        </div>

        <span
          className={`linear-status ${
            finished ? "complete" : ""
          }`}
        >
          <span />

          {finished
            ? "Completed"
            : isPaused
              ? "Paused"
              : isSearching
                ? "Searching"
                : "Ready"}
        </span>
      </div>

      {/* Statistics */}
      <div className="linear-stats">
        <Stat
          label="ARRAY SIZE"
          value={array.length}
        />

        <Stat
          label="COMPARISONS"
          value={comparisons}
        />

        <Stat
          label="TARGET"
          value={target === "" ? "--" : target}
        />

        <Stat
          label="ANIMATION TIME"
          value={`${elapsed.toFixed(1)} ms`}
        />
      </div>

      {/* Search controls */}
      <section className="linear-panel">
        <div className="linear-panel-heading">
          <div>
            <h2>Search Configuration</h2>

            <p>
              Enter a number from 10 to 99, or choose
              a value from the current array.
            </p>
          </div>
        </div>

        <div className="linear-search-form">
          <label htmlFor="linear-target">
            Target Value
          </label>

          <input
            id="linear-target"
            type="number"
            min="10"
            max="99"
            value={target}
            placeholder="Enter a number..."
            disabled={isSearching}
            onChange={(event) => {
              setTarget(event.target.value);
              setMessage("");
            }}
          />

          <button
            className="linear-primary"
            onClick={startSearch}
            disabled={isSearching}
          >
            🔍 Start Search
          </button>

          <button
            className="linear-secondary"
            onClick={resetSearch}
          >
            ↻ New Array
          </button>
        </div>

        {message && (
          <div
            className={`linear-message ${
              finished ? "success" : ""
            }`}
            role="status"
          >
            {message}
          </div>
        )}

        {/* Array visualization */}
        <div className="linear-visual-heading">
          <div>
            <h2>Array Visualization</h2>

            <p>
              Each bar represents one array element.
            </p>
          </div>

          <span className="linear-legend">
            <i className="linear-legend-default" />
            Unchecked

            <i className="linear-legend-active" />
            Checking

            <i className="linear-legend-found" />
            Found
          </span>
        </div>

        <div className="linear-bars">
          {array.map((value, index) => {
            let className = "linear-bar";

            if (index === currentIndex) {
              className += " checking";
            }

            if (index === foundIndex) {
              className += " found";
            }

            return (
              <div
                className="linear-bar-column"
                key={index}
              >
                <span className="linear-bar-value">
                  {value}
                </span>

                <div
                  className={className}
                  style={{
                    height: `${value * 3}px`,
                  }}
                  title={`Value: ${value}, Index: ${index}`}
                />

                <span className="linear-bar-index">
                  {index}
                </span>
              </div>
            );
          })}
        </div>

        {/* Animation controls */}
        <div className="linear-controls">
          <button
            className="linear-primary"
            onClick={pauseSearch}
            disabled={!isSearching || isPaused}
          >
            ⏸ Pause
          </button>

          <button
            className="linear-secondary"
            onClick={resumeSearch}
            disabled={!isSearching || !isPaused}
          >
            ▶ Resume
          </button>
        </div>

        {/* Speed slider */}
        <div className="linear-speed-control">
          <label htmlFor="linear-speed">
            Animation Speed
          </label>

          <input
            id="linear-speed"
            type="range"
            min="10"
            max="300"
            step="10"
            value={310 - speed}
            onChange={(event) => {
              const nextSpeed = 310 - Number(event.target.value);
              speedRef.current = nextSpeed;
              setSpeed(nextSpeed);
            }}
          />

          <span>
            {speed <= 70
              ? "Fast"
              : speed <= 170
                ? "Normal"
                : "Slow"}
          </span>
        </div>
      </section>

      {/* Algorithm information */}
      <section className="linear-info-grid">
        <article className="linear-info-card">
          <span>TIME COMPLEXITY</span>

          <h3>O(n)</h3>

          <p>
            Worst-case time complexity when the target
            is at the end or is absent.
          </p>
        </article>

        <article className="linear-info-card">
          <span>SPACE COMPLEXITY</span>

          <h3>O(1)</h3>

          <p>
            The search uses constant extra space.
          </p>
        </article>

        <article className="linear-info-card">
          <span>ALGORITHM TYPE</span>

          <h3>Sequential Search</h3>

          <p>
            Checks elements one by one until the target
            is found or the array ends.
          </p>
        </article>
      </section>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <article className="linear-stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
