import { useEffect, useState } from 'react';
import { Thermometer, Droplets, Wifi, WifiOff } from 'lucide-react';

interface SensorData {
  groupName: string;
  temperature: number;
  humidity: number;
  timestamp: number;
}

interface GroupData {
  [groupName: string]: SensorData;
}

const WS_URL = 'https://iot-584n.onrender.com';

const GROUP_COLORS = [
  'from-slate-800 to-slate-900 border-slate-700',
  'from-zinc-800 to-zinc-900 border-zinc-700',
  'from-neutral-800 to-neutral-900 border-neutral-700',
  'from-stone-800 to-stone-900 border-stone-700',
  'from-gray-800 to-gray-900 border-gray-700',
];

function getGroupColor(index: number): string {
  return GROUP_COLORS[index % GROUP_COLORS.length];
}

function App() {
  const [groupData, setGroupData] = useState<GroupData>({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      try {
        ws = new WebSocket(WS_URL);

        ws.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data: SensorData = JSON.parse(event.data);
            setGroupData((prev) => ({
              ...prev,
              [data.groupName]: {
                ...data,
                timestamp: Date.now(),
              },
            }));
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
          reconnectTimeout = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, 3000);
        };
      } catch (error) {
        console.error('Connection error:', error);
        reconnectTimeout = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const groups = Object.values(groupData).sort((a, b) =>
    a.groupName.localeCompare(b.groupName)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <Thermometer className="w-10 h-10 text-blue-400" />
              IOT Session For Friday 10th
            </h1>
            <div className="flex items-center gap-3">
              {isConnected ? (
                <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-lg border border-green-500/30">
                  <Wifi className="w-5 h-5" />
                  <span className="font-medium">Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-lg border border-red-500/30">
                  <WifiOff className="w-5 h-5" />
                  <span className="font-medium">Disconnected</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <label className="text-slate-300 font-medium whitespace-nowrap">
                WebSocket URL:
              </label>
              <code className="flex-1 bg-slate-900/50 text-blue-400 px-4 py-2 rounded-lg font-mono text-sm">
                {WS_URL}
              </code>
            </div>
          </div>
        </div>

        {groups.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-12 text-center">
            <Thermometer className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-slate-400 mb-2">
              Waiting for sensor data...
            </h2>
            <p className="text-slate-500">
              {isConnected
                ? 'Connected and ready to receive data'
                : 'Attempting to connect to backend'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {groups.map((group, index) => (
              <div
                key={group.groupName}
                className={`bg-gradient-to-br ${getGroupColor(index)} border rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105`}
              >
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-white mb-1">
                    {group.groupName}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Last update: {new Date(group.timestamp).toLocaleTimeString()}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-orange-500/20 p-2 rounded-lg">
                        <Thermometer className="w-6 h-6 text-orange-400" />
                      </div>
                      <span className="text-sm font-medium text-slate-300">
                        Temperature
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-white">
                        {group.temperature.toFixed(1)}
                      </span>
                      <span className="text-lg text-slate-400">°C</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-blue-500/20 p-2 rounded-lg">
                        <Droplets className="w-6 h-6 text-blue-400" />
                      </div>
                      <span className="text-sm font-medium text-slate-300">
                        Humidity
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-white">
                        {group.humidity.toFixed(1)}
                      </span>
                      <span className="text-lg text-slate-400">%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
