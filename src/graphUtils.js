const sampleGraphs = [
  {
    id: "network",
    nodes: [
      { id: "A", x: 12, y: 50 },
      { id: "B", x: 31, y: 22 },
      { id: "C", x: 31, y: 78 },
      { id: "D", x: 58, y: 22 },
      { id: "E", x: 58, y: 78 },
      { id: "F", x: 88, y: 50 },
    ],
    edges: [
      ["A", "B"], ["A", "C"], ["B", "D"], ["B", "E"],
      ["C", "E"], ["D", "F"], ["E", "F"],
    ],
  },
  {
    id: "diamond",
    nodes: [
      { id: "P", x: 12, y: 50 },
      { id: "Q", x: 34, y: 20 },
      { id: "R", x: 34, y: 80 },
      { id: "S", x: 58, y: 50 },
      { id: "T", x: 78, y: 20 },
      { id: "U", x: 88, y: 74 },
    ],
    edges: [
      ["P", "Q"], ["P", "R"], ["Q", "S"], ["R", "S"],
      ["S", "T"], ["S", "U"], ["T", "U"],
    ],
  },
  {
    id: "tree",
    nodes: [
      { id: "1", x: 50, y: 13 },
      { id: "2", x: 25, y: 38 },
      { id: "3", x: 75, y: 38 },
      { id: "4", x: 12, y: 75 },
      { id: "5", x: 37, y: 75 },
      { id: "6", x: 63, y: 75 },
      { id: "7", x: 88, y: 75 },
    ],
    edges: [
      ["1", "2"], ["1", "3"], ["2", "4"], ["2", "5"],
      ["3", "6"], ["3", "7"], ["5", "6"],
    ],
  },
];

export function createSampleGraph(excludedId) {
  const options = sampleGraphs.filter((graph) => graph.id !== excludedId);
  const graph = options[Math.floor(Math.random() * options.length)];

  return {
    id: graph.id,
    nodes: graph.nodes.map((node) => ({ ...node })),
    edges: graph.edges.map((edge) => [...edge]),
  };
}

export function getNeighbors(graph, nodeId) {
  return graph.edges.reduce((neighbors, [source, target]) => {
    if (source === nodeId) neighbors.push(target);
    if (target === nodeId) neighbors.push(source);
    return neighbors;
  }, []);
}

export function isSameEdge(edge, activeEdge) {
  if (!activeEdge) return false;

  return (
    (edge[0] === activeEdge[0] && edge[1] === activeEdge[1]) ||
    (edge[0] === activeEdge[1] && edge[1] === activeEdge[0])
  );
}
