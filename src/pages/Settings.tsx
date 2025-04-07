
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrokerConnectionForm } from '@/components/settings/BrokerConnectionForm';
import OpenAIConfigForm from '@/components/settings/OpenAIConfigForm';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('broker');
  
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your trading platform settings and integrations</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="broker">Broker</TabsTrigger>
            <TabsTrigger value="ai">AI Settings</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>
          
          <TabsContent value="broker" className="space-y-4">
            <BrokerConnectionForm />
          </TabsContent>
          
          <TabsContent value="ai" className="space-y-4">
            <OpenAIConfigForm />
          </TabsContent>
          
          <TabsContent value="preferences" className="space-y-4">
            <div className="bg-muted p-8 rounded-lg text-center">
              <h3 className="text-lg font-medium">Preferences</h3>
              <p className="text-muted-foreground mt-2">
                User preferences settings will be available soon
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
