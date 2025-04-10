
import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface ControlModeAlertProps {
  enabled: boolean;
}

const ControlModeAlert: React.FC<ControlModeAlertProps> = ({ enabled }) => {
  if (!enabled) return null;
  
  return (
    <div className="bg-amber-100 dark:bg-amber-900/20 flex items-center gap-2 px-3 py-1.5 rounded-md mb-3 text-amber-800 dark:text-amber-300 text-xs">
      <ShieldCheck className="h-4 w-4" />
      <span>Control Mode Enabled - Assistant can execute trading commands</span>
    </div>
  );
};

export default ControlModeAlert;
