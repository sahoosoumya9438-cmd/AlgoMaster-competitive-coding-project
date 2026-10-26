import { useEffect, useRef, useState } from "react";
import { generateArray, waitForStep } from "./sortVisualizerUtils";
import "./SortVisualizer.css";

export default function MergeSort() {
  const [array, setArray] = useState(() => generateArray());
  const [isSorting, setIsSorting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(100);
  const [comparisons, setComparisons] = useState(0);
  const [writes, setWrites] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [activeIndices, setActiveIndices] = useState([]);
  const [writingIndex, setWritingIndex] = useState(-1);
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
    setWrites(0);
    setElapsed(0);
    setFinished(false);
    setActiveIndices([]);
    setWritingIndex(-1);
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
    let writeCount = 0;

    setIsSorting(true);
    setIsPaused(false);
    setFinished(false);
    setComparisons(0);
    setWrites(0);
    setElapsed(0);
    setActiveIndices([]);
    setWritingIndex(-1);
    setSortedIndices([]);

    startTimeRef.current = performance.now();

    const isCancelled = () =>
      cancelRef.current || operationId !== operationIdRef.current;
    const delay = () =>
      waitForStep({ isCancelled, pauseRef, speedRef });

    async function merge(left, middle, right) {
      const leftValues = data.slice(left, middle + 1);
      const rightValues = data.slice(middle + 1, right + 1);
      let leftPointer = 0;
      let rightPointer = 0;

      for (let target = left; target <= right; target++) {
        if (isCancelled()) return;

        const leftSource = left + leftPointer;
        const rightSource = middle + 1 + rightPointer;
        let nextValue;

        if (leftPointer < leftValues.length && rightPointer < rightValues.length) {
          setActiveIndices([leftSource, rightSource]);
          comparisonCount += 1;
          setComparisons(comparisonCount);

          await delay();

          if (isCancelled()) return;

          if (leftValues[leftPointer] <= rightValues[rightPointer]) {
            nextValue = leftValues[leftPointer];
            leftPointer += 1;
          } else {
            nextValue = rightValues[rightPointer];
            rightPointer += 1;
          }
        } else if (leftPointer < leftValues.length) {
          setActiveIndices([leftSource, target]);
          await delay();

          if (isCancelled()) return;

          nextValue = leftValues[leftPointer];
          leftPointer += 1;
        } else {
          setActiveIndices([rightSource, target]);
          await delay();

          if (isCancelled()) return;

          nextValue = rightValues[rightPointer];
          rightPointer += 1;
        }

        data[target] = nextValue;
        writeCount += 1;
        setWrites(writeCount);
        setArray([...data]);
        setWritingIndex(target);
        setElapsed(performance.now() - startTimeRef.current);
      }

      setActiveIndices([]);
      setWritingIndex(-1);
    }

    async function mergeSortRange(left, right) {
      if (isCancelled() || left >= right) return;

      const middle = Math.floor((left + right) / 2);
      await mergeSortRange(left, middle);

      if (isCancelled()) return;

      await mergeSortRange(middle + 1, right);

      if (isCancelled()) return;

      await merge(left, middle, right);
    }

    try {
      await mergeSortRange(0, data.length - 1);

      if (isCancelled()) return;

      setArray(data);
      setSortedIndices(data.map((_, index) => index));
      setActiveIndices([]);
      setWritingIndex(-1);
      setElapsed(performance.now() - startTimeRef.current);
      setFinished(true);
    } finally {
      if (operationId === operationIdRef.current) {
        sortingRef.current = false;
        setIsSorting(false);
        setIsPaused(false);
        setActiveIndices([]);
        setWritingIndex(-1);
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
          <span className="sort-eyebrow">SORTING ALGORITHM / 04</span>
          <h1>Merge Sort Visualizer</h1>
          <p>Divide the array into halves, then merge the sorted pieces together.</p>
        </div>

        <Status finished={finished} isPaused={isPaused} isSorting={isSorting} />
      </div>

      <div className="sort-stats">
        <Stat label="ARRAY SIZE" value={array.length} />
        <Stat label="COMPARISONS" value={comparisons} />
        <Stat label="ARRAY WRITES" value={writes} />
        <Stat label="ANIMATION TIME" value={`${elapsed.toFixed(1)} ms`} />
      </div>

      <section className="sort-panel">
        <div className="sort-panel-heading">
          <div>
            <h2>Array Visualization</h2>
            <p>Orange bars are compared; blue marks the array position being written.</p>
          </div>

          <span className="sort-legend">
            <i className="legend-default" /> Unsorted
            <i className="legend-active" /> Comparing
            <i className="legend-candidate" /> Writing
            <i className="legend-sorted" /> Sorted
          </span>
        </div>

        <div className="sort-bars">
          {array.map((value, index) => {
            let className = "sort-bar";

            if (sortedIndices.includes(index)) className += " sorted";
            if (index === writingIndex) className += " candidate";
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

        <SpeedControl id="merge-speed" speed={speed} onChange={updateSpeed} />
      </section>

      <section className="sort-info-grid">
        <InfoCard
          label="TIME COMPLEXITY"
          value="O(n log n)"
          description="Merge Sort has O(n log n) time complexity in its best, average, and worst cases."
        />
        <InfoCard
          label="SPACE COMPLEXITY"
          value="O(n)"
          description="Merging uses temporary arrays to combine the two sorted halves."
        />
        <InfoCard
          label="ALGORITHM TYPE"
          value="Divide and Conquer"
          description="The array is split recursively and its sorted parts are merged."
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
