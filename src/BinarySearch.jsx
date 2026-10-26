import { useEffect, useRef, useState } from "react";
import { waitForStep } from "./sortVisualizerUtils";
import "./SortVisualizer.css";
import "./BinarySearch.css";

const ARRAY_SIZE = 25;

function generateSortedArray() {
  const values = new Set();

  while (values.size < ARRAY_SIZE) {
    values.add(Math.floor(Math.random() * 90) + 10);
  }

  return [...values].sort((first, second) => first - second);
}

export default function BinarySearch() {
  const [array, setArray] = useState(generateSortedArray);
  const [target, setTarget] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(150);
  const [comparisons, setComparisons] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [lowIndex, setLowIndex] = useState(0);
  const [middleIndex, setMiddleIndex] = useState(-1);
  const [highIndex, setHighIndex] = useState(ARRAY_SIZE - 1);
  const [foundIndex, setFoundIndex] = useState(-1);
  const [finished, setFinished] = useState(false);
  const [message, setMessage] = useState("");

  const pauseRef = useRef(false);
  const cancelRef = useRef(false);
  const searchingRef = useRef(false);
  const operationIdRef = useRef(0);
  const startTimeRef = useRef(0);
  const speedRef = useRef(speed);

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
    const nextArray = generateSortedArray();

    cancelRef.current = true;
    operationIdRef.current += 1;
    searchingRef.current = false;
    pauseRef.current = false;

    setIsSearching(false);
    setIsPaused(false);
    setArray(nextArray);
    setTarget("");
    setComparisons(0);
    setElapsed(0);
    setLowIndex(0);
    setMiddleIndex(-1);
    setHighIndex(nextArray.length - 1);
    setFoundIndex(-1);
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

    if (!Number.isFinite(targetNumber) || !Number.isInteger(targetNumber)) {
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
    let lowerBound = 0;
    let upperBound = array.length - 1;
    let comparisonCount = 0;

    setIsSearching(true);
    setIsPaused(false);
    setComparisons(0);
    setElapsed(0);
    setLowIndex(lowerBound);
    setMiddleIndex(-1);
    setHighIndex(upperBound);
    setFoundIndex(-1);
    setFinished(false);
    setMessage("");

    startTimeRef.current = performance.now();

    const isCancelled = () =>
      cancelRef.current || operationId !== operationIdRef.current;
    const delay = () =>
      waitForStep({ isCancelled, pauseRef, speedRef });

    try {
      while (lowerBound <= upperBound) {
        if (isCancelled()) return;

        const middle = Math.floor((lowerBound + upperBound) / 2);
        comparisonCount += 1;
        setComparisons(comparisonCount);
        setLowIndex(lowerBound);
        setMiddleIndex(middle);
        setHighIndex(upperBound);

        await delay();

        if (isCancelled()) return;

        if (array[middle] === targetNumber) {
          setFoundIndex(middle);
          setMessage(`Target ${targetNumber} found at index ${middle}.`);
          setElapsed(performance.now() - startTimeRef.current);
          setFinished(true);
          return;
        }

        if (array[middle] < targetNumber) {
          lowerBound = middle + 1;
        } else {
          upperBound = middle - 1;
        }

        setLowIndex(lowerBound);
        setMiddleIndex(-1);
        setHighIndex(upperBound);
        setElapsed(performance.now() - startTimeRef.current);

        if (lowerBound <= upperBound) {
          await delay();
        }
      }

      if (isCancelled()) return;

      setMessage(`Target ${targetNumber} was not found.`);
      setLowIndex(-1);
      setMiddleIndex(-1);
      setHighIndex(-1);
      setElapsed(performance.now() - startTimeRef.current);
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

  function updateSpeed(event) {
    const nextSpeed = 310 - Number(event.target.value);
    speedRef.current = nextSpeed;
    setSpeed(nextSpeed);
  }

  const status = finished
    ? "Completed"
    : isPaused
      ? "Paused"
      : isSearching
        ? "Searching"
        : "Ready";

  return (
    <div className="sort-page">
      <div className="sort-heading">
        <div>
          <span className="sort-eyebrow">SEARCHING ALGORITHM / 02</span>
          <h1>Binary Search Visualizer</h1>
          <p>Find a target in a sorted array by repeatedly halving the search range.</p>
        </div>

        <span className={`sort-status ${finished ? "complete" : ""}`}>
          <span />
          {status}
        </span>
      </div>

      <div className="sort-stats">
        <Stat label="ARRAY SIZE" value={array.length} />
        <Stat label="COMPARISONS" value={comparisons} />
        <Stat label="TARGET" value={target || "--"} />
        <Stat label="ANIMATION TIME" value={`${elapsed.toFixed(1)} ms`} />
      </div>

      <section className="sort-panel">
        <div className="binary-search-form">
          <label htmlFor="binary-target">Target Value</label>
          <input
            id="binary-target"
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
          <button className="sort-primary" onClick={startSearch} disabled={isSearching}>
            Start Search
          </button>
          <button className="sort-secondary" onClick={resetSearch}>
            New Array
          </button>
        </div>

        {message && (
          <div className={`binary-message ${foundIndex >= 0 ? "success" : ""}`} role="status">
            {message}
          </div>
        )}

        <div className="sort-panel-heading binary-panel-heading">
          <div>
            <h2>Sorted Array</h2>
            <p>Low, middle, and high markers show the current search range.</p>
          </div>

          <span className="sort-legend">
            <i className="binary-legend-low" /> Low
            <i className="legend-active" /> Middle
            <i className="binary-legend-high" /> High
            <i className="legend-sorted" /> Found
          </span>
        </div>

        <div className="binary-bars">
          {array.map((value, index) => {
            const markers = [];
            let className = "binary-bar";

            if (index === lowIndex) {
              className += " low";
              markers.push("L");
            }

            if (index === highIndex) {
              className += " high";
              markers.push("H");
            }

            if (index === middleIndex) {
              className += " middle";
              markers.push("M");
            }

            if (index === foundIndex) className += " found";

            return (
              <div className="binary-bar-column" key={index}>
                <span className="binary-marker">{markers.join(" ")}</span>
                <span className="binary-bar-value">{value}</span>
                <div
                  className={className}
                  style={{ height: `${value * 3}px` }}
                  title={`Value: ${value}, Index: ${index}`}
                />
                <span className="binary-bar-index">{index}</span>
              </div>
            );
          })}
        </div>

        <div className="sort-controls">
          <button className="sort-primary" onClick={pauseSearch} disabled={!isSearching || isPaused}>
            Pause
          </button>
          <button className="sort-secondary" onClick={resumeSearch} disabled={!isSearching || !isPaused}>
            Resume
          </button>
        </div>

        <SpeedControl speed={speed} onChange={updateSpeed} />
      </section>

      <section className="sort-info-grid">
        <InfoCard
          label="TIME COMPLEXITY"
          value="O(log n)"
          description="Each comparison discards half of the remaining sorted search range."
        />
        <InfoCard
          label="SPACE COMPLEXITY"
          value="O(1)"
          description="The iterative search stores only low, middle, and high positions."
        />
        <InfoCard
          label="ALGORITHM TYPE"
          value="Divide and Conquer"
          description="Binary Search requires sorted data and narrows the candidate range each step."
        />
      </section>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <article className="sort-stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function SpeedControl({ speed, onChange }) {
  return (
    <div className="sort-speed-control">
      <label htmlFor="binary-speed">Animation Speed</label>
      <input
        id="binary-speed"
        type="range"
        min="10"
        max="300"
        step="10"
        value={310 - speed}
        onChange={onChange}
      />
      <span>{speed <= 70 ? "Fast" : speed <= 170 ? "Normal" : "Slow"}</span>
    </div>
  );
}

function InfoCard({ label, value, description }) {
  return (
    <article className="sort-info-card">
      <span className="sort-info-label">{label}</span>
      <h3>{value}</h3>
      <p>{description}</p>
    </article>
  );
}
