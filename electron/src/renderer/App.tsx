import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ConnectionSetup } from './components/ConnectionSetup';
import { FileExplorer } from './components/FileExplorer';
import { useStore } from './store';
import './App.css';

export function App() {
  const { serverUrl } = useStore();
  const [isConnected, setIsConnected] = useState(false);

  const { data: healthCheck, isLoading } = useQuery({
    queryKey: ['health', serverUrl],
    queryFn: async () => {
      if (!serverUrl) return null;
      const res = await fetch(`${serverUrl}/health`);
      return res.json();
    },
    enabled: !!serverUrl,
    staleTime: 30000,
  });

  if (!serverUrl) {
    return <ConnectionSetup onConnected={() => setIsConnected(true)} />;
  }

  if (isLoading) {
    return (
      <div className="container">
        <p>Connecting to Android device...</p>
      </div>
    );
  }

  if (!healthCheck) {
    return (
      <div className="container">
        <p>❌ Cannot reach Android device at {serverUrl}</p>
        <button onClick={() => useStore.setState({ serverUrl: null })}>
          Change Server
        </button>
      </div>
    );
  }

  return <FileExplorer />;
}
