import React, { useState, useRef, useEffect } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import "./App.css";
import ControlPanel from "./Components/ControlPanel/ControlPanel";

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
      selector: "edge.dashed",
      style: {
        "line-style": "dashed",
      },
    },
  ];

  const [elements, setElements] = useState([]);
  const [nodeCount, setNodeCount] = useState(0);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [sourcedNode, setSourcedNode] = useState('');
  const [targetNode, setTargetNode] = useState('');
  const cyRef = useRef(null);

  const [activeButton, setActiveButton] = useState(false);
  const [edgeStyle, setEdgeStyle] = useState('solid');

  const [showEdgeLabelInput, setShowEdgeLabelInput] = useState(false);
  const [editingEdgeId, setEditingEdgeId] = useState('');
  const [editingEdgeLabel, setEditingEdgeLabel] = useState('');
  const [editingEdgeInputPosition, setEditingEdgeInputPosition] = useState({x: 0, y: 0});

  // Функция для добавления узла
  const addNode = (position = { x: 100, y: 100 }) => {
    const newLabel = `x${nodeCount + 1}`;
    const newNode = {
      group: 'nodes',
      data: { id: Date.now(), name: `узел ${newLabel}`, label: newLabel },
      position,
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

  const deleteElem = (elemID) => {
    if (!elemID) return;

    setElements((prevElements) => prevElements.filter(el => el.data.id !== elemID));
  };

  // Функция для добавления связи между узлами
  const addEdge = () => {
    if (!sourcedNode || !targetNode) return;

    const sourcedNodeElem = elements.filter((item) => item.data.id === sourcedNode)[0];
    const targetNodeElem = elements.filter((item) => item.data.id === targetNode)[0];
    const inputEdgeLabel = edgeStyle === 'solid' ? '+1' : '-1';
    
    if (!sourcedNodeElem || !targetNodeElem) return;

    const newEdge = {
      group: "edges",
      data: { 
        id: Date.now(), // Увеличиваем edgeId для уникального id
        source: sourcedNodeElem.data.id, 
        target: targetNodeElem.data.id, 
        label: inputEdgeLabel,
      },
      style: {
        "line-style": edgeStyle,
      },
    };

    setElements([...elements, newEdge]);
    setSourcedNode('');
    setTargetNode('');
  };

  const updateEdgeLabel = () => {
    setElements((prevElements) =>
      prevElements.map((el) => {
        if (el.data.id === editingEdgeId) {
          return { ...el, data: { ...el.data, label: editingEdgeLabel } };
        }
        return el;
      })
    );
    setEditingEdgeId('');
    setEditingEdgeLabel('');
  };

  // Функция для удаления выбранного узла
  const deleteSelectedEdge = () => {
    if (selectedEdgeId) {
      setElements((prevElements) => prevElements.filter(el => el.data.id !== selectedEdgeId));
      setSelectedEdgeId(null);
    }
  };

  // Функция для получения элемента с максимальным числом в label
  const getMaxLabelNode = (arr) => {
    return arr.reduce((maxElement, currentElement) => {
      // Извлекаем число после 'x'
      const currentNumber = parseInt(currentElement.data.label.slice(1), 10);
      const maxNumber = maxElement ? parseInt(maxElement.data.label.slice(1), 10) : -Infinity;

      // Сравниваем текущий элемент с максимальным
      return currentNumber > maxNumber ? currentElement : maxElement;
    }, null);
  };

  // Экспорт графа в JSON
  const exportToJson = () => {
    const json = JSON.stringify(elements, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "graph.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Импорт графа из JSON
  const importFromJson = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const json = e.target.result;
      setElements(() => {
        const newElements = JSON.parse(json);
        const maxLabelNode = getMaxLabelNode(newElements);
        setNodeCount(+maxLabelNode.data.label.slice(1));

        return newElements;
      });
    };
    reader.readAsText(file);
  };

  // Экспорт матрицы узлов
  const exportMatrix = () => {
    const nodes = elements
      .filter(item => item.group === 'nodes')
      .map(node => ({ id: node.data.id, label: node.data.label }));

    // Создаем заголовок и пустую матрицу
    const matrix = [];
    const headerRow = [" "].concat(nodes.map(node => node.label)); // Первая строка с именами узлов
    matrix.push(headerRow);

    // Создаем пустые строки матрицы для каждого узла
    nodes.forEach((node) => {
      const row = Array(nodes.length + 1).fill(""); // Пустая строка
      row[0] = node.label; // Имя узла в первом столбце
      matrix.push(row);
    });

    // Заполняем матрицу значениями из связей (edges)
    elements
      .filter(item => item.group === 'edges')
      .forEach(edge => {
        const sourceIndex = nodes.findIndex(node => node.id === edge.data.source) + 1;
        const targetIndex = nodes.findIndex(node => node.id === edge.data.target) + 1;

        if (sourceIndex > 0 && targetIndex > 0) {
          matrix[sourceIndex][targetIndex] = edge.data.label;
        }
      });

    // Преобразование матрицы в CSV
    const csvContent = "data:text/csv;charset=utf-8," + 
      matrix.map(row => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "matrix.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Функция снятия выделения с элемента
  const unselectElem = (elemID) => {
    const cy = cyRef.current;
    const sourcedNodeElement = cy.getElementById(elemID);

    if (sourcedNodeElement) {
      sourcedNodeElement.unselect();
    }
  };

  // тапы по холсту
  useEffect(() => {
    const cy = cyRef.current;

    cy.minZoom(0.1);
    cy.maxZoom(1);

    cy.on('tap', (event) => {
      const isTapOnBackground = event.target === cy;

      switch (activeButton) {
        case 'addNode':
          if (!isTapOnBackground) break;

          addNode(event.position);

          break;
        case 'addEdge':
          if (isTapOnBackground) break;

          if (!sourcedNode) {
            setSourcedNode(event.target.id());
            break;
          }

          if (!targetNode) {
            setTargetNode(event.target.id());
          }

          break;
        case 'delete':
          if (isTapOnBackground) break;

          deleteElem(event.target.id());

          break;
      }
    });

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

    cy.on('dbltap', 'edge', (event) => {
      const edge = event.target;
      setEditingEdgeId(edge.id());
      setEditingEdgeLabel(edge.data('label'));
      setEditingEdgeInputPosition(event.position);
      setShowEdgeLabelInput(true);
    });

    return () => {
      cy.off('tap');
      cy.off('select');
      cy.off('unselect');
      cy.off('dbltap');
    };
  }, [activeButton, elements, sourcedNode, targetNode]);

  // добавление связи
  useEffect(() => {
    if (sourcedNode && targetNode) {
      unselectElem(targetNode);
      addEdge();
    }
  }, [sourcedNode, targetNode]);

  return (
    <div className="flex h-screen">
      {/* Сайдбар */}
      <div className="w-1/4 bg-gray-100 p-4 flex flex-col">
        {/* Легенда */}
        <div className="flex flex-col flex-grow mb-8">
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

        {/* Экспорт/импорт данных */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <button 
              onClick={exportMatrix} 
              className="inline-flex flex-1 justify-center bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition duration-300 ease-in-out transform"
            >
              Экспортировать матрицу
            </button>
            <button 
              onClick={exportToJson} 
              className="inline-flex flex-1 justify-center bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition duration-300 ease-in-out transform"
            >
              Экспортировать граф в JSON
            </button>
          </div>

          <div className="flex justify-center">
            <label className="block text-center">
              <span className="text-gray-700 font-semibold">Импортировать граф из JSON</span>
              <input 
                type="file" 
                accept=".json" 
                onChange={importFromJson} 
                className="block w-full text-sm text-gray-500 mt-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Схема */}
      <div className="flex-grow relative">
        {/* Управление */}
        <ControlPanel cyRef={cyRef} activeButtonState={setActiveButton} setEdgeStyle={setEdgeStyle} />


        {/* Поле для редактирования label связи */}
        <input
          className={`absolute z-10 w-8 px-2 py-1 rounded border border-gray-300
            ${showEdgeLabelInput ? "block" : "hidden"}`}
          style={{ left: editingEdgeInputPosition.x, top: editingEdgeInputPosition.y }}
          type="text"
          value={editingEdgeLabel}
          onChange={(e) => setEditingEdgeLabel(e.target.value)}
          onBlur={() => {
            updateEdgeLabel(); 
            setShowEdgeLabelInput(false);
          }}
        />

        {/* Холст */}
        <CytoscapeComponent
          elements={elements}
          style={{ width: "100%", height: "100%" }}
          layout={layout}
          stylesheet={stylesheet}
          cy={(cy) => {
            cyRef.current = cy;
          }}
        />
      </div>
    </div>
  );
}

export default App;
