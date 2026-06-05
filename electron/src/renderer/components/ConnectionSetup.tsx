import { useState } from 'react';
import { useStore } from '../store';
import '../styles/ConnectionSetup.css';

interface Props {
  onConnected: () => void;
}

export function ConnectionSetup({ onConnected }: Props) {
  const [ip, setIp] = useState('192.168.1.');
  const [port, setPort] = useState('8080');
  const [error, setError] = useState('');
  const [testing, setTesting] = useState(false);
  const { setServerUrl } = useStore();

  const handleConnect = async () => {
    const url = `http://${ip}:${port}`;
    setTesting(true);
    setError('');

    try {
      const res = await fetch(`${url}/health`, { mode: 'cors' });
      if (res.ok) {
        setServerUrl(url);
        onConnected();
      } else {
        setError('Server responded but health check failed');
      }
    } catch (err) {
      setError(`Cannot connect to ${ip}:${port}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="connection-setup">
      <div className="setup-card">
        <h1>🔗 Connect to Android Device</h1>
        <p>Enter the IP address and port of your Android file server</p>

        <div className="form-group">
          <label>IP Address:</label>
          <input
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="192.168.1.100"
            disabled={testing}
          />
        </div>

        <div className="form-group">
          <label>Port:</label>
          <input
            type="text"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            placeholder="8080"
            disabled={testing}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          onClick={handleConnect}
          disabled={testing || !ip || !port}
          className="connect-button"
        >
          {testing ? 'Testing connection...' : 'Connect'}
        </button>

        <div className="help-text">
          <p>💡 Make sure your Android device is on the same WiFi network</p>
          <p>💡 Start the file server on Android: <code>npm start</code></p>
        </div>
      </div>
    </div>
  );
}
