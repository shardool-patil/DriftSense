import { useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Activity, AlertTriangle, CheckCircle, Zap, HelpCircle } from 'lucide-react';

export default function App() {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('Awaiting Data...');
  const [isDrifting, setIsDrifting] = useState(false);
  const [explanation, setExplanation] = useState(null);

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
      // Note: Handling both snake_case and camelCase depending on Spring Boot's JSON serialization
      const isFailure = newLog.predictionClass === 1 || newLog.prediction_class === 1;
      setStatus(isFailure ? 'System Failure Detected' : 'System Healthy');
      setIsDrifting(isFailure);

      // 3. Update XAI Explanation Data
      if (newLog.explanation) {
         setExplanation([
            { name: 'Temperature', impact: newLog.explanation.temperature_impact || newLog.explanation.temperatureImpact },
            { name: 'Vibration', impact: newLog.explanation.vibration_impact || newLog.explanation.vibrationImpact }
         ]);
      }

      // Add the new data point to the chart, keeping only the last 15 points
      setLogs(prevLogs => {
        const updated = [...prevLogs, {
          time: new Date(newLog.recordedAt || Date.now()).toLocaleTimeString(),
          Temperature: newLog.temperature || parseFloat(temp),
          Vibration: newLog.vibration || parseFloat(vib)
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
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        
        {/* Live Chart Panel */}
        <div style={{ flex: '3 1 600px', backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
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

        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Control Panel */}
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                style={{ padding: '12px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', gap: '8px' }}
              >
                <Zap size={18} /> Inject Concept Drift
              </button>
            </div>

            {/* Explainable AI (XAI) Panel */}
            <div style={{ 
                backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem', 
                border: isDrifting ? '2px solid #ef4444' : '2px solid transparent', transition: 'all 0.3s ease' 
            }}>
                <h3 style={{ margin: 0, color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HelpCircle size={20} color={isDrifting ? "#ef4444" : "#94a3b8"} /> 
                    AI "Why" Engine
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>Root cause analysis using SHAP values.</p>
                
                {!explanation ? (
                    <div style={{ padding: '2rem 0', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                        Awaiting inference data...
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={150}>
                        <BarChart data={explanation} layout="vertical" margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" domain={[0, 100]} hide />
                            <YAxis dataKey="name" type="category" width={85} tick={{ fill: '#475569', fontSize: 12 }} />
                            <Tooltip formatter={(value) => `${value}%`} />
                            <Bar dataKey="impact" radius={[0, 4, 4, 0]} barSize={20}>
                                {explanation.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.name === 'Temperature' ? '#ef4444' : '#3b82f6'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}