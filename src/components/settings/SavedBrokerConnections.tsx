
import React from 'react';
import { BrokerConnection } from '@/types/supabase';

interface SavedConnectionsProps {
  connections: BrokerConnection[];
}

const SavedBrokerConnections: React.FC<SavedConnectionsProps> = ({ connections }) => {
  if (connections.length === 0) return null;
  
  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium mb-3">Saved Connections</h3>
      <div className="space-y-3">
        {connections.map((connection) => (
          <div
            key={connection.id}
            className="flex items-center justify-between p-3 bg-muted rounded-lg"
          >
            <div>
              <p className="font-medium">{connection.broker_name}</p>
              <p className="text-sm text-muted-foreground">
                {connection.broker_type} • Connected {new Date(connection.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <div className="flex items-center h-6">
                {connection.is_active ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <span className="mr-1 h-2 w-2 rounded-full bg-green-500"></span>
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <span className="mr-1 h-2 w-2 rounded-full bg-gray-500"></span>
                    Inactive
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedBrokerConnections;
