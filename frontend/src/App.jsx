import { useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

export default function App() {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('Awaiting Data...');
  const [isDrifting, setIsDrifting] = useState(false);

  // The URL to our Spring Boot Orchestrator
  const API_URL = 'http://localhost:8080/api/sensors/record';

  const sendData = async (type) => {
    // Generate random data based on the type of signal we want to simulate
    const temp = type === 'normal' 
      ? (Math.random() * 20 + 40).toFixed(2) // Normal: 40-60 degrees
      : (Math.random() * 20 + 85).toFixed(2); // Drift/Failure: 85-105 degrees
      
    const vib = type === 'normal'
      ? (Math.random() * 10 + 10).toFixed(2) // Normal: 10-20 Hz
      : (Math.random() * 20 + 40).toFixed(2); // Drift/Failure: 40-60 Hz

    try {
      // 1. Send the data to Spring Boot (which asks Python for the prediction)
      const response = await axios.post(API_URL, {
        temperature: parseFloat(temp),
        vibration: parseFloat(vib)
      });

      const newLog = response.data;
      
      // 2. Update the UI state
      const isFailure = newLog.predictionClass === 1;
      setStatus(isFailure ? 'System Failure Detected' : 'System Healthy');
      setIsDrifting(isFailure);

      // Add the new data point to the chart, keeping only the last 15 points
      setLogs(prevLogs => {
        const updated = [...prevLogs, {
          time: new Date(newLog.recordedAt).toLocaleTimeString(),
          Temperature: newLog.temperature,
          Vibration: newLog.vibration
        }];
        return updated.slice(-15); 
      });

    } catch (error) {
      console.error("Failed to reach Spring Boot API", error);
      setStatus('API Connection Error');
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#0f172a' }}>
            <Activity color="#2563eb" /> DriftSense MLOps
          </h1>
          <p style={{ color: '#64748b', marginTop: '5px' }}>Real-time Edge AI Monitoring Dashboard</p>
        </div>
        
        {/* Dynamic Status Indicator */}
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', 
          borderRadius: '50px', fontWeight: 'bold',
          backgroundColor: isDrifting ? '#fee2e2' : '#dcfce7',
          color: isDrifting ? '#991b1b' : '#166534'
        }}>
          {isDrifting ? <AlertTriangle /> : <CheckCircle />}
          {status}
        </div>
      </div>

      {/* Main Content: Chart & Controls */}
      <div style={{ display: 'flex', gap: '2rem' }}>
        
        {/* Live Chart Panel */}
        <div style={{ flex: 3, backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, color: '#334155' }}>Live Telemetry</h3>
          {logs.length === 0 ? (
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              No data flowing. Click 'Send Normal Data' to begin.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={logs}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Temperature" stroke="#ef4444" strokeWidth={2} animationDuration={300} />
                <Line type="monotone" dataKey="Vibration" stroke="#3b82f6" strokeWidth={2} animationDuration={300} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Control Panel */}
        <div style={{ flex: 1, backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ marginTop: 0, color: '#334155' }}>Chaos Controls</h3>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Simulate data flowing from the industrial edge devices.</p>
          
          <button 
            onClick={() => sendData('normal')}
            style={{ padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', gap: '8px' }}
          >
            <Activity size={18} /> Send Normal Data
          </button>
          
          <button 
            onClick={() => sendData('drift')}
            style={{ padding: '12px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '1rem' }}
          >
            <Zap size={18} /> Inject Concept Drift
          </button>
        </div>
      </div>

    </div>
  );
}