import { useEffect, useRef, useState } from "react";
import GraphCanvas from "./GraphCanvas";
import { createSampleGraph, getNeighbors } from "./graphUtils";
import { waitForStep } from "./sortVisualizerUtils";
import "./SortVisualizer.css";

export default function BFS() {
  const [graph, setGraph] = useState(() => createSampleGraph());
  const [isTraversing, setIsTraversing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(180);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [traversalOrder, setTraversalOrder] = useState([]);
  const [activeNode, setActiveNode] = useState("");
  const [activeEdge, setActiveEdge] = useState(null);
  const [frontierSize, setFrontierSize] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);

  const pauseRef = useRef(false);
  const cancelRef = useRef(false);
  const traversingRef = useRef(false);
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

  function resetGraph() {
    const nextGraph = createSampleGraph(graph.id);

    cancelRef.current = true;
    operationIdRef.current += 1;
    traversingRef.current = false;
    pauseRef.current = false;

    setIsTraversing(false);
    setIsPaused(false);
    setGraph(nextGraph);
    setVisitedNodes([]);
    setTraversalOrder([]);
    setActiveNode("");
    setActiveEdge(null);
    setFrontierSize(0);
    setElapsed(0);
    setFinished(false);
  }

  async function startTraversal() {
    if (traversingRef.current) return;

    traversingRef.current = true;
    cancelRef.current = false;
    pauseRef.current = false;

    const operationId = ++operationIdRef.current;
    const startNode = graph.nodes[0].id;
    const queue = [startNode];
    const visited = new Set([startNode]);
    const order = [startNode];

    setIsTraversing(true);
    setIsPaused(false);
    setVisitedNodes([...visited]);
    setTraversalOrder([...order]);
    setActiveNode("");
    setActiveEdge(null);
    setFrontierSize(queue.length);
    setElapsed(0);
    setFinished(false);

    startTimeRef.current = performance.now();

    const isCancelled = () =>
      cancelRef.current || operationId !== operationIdRef.current;
    const delay = () =>
      waitForStep({ isCancelled, pauseRef, speedRef });

    try {
      while (queue.length > 0) {
        if (isCancelled()) return;

        const currentNode = queue.shift();
        setActiveNode(currentNode);
        setActiveEdge(null);
        setFrontierSize(queue.length);

        await delay();

        if (isCancelled()) return;

        for (const neighbor of getNeighbors(graph, currentNode)) {
          if (isCancelled()) return;

          setActiveEdge([currentNode, neighbor]);
          await delay();

          if (isCancelled()) return;

          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
            order.push(neighbor);
            setVisitedNodes([...visited]);
            setTraversalOrder([...order]);
            setFrontierSize(queue.length);
          }

          setElapsed(performance.now() - startTimeRef.current);
        }
      }

      if (isCancelled()) return;

      setActiveNode("");
      setActiveEdge(null);
      setFrontierSize(0);
      setElapsed(performance.now() - startTimeRef.current);
      setFinished(true);
    } finally {
      if (operationId === operationIdRef.current) {
        traversingRef.current = false;
        setIsTraversing(false);
        setIsPaused(false);
      }
    }
  }

  function pauseTraversal() {
    if (!traversingRef.current || pauseRef.current) return;

    pauseRef.current = true;
    setIsPaused(true);
  }

  function resumeTraversal() {
    if (!traversingRef.current || !pauseRef.current) return;

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
      : isTraversing
        ? "Traversing"
        : "Ready";

  return (
    <div className="sort-page">
      <div className="sort-heading">
        <div>
          <span className="sort-eyebrow">GRAPH TRAVERSAL / 01</span>
          <h1>Breadth-First Search</h1>
          <p>Visit graph nodes level by level using a first-in, first-out queue.</p>
        </div>

        <span className={`sort-status ${finished ? "complete" : ""}`}>
          <span />
          {status}
        </span>
      </div>

      <div className="sort-stats">
        <Stat label="NODES" value={graph.nodes.length} />
        <Stat label="VISITED" value={visitedNodes.length} />
        <Stat label="QUEUE SIZE" value={frontierSize} />
        <Stat label="ANIMATION TIME" value={`${elapsed.toFixed(1)} ms`} />
      </div>

      <section className="sort-panel">
        <div className="sort-panel-heading">
          <div>
            <h2>Graph Visualization</h2>
            <p>Orange shows the active node or edge; green nodes have been visited.</p>
          </div>

          <span className="sort-legend">
            <i className="legend-default" /> Unvisited
            <i className="legend-active" /> Exploring
            <i className="legend-sorted" /> Visited
          </span>
        </div>

        <GraphCanvas
          activeEdge={activeEdge}
          activeNode={activeNode}
          graph={graph}
          visitedNodes={visitedNodes}
        />

        <TraversalOrder order={traversalOrder} />

        <div className="sort-controls">
          <button className="sort-primary" onClick={startTraversal} disabled={isTraversing}>
            Start BFS
          </button>
          <button className="sort-secondary" onClick={pauseTraversal} disabled={!isTraversing || isPaused}>
            Pause
          </button>
          <button className="sort-secondary" onClick={resumeTraversal} disabled={!isTraversing || !isPaused}>
            Resume
          </button>
          <button className="sort-secondary" onClick={resetGraph}>
            New Sample Graph
          </button>
        </div>

        <SpeedControl speed={speed} onChange={updateSpeed} />
      </section>

      <section className="sort-info-grid">
        <InfoCard
          label="TIME COMPLEXITY"
          value="O(V + E)"
          description="Each vertex and edge is explored at most once in the traversal."
        />
        <InfoCard
          label="SPACE COMPLEXITY"
          value="O(V)"
          description="The visited set and queue can each contain up to all vertices."
        />
        <InfoCard
          label="ALGORITHM TYPE"
          value="Queue Traversal"
          description="BFS explores every neighbor before moving to the next depth level."
        />
      </section>
    </div>
  );
}

function TraversalOrder({ order }) {
  return (
    <div className="graph-traversal">
      <span className="graph-traversal-label">TRAVERSAL ORDER</span>
      <div className="graph-order">
        {order.length ? order.map((node, index) => (
          <span className="graph-order-step" key={`${node}-${index}`}>
            <small>{index + 1}</small> {node}
          </span>
        )) : <span className="graph-empty-order">Start the traversal to see visited nodes.</span>}
      </div>
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
      <label htmlFor="bfs-speed">Animation Speed</label>
      <input id="bfs-speed" type="range" min="10" max="300" step="10" value={310 - speed} onChange={onChange} />
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
