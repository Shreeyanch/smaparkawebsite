import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

const DEFAULT_ITEM = { itemName: "", goal: 1 };

const MissionItemsEditor = ({ items, onChange, isDarkMode }) => {
  const [newItem, setNewItem] = useState(DEFAULT_ITEM);

  const inputCls = `px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-sm ${
    isDarkMode
      ? "bg-gray-800 border-gray-600 text-white placeholder-gray-500"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
  }`;

  const handleAdd = () => {
    const name = (newItem.itemName || "").trim();
    if (!name) return;
    const goal = Math.max(1, parseInt(newItem.goal, 10) || 1);
    onChange([...items, { itemName: name, goal, progress: 0 }]);
    setNewItem(DEFAULT_ITEM);
  };

  const handleRemove = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {items.length > 0 && (
        <div className="space-y-1">
          {items.map((item, i) => (
            <div
              key={i}
              className={`flex items-center justify-between px-3 py-2 rounded-md border text-sm ${
                isDarkMode
                  ? "border-gray-600 bg-gray-700"
                  : "border-gray-200 bg-white"
              }`}
            >
              <span className={isDarkMode ? "text-gray-200" : "text-gray-800"}>
                {item.itemName}
              </span>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Goal: {item.goal}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  className="p-1 text-red-500 hover:text-red-600"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={newItem.itemName}
          onChange={(e) =>
            setNewItem((p) => ({ ...p, itemName: e.target.value }))
          }
          placeholder="Item name (e.g. Espresso)"
          className={`flex-1 ${inputCls}`}
        />
        <input
          type="number"
          min={1}
          value={newItem.goal}
          onChange={(e) => setNewItem((p) => ({ ...p, goal: e.target.value }))}
          placeholder="Goal"
          className={`w-20 ${inputCls}`}
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-3 py-2 rounded-md text-sm bg-green-600 text-white hover:bg-green-700 flex items-center gap-1 whitespace-nowrap"
        >
          <Plus size={14} /> Add
        </button>
      </div>
      {items.length === 0 && (
        <p
          className={`text-xs ${
            isDarkMode ? "text-amber-400" : "text-amber-600"
          }`}
        >
          Add at least one item to this mission.
        </p>
      )}
    </div>
  );
};

export default MissionItemsEditor;
