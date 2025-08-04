import React from 'react';
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const EditDialog = ({
  isOpen,
  onClose,
  title,
  children,
  onSave,
  isSaving = false,
  className = '',
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`sm:max-w-[500px] max-h-[90vh] flex flex-col ${className}`}>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 overflow-y-auto flex-1">
          {children}
        </div>
        
        <DialogFooter className="flex-shrink-0 sm:justify-between border-t pt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isSaving}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              console.log('🔴 EDIT DIALOG - Save button clicked!');
              console.log('🔴 EDIT DIALOG - onSave function:', onSave);
              console.log('🔴 EDIT DIALOG - About to call onSave...');
              onSave();
            }}
            disabled={isSaving}
            className="min-w-[100px]"
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditDialog;
