import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom'; // Import the zoom plugin

// Register ChartJS components and zoom plugin
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  zoomPlugin // Register the plugin
);

function App() {
  const [weights, setWeights] = useState([]);
  const [newWeight, setNewWeight] = useState('');
  const [newDate, setNewDate] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editId, setEditId] = useState(null); // Track which entry is being edited
  const chartRef = React.useRef(null);

  useEffect(() => {
    fetch('/api/weights')
      .then((response) => response.json())
      .then((data) => setWeights(data))
      .catch((error) => console.error('Error fetching weights:', error));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newWeight || !newDate) {
      alert('Please enter both weight and date.');
      return;
    }

    const newEntry = { weight: parseFloat(newWeight), date: newDate };
    fetch('/api/weights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry),
    })
      .then((response) => response.json())
      .then((addedEntry) => {
        setWeights((prevWeights) => [...prevWeights, addedEntry]);
        setNewWeight('');
        setNewDate('');
      })
      .catch((error) => console.error('Error adding weight:', error));
  };

  const handleEdit = (id, weight, date) => {
    setEditId(id);
    setEditWeight(weight);
    setEditDate(date);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!editWeight || !editDate) {
      alert('Please enter both weight and date.');
      return;
    }

    const updatedEntry = { weight: parseFloat(editWeight), date: editDate };
    fetch(`/api/weights/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedEntry),
    })
      .then((response) => response.json())
      .then((updatedEntry) => {
        setWeights((prevWeights) =>
          prevWeights.map((entry) =>
            entry.id === updatedEntry.id ? updatedEntry : entry
          )
        );
        setEditId(null);
        setEditWeight('');
        setEditDate('');
      })
      .catch((error) => console.error('Error updating weight:', error));
  };

  const handleDelete = (id) => {
    fetch(`/api/weights/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        setWeights((prevWeights) =>
          prevWeights.filter((entry) => entry.id !== id)
        );
      })
      .catch((error) => console.error('Error deleting weight:', error));
  };

  // Process the weights to keep only the lowest weight for each date
  const processLowestWeights = (weights) => {
    const weightsByDate = {};
    
    // Group weights by date and find the lowest for each date
    weights.forEach(entry => {
      if (!weightsByDate[entry.date] || entry.weight < weightsByDate[entry.date].weight) {
        weightsByDate[entry.date] = entry;
      }
    });
    
    // Convert object back to array
    return Object.values(weightsByDate);
  };

  // Sort weights by date and process to keep only lowest per date
  const sortedLowestWeights = processLowestWeights([...weights].sort((a, b) => new Date(a.date) - new Date(b.date)));
  
  // Calculate max weight for y-axis scaling
  const maxWeight = weights.length > 0 
    ? Math.max(...weights.map(entry => parseFloat(entry.weight))) + 10
    : 100; // Default if no data

  const chartData = {
    labels: sortedLowestWeights.map((entry) => entry.date),
    datasets: [
      {
        label: 'Lowest Weight Each Day',
        data: sortedLowestWeights.map((entry) => entry.weight),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Weight Progress',
      },
      zoom: {
        pan: {
          enabled: false, // Disable panning to prevent the odd scale issues
        },
        zoom: {
          wheel: {
            enabled: true,
            speed: 0.1, // Moderate zoom speed
          },
          pinch: {
            enabled: true
          },
          mode: 'y', // Only zoom on y-axis to prevent date axis distortion
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.parsed.y} kg`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Weight (kg)',
        },
        min: 0, // Start from 0
        max: maxWeight, // Go to max weight + 10
        // Add dashed grid lines at every 10kg
        grid: {
          color: function(context) {
            // Check if it's a major grid line (every 10 units)
            if (context.tick.value % 10 === 0) {
              return 'rgba(0, 0, 0, 0.2)'; // Darker for major grid lines
            }
            return 'rgba(0, 0, 0, 0.05)'; // Lighter for minor grid lines
          },
          lineWidth: function(context) {
            // Make the grid line thicker and dashed for every 10kg
            if (context.tick.value % 10 === 0) {
              return 1.5;
            }
            return 0.5;
          },
          drawTicks: true,
          drawBorder: true,
          drawOnChartArea: true,
          borderDash: function(context) {
            // Make the line dashed for every 10kg
            if (context.tick.value % 10 === 0) {
              return [5, 5]; // Dashed line pattern
            }
            return [0, 0]; // Solid line for minor grid lines
          }
        }
      },
    },
  };

  // Sort all weights by date for the table view
  const allSortedWeights = [...weights].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Reset zoom handler
  const resetZoom = () => {
    if (chartRef && chartRef.current) {
      chartRef.current.resetZoom();
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Weight Tracker</h1>

      {/* Add Weight Form */}
      <form onSubmit={handleSubmit} className="mb-6 flex gap-4">
        <input
          type="number"
          placeholder="Weight (kg)"
          value={newWeight}
          onChange={(e) => setNewWeight(e.target.value)}
          className="p-2 border rounded"
          step="0.1"
        />
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          className="p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Weight
        </button>
      </form>

      {/* Edit Weight Form */}
      {editId && (
        <form onSubmit={handleUpdate} className="mb-6 flex gap-4">
          <input
            type="number"
            placeholder="Edit Weight (kg)"
            value={editWeight}
            onChange={(e) => setEditWeight(e.target.value)}
            className="p-2 border rounded"
            step="0.1"
          />
          <input
            type="date"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
            className="p-2 border rounded"
          />
          <button
            type="submit"
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Update Weight
          </button>
          <button
            type="button"
            onClick={() => setEditId(null)}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Chart */}
      <div className="mb-6" style={{ height: '500px' }}>
        <div className="flex justify-end mb-2">
          <button
            onClick={resetZoom}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Reset View
          </button>
        </div>
        <Line data={chartData} options={chartOptions} ref={chartRef} />
      </div>

      {/* Weights Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Weight (kg)</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {allSortedWeights.map((entry) => (
              <tr key={entry.id}>
                <td className="p-2 border">{entry.date}</td>
                <td className="p-2 border">{entry.weight}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => handleEdit(entry.id, entry.weight, entry.date)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded ml-2 hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;