import React, { useState, useRef } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import "./App.css";

function App() {
  const layout = {
    name: "grid",
    rows: 1,
    directed: true,
    wheelSensitivity: 0.1,
    zoomingEnabled: true,
  };
  const stylesheet = [
    {
      selector: "node",
      style: {
        label: "data(label)",
        "text-valign": "center",
        "text-halign": "center",
        "background-color": "#3b82f6",
        color: "#fff",
        "font-size": "22px",
        width: "80px",
        height: "80px",
      },
    },
    {
      selector: "node:selected",
      style: {
        "background-color": "#ef4444",
      },
    },
    {
      selector: "edge",
      style: {
        width: 2,
        "line-color": "#3b82f6",
        "target-arrow-color": "#3b82f6",
        "target-arrow-shape": "triangle",
        "curve-style": "bezier",
        label: "data(label)",
        "text-rotation": "autorotate",
        "font-size": "22px",
        color: "#000",
        "text-background-opacity": 1,
        "text-background-color": "#fff",
      },
    },
    {
      selector: "edge:selected",
      style: {
        "line-color": "#ef4444",
        "target-arrow-color": "#ef4444",
      },
    },
  ];

  const [elements, setElements] = useState([]);
  const [nodeCount, setNodeCount] = useState(0);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [sourcedNode, setSourcedNode] = useState('');
  const [targetNode, setTargetNode] = useState('');
  const [inputEdgeLabel, setInputEdgeLabel] = useState('');
  const cyRef = useRef(null);

  // Функция для добавления узла
  const addNode = () => {
    const newLabel = `x${nodeCount + 1}`;
    const newNode = {
      group: 'nodes',
      data: { id: Date.now(), name: `узел ${newLabel}`, label: newLabel },
      position: { x: 100, y: 100 }
    };

    // Обновляем состояние элементов
    setElements((prevElements) => [...prevElements, newNode]);

    setNodeCount(nodeCount + 1);
  };

  // Функция для изменения имени узла
  const updateNodeName = (id, newName) => {
    setElements((prevElements) =>
      prevElements.map((el) =>
        el.data.id === id ? { ...el, data: { ...el.data, name: newName } } : el
      )
    );
  };

  // Функция для удаления выбранного узла
  const deleteSelectedNode = () => {
    if (selectedNodeId) {
      setElements((prevElements) => prevElements.filter(el => el.data.id !== selectedNodeId));
      setSelectedNodeId(null);
    }
  };

  // Функция для добавления связи между узлами
  const addEdge = () => {
    if (!sourcedNode || !targetNode || !inputEdgeLabel) return;

    const sourcedNodeElem = elements.filter((item) => item.data.label === sourcedNode)[0];
    const targetNodeElem = elements.filter((item) => item.data.label === targetNode)[0];
    
    if (!sourcedNodeElem || !targetNodeElem) return;

    const newEdge = { 
      data: { 
        id: Date.now(), // Увеличиваем edgeId для уникального id
        source: sourcedNodeElem.data.id, 
        target: targetNodeElem.data.id, 
        label: inputEdgeLabel 
      } 
    };

    setElements([...elements, newEdge]);
    setSourcedNode('');
    setTargetNode('');
    setInputEdgeLabel('');
  };

  // Функция для удаления выбранного узла
  const deleteSelectedEdge = () => {
    if (selectedEdgeId) {
      setElements((prevElements) => prevElements.filter(el => el.data.id !== selectedEdgeId));
      setSelectedEdgeId(null);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Сайдбар */}
      <div className="w-1/4 bg-gray-100 p-4 flex flex-col">
        {/* Управление */}
        <div className="flex flex-row gap-4">
          <div className="flex flex-col flex-1">
            <button className="bg-blue-500 text-white px-4 py-2 rounded mb-2 w-full" onClick={addNode}>Добавить узел</button>
          </div>
          <div className="flex flex-col flex-1">
            <button className="bg-red-500 text-white px-4 py-2 rounded mb-2 w-full" onClick={deleteSelectedNode} disabled={!selectedNodeId}>
              Удалить узел
            </button>
          </div>
        </div>
        <hr className="h-px my-8 bg-gray-200 border-0" />
        <div className="flex flex-col">
          <input className="px-4 py-2 mb-2 rounded w-full" type="text" placeholder="Подпись связи"
            value={inputEdgeLabel}
            onChange={(e) => setInputEdgeLabel(e.target.value)}
          />
          <div className="flex flex-row flex-1 gap-4">
            <input className="px-4 py-2 mb-2 rounded w-full" type="text" placeholder="ID 1 узла"
              value={sourcedNode}
              onChange={(e) => setSourcedNode(e.target.value)}
            />
            <input className="px-4 py-2 mb-2 rounded w-full" type="text" placeholder="ID 2 узла"
              value={targetNode}
              onChange={(e) => setTargetNode(e.target.value)}
            />
          </div>
          <button className="bg-blue-500 text-white px-4 py-2 rounded mb-2 w-full" onClick={addEdge}>Добавить связь</button>
        </div>
        <div className="flex flex-row gap-4">
          <div className="flex flex-col flex-1">
            <button className="bg-red-500 text-white px-4 py-2 rounded mb-2 w-full" onClick={deleteSelectedEdge} disabled={!selectedEdgeId}>
              Удалить связь
            </button>
          </div>
        </div>

        {/* Легенда */}
        <div className="flex flex-col h-1/3 mt-auto">
          <h2 className="text-xl font-bold mb-4 text-center">Легенда графа</h2>
          <ul className="overflow-y-auto flex-grow bg-gray-50 p-4 rounded-lg shadow-inner space-y-2">
            {elements.map((element) => {
              // Добавляем проверку на наличие element.data и element.data.id
              if (element.data?.id && element.group === 'nodes') {
                return (
                  <li key={element.data.id} className="flex items-center space-x-2">
                    <span className="text-blue-500">●</span>
                    <span className="font-medium">{element.data.label}: </span>
                    <input
                      className="border border-gray-300 rounded px-2 py-1 w-full"
                      type="text"
                      value={element.data.name}
                      onChange={(e) => updateNodeName(element.data.id, e.target.value)}
                    />
                  </li>
                );
              }
              return null; // Пропускаем элементы без id или элементы, у которых id начинается с 'e'
            })}
          </ul>
        </div>
      </div>

      {/* Схема */}
      <div className="flex-grow">
        <CytoscapeComponent
          elements={elements}
          style={{ width: "100%", height: "100%" }}
          layout={layout}
          stylesheet={stylesheet}
          cy={(cy) => {
            cyRef.current = cy;

            cy.on('select', 'node', (event) => {
              const node = event.target;
              setSelectedNodeId(node.id());
            });

            cy.on('unselect', 'node', () => {
              setSelectedNodeId(null);
            });

            cy.on('select', 'edge', (event) => {
              const edge = event.target;
              setSelectedEdgeId(edge.id());
            });

            cy.on('unselect', 'edge', () => {
              setSelectedEdgeId(null);
            });
          }}
        />
      </div>
    </div>
  );
}

export default App;
