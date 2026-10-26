import BubbleSort from "./BubbleSort";
import InsertionSort from "./InsertionSort";
import LinearSearch from "./LinearSearch";
import MergeSort from "./MergeSort";
import QuickSort from "./QuickSort";
import SelectionSort from "./SelectionSort";
import { useState } from "react";
import "./App.css";

const modules = [
  {
    id: "sorting",
    icon: "↕",
    title: "Sorting Algorithms",
    description: "Visualize how sorting algorithms arrange data.",
    algorithms: ["Bubble Sort", "Selection Sort", "Insertion Sort", "Merge Sort", "Quick Sort", "Heap Sort"],
    color: "purple",
  },
  {
    id: "searching",
    icon: "⌕",
    title: "Searching Algorithms",
    description: "Explore different ways to find elements.",
    algorithms: ["Linear Search", "Binary Search"],
    color: "blue",
  },
  {
    id: "graphs",
    icon: "◎",
    title: "Graph Algorithms",
    description: "Explore graph traversal and shortest paths.",
    algorithms: ["BFS", "DFS", "Dijkstra", "A* Search"],
    color: "green",
  },
  {
    id: "coding",
    icon: "</>",
    title: "Coding Arena",
    description: "Practice programming problems and improve your skills.",
    algorithms: ["Arrays", "Strings", "Linked Lists", "Stacks & Queues"],
    color: "orange",
  },
];

