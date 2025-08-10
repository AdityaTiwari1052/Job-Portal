import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Plus, Trash2, GraduationCap, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { ConfirmDialog } from "@/components/ConfirmDialog";
import EducationForm from '../forms/EducationForm';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  fetchEducation, 
  addEducation, 
  updateEducation, 
  deleteEducation,
  clearProfileError,
} from '@/redux/profileSlice';

// Selectors
const selectEducation = (state) => state.profile.education || [];
const selectProfileLoading = (state) => state.profile.loading;
const selectProfileError = (state) => state.profile.error;

const EducationSection = React.memo(({
  isCurrentUser = true
}) => {
  const dispatch = useDispatch();
  const initialFetchDone = useRef(false);
  
  // Select only the necessary parts of the state
  const education = useSelector(selectEducation);
  const loading = useSelector(selectProfileLoading);
  const error = useSelector(selectProfileError);
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentEducation, setCurrentEducation] = useState(null);

  // Memoize education data to prevent unnecessary re-renders
  const memoizedEducation = useMemo(() => education, [JSON.stringify(education)]);

  // Fetch education data on component mount only once
  useEffect(() => {
    let isMounted = true;
    
    const loadEducation = async () => {
      if (!initialFetchDone.current) {
        try {
          await dispatch(fetchEducation()).unwrap();
          if (isMounted) {
            initialFetchDone.current = true;
          }
        } catch (err) {
          console.error('Failed to load education:', err);
          if (isMounted) {
            toast.error('Failed to load education data');
          }
        }
      }
    };
    
    loadEducation();
    
    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearProfileError());
    }
  }, [error, dispatch]);

  const handleAddClick = useCallback(() => {
    setCurrentEducation(null);
    setIsEditDialogOpen(true);
  }, []);

  const handleEditClick = useCallback((edu) => {
    setCurrentEducation(edu);
    setIsEditDialogOpen(true);
  }, []);

  const handleDeleteClick = useCallback((edu) => {
    setCurrentEducation(edu);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(async (data) => {
    try {
      if (currentEducation) {
        // Update existing education
        await dispatch(updateEducation({
          id: currentEducation._id,
          ...data
        })).unwrap();
        toast.success('Education updated successfully');
      } else {
        // Add new education
        await dispatch(addEducation(data)).unwrap();
        toast.success('Education added successfully');
      }
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error saving education:', error);
      toast.error(error || 'Failed to save education');
    }
  }, [currentEducation, dispatch]);

  const handleDelete = useCallback(async () => {
    if (!currentEducation) return;
    
    try {
      await dispatch(deleteEducation(currentEducation._id)).unwrap();
      setIsDeleteDialogOpen(false);
      toast.success('Education deleted successfully');
    } catch (error) {
      console.error('Error deleting education:', error);
      toast.error(error || 'Failed to delete education');
    }
  }, [currentEducation, dispatch]);

  // Format date for display
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Present';
    try {
      return format(parseISO(dateString), 'MMM yyyy');
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  }, []);

  // Memoize the rendered education items
  const renderedEducation = useMemo(() => {
    if (!memoizedEducation || memoizedEducation.length === 0) {
      return (
        <div className="py-6 text-center text-gray-500">
          No education information added yet.
        </div>
      );
    }

    return memoizedEducation.map((edu) => (
      <div key={edu._id} className="group relative pb-6 pl-6 border-l-2 border-gray-200">
        {isCurrentUser && (
          <div className="absolute right-0 top-0 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => handleEditClick(edu)}
              disabled={loading}
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              onClick={() => handleDeleteClick(edu)}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        )}
        
        <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-1.5 border border-white dark:border-gray-900"></div>
        
        <div className="space-y-1">
          <h3 className="text-lg font-medium">{edu.school || 'Unknown School'}</h3>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span>{edu.degree} {edu.field ? `in ${edu.field}` : ''}</span>
            {edu.grade && <Badge variant="outline">Grade: {edu.grade}</Badge>}
          </div>
          
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              <span>
                {formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate)}
              </span>
            </div>
            {edu.location && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{edu.location}</span>
              </div>
            )}
          </div>
          
          {edu.description && (
            <p className="mt-2 text-gray-600 whitespace-pre-line">
              {edu.description}
            </p>
          )}
        </div>
      </div>
    ));
  }, [memoizedEducation, isCurrentUser, loading, handleEditClick, handleDeleteClick, formatDate]);

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center">
            <GraduationCap className="h-5 w-5 mr-2 text-blue-600" />
            Education
          </CardTitle>
          {isCurrentUser && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-600 hover:bg-blue-50"
              onClick={handleAddClick}
              disabled={loading}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Education
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {loading && !memoizedEducation?.length ? (
          <div className="py-4 text-center text-gray-500">
            Loading education...
          </div>
        ) : (
          <div className="space-y-6">
            {renderedEducation}
          </div>
        )}
      </CardContent>

      {/* Edit/Add Education Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <EducationForm 
            initialData={currentEducation}
            onSubmit={handleSubmit}
            onCancel={() => setIsEditDialogOpen(false)}
            isLoading={loading}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Education"
        description={`Are you sure you want to delete ${currentEducation?.school || 'this education'}?`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={loading}
      />
    </Card>
  );
});

EducationSection.displayName = 'EducationSection';

export default EducationSection;
