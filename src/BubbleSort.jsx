import { useEffect, useRef, useState } from "react";
import "./BubbleSort.css";

const INITIAL_SIZE = 25;

function generateArray(size = INITIAL_SIZE) {
  return Array.from(
    { length: size },
    () => Math.floor(Math.random() * 90) + 10
  );
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function BubbleSort() {
  const [array, setArray] = useState(() => generateArray());
  const [isSorting, setIsSorting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(100);

  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);

  const [activeIndices, setActiveIndices] = useState([]);
  const [sortedIndices, setSortedIndices] = useState([]);

  const pauseRef = useRef(false);
  const cancelRef = useRef(false);
  const sortingRef = useRef(false);
  const operationIdRef = useRef(0);
  const startTimeRef = useRef(0);

  useEffect(() => {
    pauseRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    return () => {
      cancelRef.current = true;
      operationIdRef.current += 1;
    };
  }, []);

  function resetArray() {
    // Cancel the previous sorting operation.
    cancelRef.current = true;
    operationIdRef.current += 1;
    sortingRef.current = false;
    pauseRef.current = false;

    setIsSorting(false);
    setIsPaused(false);
    setArray(generateArray());
    setComparisons(0);
    setSwaps(0);
    setElapsed(0);
    setFinished(false);
    setActiveIndices([]);
    setSortedIndices([]);
  }

  async function startSort() {
    if (sortingRef.current) return;

    sortingRef.current = true;
    cancelRef.current = false;
    pauseRef.current = false;

    const operationId = ++operationIdRef.current;

    setIsSorting(true);
    setIsPaused(false);
    setFinished(false);
    setComparisons(0);
    setSwaps(0);
    setElapsed(0);
    setActiveIndices([]);
    setSortedIndices([]);

    const data = [...array];

    let comparisonCount = 0;
    let swapCount = 0;

    startTimeRef.current = performance.now();

    const isCancelled = () =>
      cancelRef.current ||
      operationId !== operationIdRef.current;

    try {
      for (let i = 0; i < data.length - 1; i++) {
        for (let j = 0; j < data.length - i - 1; j++) {
          if (isCancelled()) return;

          // Wait while sorting is paused.
          while (pauseRef.current && !isCancelled()) {
            await wait(50);
          }

          if (isCancelled()) return;

          comparisonCount += 1;
          setComparisons(comparisonCount);
          setActiveIndices([j, j + 1]);

          await wait(speed);

          if (isCancelled()) return;

          // Swap adjacent elements when necessary.
          if (data[j] > data[j + 1]) {
            [data[j], data[j + 1]] = [
              data[j + 1],
              data[j],
            ];

            swapCount += 1;

            setSwaps(swapCount);
            setArray([...data]);
          }

          setElapsed(
            performance.now() - startTimeRef.current
          );

          await wait(Math.max(10, speed / 3));

          if (isCancelled()) return;
        }

        // The largest remaining value is now in its correct position.
        setSortedIndices((previous) => [
          ...previous,
          data.length - i - 1,
        ]);
      }

      if (isCancelled()) return;

      setArray(data);
      setSortedIndices(
        data.map((_, index) => index)
      );
      setActiveIndices([]);
      setElapsed(
        performance.now() - startTimeRef.current
      );
      setFinished(true);
    } finally {
      // Only the current operation may update sorting state.
      if (operationId === operationIdRef.current) {
        sortingRef.current = false;
        setIsSorting(false);
        setIsPaused(false);
        setActiveIndices([]);
      }
    }
  }

  function pauseSort() {
    if (!sortingRef.current || pauseRef.current) return;

    pauseRef.current = true;
    setIsPaused(true);
  }

  function resumeSort() {
    if (!sortingRef.current || !pauseRef.current) return;

    pauseRef.current = false;
    setIsPaused(false);
  }

  return (
    <div className="bubble-page">
      {/* Page heading */}
      <div className="bubble-heading">
        <div>
          <span className="bubble-eyebrow">
            SORTING ALGORITHM / 01
          </span>

          <h1>Bubble Sort Visualizer</h1>

          <p>
            Watch adjacent elements compare and swap until
            the array becomes sorted.
          </p>
        </div>

        <span
          className={`bubble-status ${
            finished ? "complete" : ""
          }`}
        >
          <span />

          {finished
            ? "Completed"
            : isPaused
              ? "Paused"
              : isSorting
                ? "Sorting"
                : "Ready"}
        </span>
      </div>

      {/* Statistics */}
      <div className="bubble-stats">
        <Stat
          label="ARRAY SIZE"
          value={array.length}
        />

        <Stat
          label="COMPARISONS"
          value={comparisons}
        />

        <Stat
          label="SWAPS"
          value={swaps}
        />

        <Stat
          label="ANIMATION TIME"
          value={`${elapsed.toFixed(1)} ms`}
        />
      </div>

      {/* Visualization panel */}
      <section className="bubble-panel">
        <div className="bubble-panel-heading">
          <div>
            <h2>Array Visualization</h2>

            <p>
              Each bar represents one array element.
            </p>
          </div>

          <span className="bubble-legend">
            <i className="legend-default" />
            Unsorted

            <i className="legend-active" />
            Comparing

            <i className="legend-sorted" />
            Sorted
          </span>
        </div>

        {/* Array bars */}
        <div className="bars-container">
          {array.map((value, index) => {
            let className = "array-bar";

            if (sortedIndices.includes(index)) {
              className += " sorted";
            }

            if (activeIndices.includes(index)) {
              className += " comparing";
            }

            return (
              <div
                className="bar-column"
                key={index}
              >
                <span className="bar-value">
                  {value}
                </span>

                <div
                  className={className}
                  style={{
                    height: `${value * 3}px`,
                  }}
                  title={`Value: ${value}`}
                />

                <span className="bar-index">
                  {index}
                </span>
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="bubble-controls">
          <button
            className="bubble-primary"
            onClick={startSort}
            disabled={isSorting}
          >
            ▶ Start Sorting
          </button>

          <button
            className="bubble-secondary"
            onClick={pauseSort}
            disabled={!isSorting || isPaused}
          >
            ⏸ Pause
          </button>

          <button
            className="bubble-secondary"
            onClick={resumeSort}
            disabled={!isSorting || !isPaused}
          >
            ▶ Resume
          </button>

          <button
            className="bubble-secondary"
            onClick={resetArray}
          >
            ↻ New Array
          </button>
        </div>

        {/* Animation speed */}
        <div className="speed-control">
          <label htmlFor="sort-speed">
            Animation Speed
          </label>

          <input
            id="sort-speed"
            type="range"
            min="10"
            max="300"
            step="10"
            value={310 - speed}
            onChange={(event) =>
              setSpeed(
                310 - Number(event.target.value)
              )
            }
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
      <section className="bubble-info-grid">
        <article className="bubble-info-card">
          <span className="bubble-info-label">
            TIME COMPLEXITY
          </span>

          <h3>O(n²)</h3>

          <p>
            Average and worst-case time complexity
            for the standard algorithm.
          </p>
        </article>

        <article className="bubble-info-card">
          <span className="bubble-info-label">
            SPACE COMPLEXITY
          </span>

          <h3>O(1)</h3>

          <p>
            Sorting is performed in place using
            constant extra space.
          </p>
        </article>

        <article className="bubble-info-card">
          <span className="bubble-info-label">
            ALGORITHM TYPE
          </span>

          <h3>Comparison Sort</h3>

          <p>
            Adjacent values are compared and
            swapped when necessary.
          </p>
        </article>
      </section>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <article className="bubble-stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