const visualizerPages = {
  "Bubble Sort": "Bubble Sort Visualizer",
  "Selection Sort": "Selection Sort Visualizer",
  "Insertion Sort": "Insertion Sort Visualizer",
  "Merge Sort": "Merge Sort Visualizer",
  "Quick Sort": "Quick Sort Visualizer",
  "Linear Search": "Linear Search Visualizer",
};

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  const activeModule = modules.find(
    (module) => module.title === activePage
  );

  const navItems = [
  { name: "Dashboard", icon: "⌂" },
  { name: "Sorting Algorithms", icon: "↕" },
  { name: "Bubble Sort Visualizer", icon: "⇅" },
  { name: "Selection Sort Visualizer", icon: "↕" },
  { name: "Insertion Sort Visualizer", icon: "↕" },
  { name: "Merge Sort Visualizer", icon: "↕" },
  { name: "Quick Sort Visualizer", icon: "↕" },
  { name: "Searching Algorithms", icon: "⌕" },
  { name: "Linear Search Visualizer", icon: "⌕" },
  { name: "Graph Algorithms", icon: "◎" },
  { name: "Coding Arena", icon: "</>" },
  { name: "Complexity Analyzer", icon: "⌁" },
];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">A</div>
          <div>
            <h2>AlgoMaster</h2>
            <span>DSA LEARNING PLATFORM</span>
          </div>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="navigation">
          {navItems.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${
                activePage === item.name ? "active" : ""
              }`}
              onClick={() => setActivePage(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-avatar">M</div>
          <div className="profile-info">
            <strong>MCA Student</strong>
            <span>Competitive Coding</span>
          </div>
          <span className="status-dot"></span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> <strong>{activePage}</strong>
          </div>

          <div className="topbar-right">
            <span className="live-dot"></span>
            <span>System ready</span>
            <div className="top-avatar">M</div>
          </div>
        </header>

        <section className="page-content">
          <div className="welcome-section">
            <div>
              <div className="eyebrow">YOUR DSA JOURNEY STARTS HERE</div>
              <h1>
                Master algorithms<span className="accent">.</span>
              </h1>
              <p>
                Learn, visualize, and practice data structures and
                algorithms interactively.
              </p>
            </div>

            <div className="welcome-badge">
              <span>✦</span>
              <div>
                <strong>Learn by doing</strong>
                <small>One algorithm at a time</small>
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <StatCard
              label="ALGORITHM MODULES"
              value="04"
              note="Learning modules"
              icon="⌘"
              color="purple"
            />
            <StatCard
              label="ALGORITHMS"
              value="14"
              note="Ready to explore"
              icon="⌁"
              color="blue"
            />
            <StatCard
              label="CODING PROBLEMS"
              value="00"
              note="Practice coming next"
              icon="</>"
              color="orange"
            />
            <StatCard
              label="YOUR PROGRESS"
              value="00%"
              note="Start your journey"
              icon="↗"
              color="green"
            />
          </div>

          {activeModule ? (
            <section className="module-detail">
              <button
                className="back-button"
                onClick={() => setActivePage("Dashboard")}
              >
                ← Back to dashboard
              </button>

              <div className="section-heading">
                <div>
                  <div className="eyebrow">LEARNING MODULE</div>
                  <h2>{activeModule.title}</h2>
                  <p>{activeModule.description}</p>
                </div>
              </div>

              <div className="algorithm-grid">
                {activeModule.algorithms.map((algorithm, index) => (
                  <article className="algorithm-card" key={algorithm}>
                    <span className={`algorithm-number ${activeModule.color}`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3>{algorithm}</h3>
                    <p>Explore the algorithm and understand its logic.</p>
                    {visualizerPages[algorithm] ? (
                      <button
                        className="coming-soon algorithm-action"
                        onClick={() => setActivePage(visualizerPages[algorithm])}
                      >
                        Open visualizer <span>↗</span>
                      </button>
                    ) : (
                      <span className="coming-soon">Implementation next</span>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ) : activePage === "Bubble Sort Visualizer" ? (
               <BubbleSort />
          ) : activePage === "Selection Sort Visualizer" ? (
               <SelectionSort />
          ) : activePage === "Insertion Sort Visualizer" ? (
               <InsertionSort />
          ) : activePage === "Merge Sort Visualizer" ? (
               <MergeSort />
          ) : activePage === "Quick Sort Visualizer" ? (
               <QuickSort />
          ) : activePage === "Linear Search Visualizer" ? (
               <LinearSearch />
          ) : activePage === "Complexity Analyzer" ? (
            <section className="module-detail">
              <div className="section-heading">
                <div>
                  <div className="eyebrow">PERFORMANCE LAB</div>
                  <h2>Complexity Analyzer</h2>
                  <p>
                    Understand how algorithm performance changes as input
                    size increases.
                  </p>
                </div>
              </div>

              <div className="complexity-panel">
                <div className="complexity-row">
                  <span>Constant</span>
                  <code>O(1)</code>
                </div>
                <div className="complexity-row">
                  <span>Logarithmic</span>
                  <code>O(log n)</code>
                </div>
                <div className="complexity-row">
                  <span>Linear</span>
                  <code>O(n)</code>
                </div>
                <div className="complexity-row">
                  <span>Linearithmic</span>
                  <code>O(n log n)</code>
                </div>
                <div className="complexity-row">
                  <span>Quadratic</span>
                  <code>O(n²)</code>
                </div>
              </div>
            </section>
          ) : (
            <>
              <div className="section-heading">
                <div>
                  <div className="eyebrow">EXPLORE & PRACTICE</div>
                  <h2>Your learning workspace</h2>
                  <p>Choose a module to begin exploring algorithms.</p>
                </div>
                <span className="module-count">04 MODULES</span>
              </div>

              <div className="modules-grid">
                {modules.map((module, index) => (
                  <article
                    className="module-card"
                    key={module.id}
                    onClick={() => setActivePage(module.title)}
                  >
                    <div className="module-card-top">
                      <div className={`module-icon ${module.color}`}>
                        {module.icon}
                      </div>
                      <span className="card-index">
                        MODULE 0{index + 1}
                      </span>
                    </div>

                    <h3>{module.title}</h3>
                    <p>{module.description}</p>

                    <div className="tag-list">
                      {module.algorithms.slice(0, 3).map((algorithm) => (
                        <span key={algorithm}>{algorithm}</span>
                      ))}
                      {module.algorithms.length > 3 && (
                        <span>+{module.algorithms.length - 3}</span>
                      )}
                    </div>

                    <button className="explore-button">
                      Explore module <span>↗</span>
                    </button>
                  </article>
                ))}
              </div>

              <section className="bottom-panel">
                <div className="bottom-icon">⌘</div>
                <div className="bottom-copy">
                  <h3>Built for curious problem solvers</h3>
                  <p>
                    Understand the logic behind every algorithm, visualize
                    its execution, and build strong DSA fundamentals.
                  </p>
                </div>
                <span className="java-badge">JAVA + DSA</span>
              </section>
            </>
          )}

          <footer className="footer">
            <span>AlgoMaster © 2026</span>
            <span>Built for MCA Competitive Coding</span>
          </footer>
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value, note, icon, color }) {
  return (
    <article className="stat-card">
      <div className="stat-card-top">
        <span>{label}</span>
        <div className={`stat-icon ${color}`}>{icon}</div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-note">
        <span className="note-dot"></span>
        {note}
      </div>
    </article>
  );
}

export default App;
