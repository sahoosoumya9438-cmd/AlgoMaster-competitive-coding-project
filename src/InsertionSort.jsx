import { useEffect, useRef, useState } from "react";
import { generateArray, waitForStep } from "./sortVisualizerUtils";
import "./SortVisualizer.css";

export default function InsertionSort() {
  const [array, setArray] = useState(() => generateArray());
  const [isSorting, setIsSorting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(100);
  const [comparisons, setComparisons] = useState(0);
  const [shifts, setShifts] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [activeIndices, setActiveIndices] = useState([]);
  const [insertionIndex, setInsertionIndex] = useState(-1);
  const [sortedIndices, setSortedIndices] = useState([]);

  const pauseRef = useRef(false);
  const cancelRef = useRef(false);
  const sortingRef = useRef(false);
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

  function resetArray() {
    cancelRef.current = true;
    operationIdRef.current += 1;
    sortingRef.current = false;
    pauseRef.current = false;

    setIsSorting(false);
    setIsPaused(false);
    setArray(generateArray());
    setComparisons(0);
    setShifts(0);
    setElapsed(0);
    setFinished(false);
    setActiveIndices([]);
    setInsertionIndex(-1);
    setSortedIndices([]);
  }

  async function startSort() {
    if (sortingRef.current) return;

    sortingRef.current = true;
    cancelRef.current = false;
    pauseRef.current = false;

    const operationId = ++operationIdRef.current;
    const data = [...array];
    let comparisonCount = 0;
    let shiftCount = 0;

    setIsSorting(true);
    setIsPaused(false);
    setFinished(false);
    setComparisons(0);
    setShifts(0);
    setElapsed(0);
    setActiveIndices([]);
    setInsertionIndex(-1);
    setSortedIndices([]);

    startTimeRef.current = performance.now();

    const isCancelled = () =>
      cancelRef.current || operationId !== operationIdRef.current;
    const delay = () =>
      waitForStep({ isCancelled, pauseRef, speedRef });

    try {
      setSortedIndices([0]);

      for (let i = 1; i < data.length; i++) {
        const key = data[i];
        let j = i - 1;

        setInsertionIndex(i);

        while (j >= 0) {
          if (isCancelled()) return;

          setActiveIndices([j, j + 1]);
          comparisonCount += 1;
          setComparisons(comparisonCount);

          await delay();

          if (isCancelled()) return;

          if (data[j] <= key) break;

          data[j + 1] = data[j];
          shiftCount += 1;
          setShifts(shiftCount);
          setArray([...data]);
          setInsertionIndex(j);
          setElapsed(performance.now() - startTimeRef.current);

          await delay();

          if (isCancelled()) return;

          j -= 1;
        }

        data[j + 1] = key;
        setArray([...data]);
        setActiveIndices([]);
        setInsertionIndex(-1);
        setSortedIndices(Array.from({ length: i + 1 }, (_, index) => index));
        setElapsed(performance.now() - startTimeRef.current);
      }

      if (isCancelled()) return;

      setArray(data);
      setSortedIndices(data.map((_, index) => index));
      setActiveIndices([]);
      setInsertionIndex(-1);
      setElapsed(performance.now() - startTimeRef.current);
      setFinished(true);
    } finally {
      if (operationId === operationIdRef.current) {
        sortingRef.current = false;
        setIsSorting(false);
        setIsPaused(false);
        setActiveIndices([]);
        setInsertionIndex(-1);
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

  function updateSpeed(event) {
    const nextSpeed = 310 - Number(event.target.value);
    speedRef.current = nextSpeed;
    setSpeed(nextSpeed);
  }

  return (
    <div className="sort-page">
      <div className="sort-heading">
        <div>
          <span className="sort-eyebrow">SORTING ALGORITHM / 03</span>
          <h1>Insertion Sort Visualizer</h1>
          <p>
            Build a sorted prefix by inserting each value into its correct
            position.
          </p>
        </div>

        <Status finished={finished} isPaused={isPaused} isSorting={isSorting} />
      </div>

      <div className="sort-stats">
        <Stat label="ARRAY SIZE" value={array.length} />
        <Stat label="COMPARISONS" value={comparisons} />
        <Stat label="SHIFTS" value={shifts} />
        <Stat label="ANIMATION TIME" value={`${elapsed.toFixed(1)} ms`} />
      </div>

      <section className="sort-panel">
        <div className="sort-panel-heading">
          <div>
            <h2>Array Visualization</h2>
            <p>Orange bars are compared while blue marks the insertion point.</p>
          </div>

          <span className="sort-legend">
            <i className="legend-default" /> Unsorted
            <i className="legend-active" /> Comparing
            <i className="legend-candidate" /> Insertion point
            <i className="legend-sorted" /> Sorted prefix
          </span>
        </div>

        <div className="sort-bars">
          {array.map((value, index) => {
            let className = "sort-bar";

            if (sortedIndices.includes(index)) className += " sorted";
            if (index === insertionIndex) className += " candidate";
            if (activeIndices.includes(index)) className += " active";

            return (
              <div className="sort-bar-column" key={index}>
                <span className="sort-bar-value">{value}</span>
                <div
                  className={className}
                  style={{ height: `${value * 3}px` }}
                  title={`Value: ${value}, Index: ${index}`}
                />
                <span className="sort-bar-index">{index}</span>
              </div>
            );
          })}
        </div>

        <Controls
          isPaused={isPaused}
          isSorting={isSorting}
          onPause={pauseSort}
          onReset={resetArray}
          onResume={resumeSort}
          onStart={startSort}
        />

        <SpeedControl id="insertion-speed" speed={speed} onChange={updateSpeed} />
      </section>

      <section className="sort-info-grid">
        <InfoCard
          label="TIME COMPLEXITY"
          value="O(n²)"
          description="Average and worst cases are quadratic; an already sorted array is O(n)."
        />
        <InfoCard
          label="SPACE COMPLEXITY"
          value="O(1)"
          description="Insertion Sort moves values within the input array with constant extra space."
        />
        <InfoCard
          label="ALGORITHM TYPE"
          value="Insertion Sort"
          description="It grows a sorted prefix by shifting larger values to the right."
        />
      </section>
    </div>
  );
}

function Status({ finished, isPaused, isSorting }) {
  const label = finished
    ? "Completed"
    : isPaused
      ? "Paused"
      : isSorting
        ? "Sorting"
        : "Ready";

  return (
    <span className={`sort-status ${finished ? "complete" : ""}`}>
      <span />
      {label}
    </span>
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

function Controls({ isPaused, isSorting, onPause, onReset, onResume, onStart }) {
  return (
    <div className="sort-controls">
      <button className="sort-primary" onClick={onStart} disabled={isSorting}>
        ▶ Start Sorting
      </button>
      <button className="sort-secondary" onClick={onPause} disabled={!isSorting || isPaused}>
        ⏸ Pause
      </button>
      <button className="sort-secondary" onClick={onResume} disabled={!isSorting || !isPaused}>
        ▶ Resume
      </button>
      <button className="sort-secondary" onClick={onReset}>
        ↻ New Array
      </button>
    </div>
  );
}

function SpeedControl({ id, speed, onChange }) {
  return (
    <div className="sort-speed-control">
      <label htmlFor={id}>Animation Speed</label>
      <input
        id={id}
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
