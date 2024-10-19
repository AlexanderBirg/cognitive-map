import React, { useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import "./App.css";

function App() {
  const [elements, setElements] = useState([]);
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
        "background-color": "data(color)",
        color: "#000",
        "font-size": "22px",
        width: "80px",
        height: "80px",
      },
    },
    {
      selector: "edge",
      style: {
        width: 2,
        "line-color": "#ccc",
        "target-arrow-color": "#ccc",
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
      selector: "node:selected",
      style: {
        "border-width": "2px",
        "border-color": "#FF4500", // Цвет границы для выбранного элемента
        "background-color": "#FFD700", // Цвет фона для выбранного элемента
      },
    },
  ];

  const [newNodeName, setNewNodeName] = useState('');
  const [nodeCount, setNodeCount] = useState(0);

  const addNode = () => {
    if (!newNodeName.trim()) return;

    const newNodeId = `${Date.now()}`;
    const newLabel = `x${nodeCount + 1}`;
    const newNode = {
      group: 'nodes',
      data: { id: newNodeId, name: newNodeName, label: newLabel },
      position: { x: 100, y: 100 }
    };

    // Обновляем состояние элементов
    setElements((prevElements) => [...prevElements, newNode]);

    setNodeCount(nodeCount + 1);
    setNewNodeName('');
  };

  return (
    <div className="flex h-screen">
      {/* Сайдбар */}
      <div className="w-1/4 bg-gray-100 p-4 flex flex-col justify-between">
        {/* Управление */}
        <div className="flex flex-row gap-4">
          <div className="flex flex-col flex-1">
            <input className="px-4 py-2 mb-2 rounded w-full" type="text" placeholder="Название узла"
              value={newNodeName}
              onChange={(e) => setNewNodeName(e.target.value)}
            />
            <button className="bg-blue-500 text-white px-4 py-2 rounded mb-2 w-full" onClick={addNode}>Добавить узел</button>
          </div>
        </div>

        {/* Легенда */}
        <div className="flex flex-col h-1/3">
          <h2 className="text-xl font-bold mb-4 text-center">Легенда графа</h2>
          <ul className="overflow-y-auto flex-grow bg-gray-50 p-4 rounded-lg shadow-inner space-y-2">
            {elements.map((element) => {
              // Добавляем проверку на наличие element.data и element.data.id
              if (element.data?.id && element.data.id[0] !== 'e') {
                return (
                  <li key={element.data.id} className="flex items-center space-x-2">
                    <span className="text-blue-500">●</span>
                    <span className="font-medium">{element.data.label}</span>: {element.data.name}
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
        />
      </div>
    </div>
  );
}

export default App;
