import { isSameEdge } from "./graphUtils";
import "./GraphVisualizer.css";

export default function GraphCanvas({ activeEdge, activeNode, graph, visitedNodes }) {
  const visited = new Set(visitedNodes);
  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));

  return (
    <div className="graph-canvas">
      <svg viewBox="0 0 100 100" role="img" aria-label="Interactive algorithm graph">
        <title>Graph traversal visualization</title>
        {graph.edges.map((edge) => {
          const [source, target] = edge;
          const sourceNode = nodeById.get(source);
          const targetNode = nodeById.get(target);
          const isActive = isSameEdge(edge, activeEdge);
          const isExplored = visited.has(source) && visited.has(target);

          return (
            <line
              className={`graph-edge ${isExplored ? "explored" : ""} ${
                isActive ? "active" : ""
              }`}
              key={`${source}-${target}`}
              x1={sourceNode.x}
              x2={targetNode.x}
              y1={sourceNode.y}
              y2={targetNode.y}
            />
          );
        })}

        {graph.nodes.map((node) => (
          <g
            className={`graph-node ${visited.has(node.id) ? "visited" : ""} ${
              activeNode === node.id ? "active" : ""
            }`}
            key={node.id}
          >
            <circle cx={node.x} cy={node.y} r="7" />
            <text x={node.x} y={node.y}>{node.id}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
