
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';

interface TradeConfirmationDialogProps {
  show: boolean;
  command: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (confirmed: boolean) => void;
}

const TradeConfirmationDialog: React.FC<TradeConfirmationDialogProps> = ({
  show,
  command,
  onOpenChange,
  onConfirm
}) => {
  return (
    <Dialog open={show} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Trade Execution</DialogTitle>
          <DialogDescription>
            You're about to execute a real trading command. Please confirm this action.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-muted p-3 rounded-md text-sm">
          {command}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onConfirm(false)}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm(true)}>
            Confirm Trade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TradeConfirmationDialog;
