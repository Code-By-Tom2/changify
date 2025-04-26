'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export default function TestPage() {
  const [dbStatus, setDbStatus] = useState<string>('Testing...');
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch('/api/test');
        const data = await response.json();
        setDbStatus(data.status);
      } catch (error) {
        setDbStatus('Error testing connection');
        console.error('Error:', error);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold">System Test Page</h1>
        
        {/* Database Test Section */}
        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-2xl font-semibold mb-4">Database Connection Test</h2>
          <p className="text-lg">
            Status: <span className={dbStatus.includes('successful') ? 'text-green-500' : 'text-red-500'}>
              {dbStatus}
            </span>
          </p>
        </div>

        {/* Theme Test Section */}
        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-2xl font-semibold mb-4">Theme Test</h2>
          <p className="mb-4">Current theme: {theme}</p>
          <div className="space-x-4">
            <button
              onClick={() => setTheme('light')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Dark
            </button>
            <button
              onClick={() => setTheme('system')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              System
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 