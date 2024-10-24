import { useState, useEffect } from 'react';
import { AddNodeIcon } from "../../services/svg/AddNodeIcon";
import { AddEdgeIcon } from "../../services/svg/AddEdgeIcon";
import { AddDashedEdgeIcon } from "../../services/svg/AddDashedEdgeIcon";
import { DeleteIcon } from "../../services/svg/DeleteIcon";
import { CenteringIcon } from "../../services/svg/CenteringIcon";

const ControlPanel = ({ cyRef, activeButtonState, setEdgeStyle }) => {
  const [activeTool, setActiveTool] = useState(null);
  const [activeDrop, setActiveDrop] = useState(null);
  const [selectedEdgeStyle, setSelectedEdgeStyle] = useState('solid');

  useEffect(() => {
    setEdgeStyle(selectedEdgeStyle);
  }, [selectedEdgeStyle]);

  const handleToolClick = (toolName) => {
    if (toolName === activeTool) {
      setActiveTool(null);
      activeButtonState(null);
    }
    else {
      setActiveTool(toolName);
      activeButtonState(toolName);
    }
  };

  const renderIcon = () => {
    switch (selectedEdgeStyle) {
      case 'solid':
        return <AddEdgeIcon className="fill-transparent stroke-blue-600" />;
      case 'dashed':
        return <AddDashedEdgeIcon className="fill-transparent stroke-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="absolute z-10 bottom-20 flex justify-center w-full">
      <div className="flex items-center justify-center gap-4 py-2.5 px-5 bg-gray-100 rounded-lg">
        <button
          className={`inline-flex items-center justify-center w-12 h-12 py-1 px-1 text-white font-bold rounded-lg 
            ${activeTool === 'addNode' ? 'bg-gray-400' : 'hover:bg-gray-200'}`}
          onClick={() => handleToolClick('addNode')}
        >
          <AddNodeIcon className="fill-transparent stroke-blue-600" />
        </button>
        <div 
          className='relative'
          onMouseOver={() => setActiveDrop('addEdge')}
          onMouseOut={() => setActiveDrop('')}
          onMouseMove={() => setActiveDrop('addEdge')}
        >
          <button
            className={`inline-flex items-center justify-center w-12 h-12 py-1 px-1 text-white font-bold rounded-lg 
              ${activeTool === 'addEdge' ? 'bg-gray-400' : 'hover:bg-gray-200'}`}
            onClick={() => handleToolClick('addEdge')}
          >
            {renderIcon()}
          </button>
          <div 
            className={`absolute left-0 bottom-full inline-flex flex-col items-center justify-center py-5 gap-2 rounded-lg
              ${activeDrop === 'addEdge' ? 'visible' : 'invisible'}
            `}
          >
            <button
              className={`inline-flex items-center justify-center w-12 h-12 py-1 px-1 text-white font-bold rounded-lg 
                ${selectedEdgeStyle === 'solid' ? 'hidden' : 'inline-flex'}`}
              onClick={() => setSelectedEdgeStyle('solid')}
            >
              <AddEdgeIcon className="fill-transparent stroke-blue-600" />
            </button>
            <button
              className={`inline-flex items-center justify-center w-12 h-12 py-1 px-1 text-white font-bold rounded-lg 
                ${selectedEdgeStyle === 'dashed' ? 'hidden' : 'inline-flex'}`}
              onClick={() => setSelectedEdgeStyle('dashed')}
            >
              <AddDashedEdgeIcon className="fill-transparent stroke-blue-600" />
            </button>
          </div>
        </div>
        <button
          className={`inline-flex items-center justify-center w-12 h-12 py-1 px-1 text-white font-bold rounded-lg 
            ${activeTool === 'delete' ? 'bg-gray-400' : 'hover:bg-gray-200'}`}
          onClick={() => handleToolClick('delete')}
        >
          <DeleteIcon className="fill-transparent stroke-blue-600" />
        </button>
        <button
          className="inline-flex items-center justify-center w-12 h-12 py-1 px-1 text-white font-bold rounded-lg hover:bg-gray-200"
          onClick={() => {
            cyRef.current.fit();
          }}
        >
          <CenteringIcon className="fill-blue-600" />
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
