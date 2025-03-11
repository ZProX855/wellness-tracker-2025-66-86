
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  CheckCircle, X, Edit, Trash2, Clock, Calendar, Eye, Download, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { format, parseISO } from 'date-fns';

interface RoutineListProps {
  setActiveTab: (tab: string) => void;
}

const RoutineList: React.FC<RoutineListProps> = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRoutine, setActiveRoutine] = useState<any | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  
  useEffect(() => {
    if (user) {
      fetchRoutines();
    }
  }, [user]);

  const fetchRoutines = async () => {
    try {
      const { data, error } = await supabase
        .from('user_routines')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setRoutines(data || []);
    } catch (error) {
      console.error('Error fetching routines:', error);
      toast.error('Failed to load your routines');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoutine = async (id: string) => {
    if (!confirm('Are you sure you want to delete this routine?')) return;
    
    try {
      const { error } = await supabase
        .from('user_routines')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setRoutines(routines.filter(routine => routine.id !== id));
      toast.success('Routine deleted successfully');
      
      if (activeRoutine?.id === id) {
        setActiveRoutine(null);
      }
    } catch (error) {
      console.error('Error deleting routine:', error);
      toast.error('Failed to delete routine');
    }
  };

  const handleEditRoutine = (routine: any) => {
    // Store the routine in localStorage for the builder to access
    localStorage.setItem('editingRoutine', JSON.stringify(routine));
    setActiveTab('build');
  };

  const exportToPDF = async (routine: any) => {
    const routineElement = document.getElementById(`routine-${routine.id}`);
    if (!routineElement) return;
    
    try {
      const canvas = await html2canvas(routineElement, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${routine.name.replace(/\s+/g, '_')}_routine.pdf`);
      
      toast.success('Routine exported to PDF');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Failed to export routine');
    }
  };

  const toggleTaskCompletion = async (routineId: string, taskId: string) => {
    try {
      // Find the routine and update the task's completed status
      const routine = routines.find(r => r.id === routineId);
      if (!routine) return;
      
      const updatedTasks = routine.tasks.map((task: any) => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      
      // Update in Supabase
      const { error } = await supabase
        .from('user_routines')
        .update({ tasks: updatedTasks })
        .eq('id', routineId);
      
      if (error) throw error;
      
      // Update local state
      setRoutines(routines.map(r => 
        r.id === routineId ? { ...r, tasks: updatedTasks } : r
      ));
      
      if (activeRoutine?.id === routineId) {
        setActiveRoutine({ ...activeRoutine, tasks: updatedTasks });
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const filteredRoutines = routines.filter(routine => {
    const matchesSearch = routine.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType ? routine.type === filterType : true;
    return matchesSearch && matchesType;
  });

  const getCompletionRate = (routine: any) => {
    if (!routine.tasks || routine.tasks.length === 0) return 0;
    const completedTasks = routine.tasks.filter((task: any) => task.completed).length;
    return Math.round((completedTasks / routine.tasks.length) * 100);
  };

  const getThemeColors = (theme: string) => {
    switch(theme) {
      case 'blue':
        return {
          light: 'bg-blue-100',
          medium: 'bg-blue-500',
          text: 'text-blue-800',
          border: 'border-blue-200'
        };
      case 'purple':
        return {
          light: 'bg-purple-100',
          medium: 'bg-purple-500',
          text: 'text-purple-800',
          border: 'border-purple-200'
        };
      case 'rose':
        return {
          light: 'bg-rose-100',
          medium: 'bg-rose-500',
          text: 'text-rose-800',
          border: 'border-rose-200'
        };
      case 'amber':
        return {
          light: 'bg-amber-100',
          medium: 'bg-amber-500',
          text: 'text-amber-800',
          border: 'border-amber-200'
        };
      default:
        return {
          light: 'bg-wellness-softGreen',
          medium: 'bg-wellness-mediumGreen',
          text: 'text-wellness-darkGreen',
          border: 'border-wellness-softGreen'
        };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-wellness-mediumGreen border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-medium text-wellness-darkGreen">Your Routines</h2>
        
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Input
              placeholder="Search routines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-8"
            />
            {searchTerm && (
              <button 
                className="absolute right-2 top-1/2 -translate-y-1/2 text-wellness-charcoal/50 hover:text-wellness-charcoal"
                onClick={() => setSearchTerm('')}
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          <Tabs 
            defaultValue="all" 
            className="w-auto"
            onValueChange={(value) => setFilterType(value === 'all' ? null : value)}
          >
            <TabsList className="bg-wellness-softBeige/50">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="daily" className="text-xs">Daily</TabsTrigger>
              <TabsTrigger value="weekly" className="text-xs">Weekly</TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {filteredRoutines.length === 0 ? (
        <div className="text-center py-12 border rounded-md bg-gray-50">
          <Calendar className="h-12 w-12 mx-auto text-wellness-softGreen opacity-50" />
          <p className="mt-2 text-wellness-charcoal/70">No routines found</p>
          <p className="text-sm text-wellness-charcoal/50 mb-4">
            {searchTerm || filterType ? 'Try adjusting your search or filters' : 'Create your first routine to get started'}
          </p>
          {!searchTerm && !filterType && (
            <Button
              onClick={() => setActiveTab('build')}
              variant="outline"
              className="border-wellness-softGreen text-wellness-darkGreen"
            >
              Create New Routine
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoutines.map((routine) => {
            const themeColors = getThemeColors(routine.theme);
            const completionRate = getCompletionRate(routine);
            
            return (
              <div 
                key={routine.id} 
                className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${themeColors.border}`}
              >
                <div className={`p-4 ${themeColors.light}`}>
                  <div className="flex justify-between items-start">
                    <h3 className={`font-medium text-lg truncate ${themeColors.text}`}>
                      {routine.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`h-8 w-8 p-0 ${themeColors.text}`}
                        onClick={() => handleEditRoutine(routine)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost" 
                        className={`h-8 w-8 p-0 ${themeColors.text}`}
                        onClick={() => exportToPDF(routine)}
                      >
                        <Download size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteRoutine(routine.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center mt-2 text-sm">
                    <span className={`capitalize ${themeColors.text}`}>
                      {routine.type}
                    </span>
                    <span className="mx-2 text-gray-400">•</span>
                    <span className="text-wellness-charcoal/70">
                      {routine.tasks?.length || 0} tasks
                    </span>
                  </div>
                </div>
                
                <div className="p-4 bg-white">
                  {routine.description && (
                    <p className="text-sm text-wellness-charcoal/70 mb-3 line-clamp-2">
                      {routine.description}
                    </p>
                  )}
                  
                  <div className="h-2 bg-gray-100 rounded-full mb-3">
                    <div 
                      className={`h-full rounded-full ${themeColors.medium}`}
                      style={{ width: `${completionRate}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className={`font-medium ${themeColors.text}`}>
                      {completionRate}% Complete
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`h-8 px-2 py-0 ${themeColors.text}`}
                      onClick={() => setActiveRoutine(routine)}
                    >
                      <Eye size={14} className="mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {activeRoutine && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto"
            id={`routine-${activeRoutine.id}`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium text-wellness-darkGreen">
                {activeRoutine.name}
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setActiveRoutine(null)}
                className="h-8 w-8 p-0"
              >
                <X size={18} />
              </Button>
            </div>
            
            {activeRoutine.description && (
              <p className="text-wellness-charcoal/70 mb-4">
                {activeRoutine.description}
              </p>
            )}
            
            <div className="flex flex-wrap gap-2 mb-4 text-sm">
              <div className="px-3 py-1 bg-wellness-softGreen/30 rounded-full flex items-center">
                <Calendar size={14} className="mr-1 text-wellness-darkGreen" />
                <span className="capitalize">{activeRoutine.type}</span>
              </div>
              
              <div className="px-3 py-1 bg-wellness-softGreen/30 rounded-full flex items-center">
                <Clock size={14} className="mr-1 text-wellness-darkGreen" />
                <span>Created {format(parseISO(activeRoutine.created_at), 'MMM d, yyyy')}</span>
              </div>
            </div>
            
            <div className="mb-4">
              <Label className="mb-2 block">Progress</Label>
              <div className="h-3 bg-gray-100 rounded-full">
                <div 
                  className="h-full rounded-full bg-wellness-mediumGreen"
                  style={{ width: `${getCompletionRate(activeRoutine)}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-sm text-wellness-charcoal/70">
                <span>{activeRoutine.tasks.filter((t: any) => t.completed).length} completed</span>
                <span>{activeRoutine.tasks.length} total tasks</span>
              </div>
            </div>
            
            <div className="mb-6">
              <Label className="mb-2 block">Tasks</Label>
              <div className="border rounded-md overflow-hidden">
                {activeRoutine.tasks.map((task: any, index: number) => {
                  const themeColors = getThemeColors(activeRoutine.theme);
                  
                  return (
                    <div 
                      key={task.id} 
                      className={`p-3 flex items-start gap-3 ${
                        index !== activeRoutine.tasks.length - 1 ? 'border-b' : ''
                      } ${task.completed ? `${themeColors.light} bg-opacity-40` : ''}`}
                    >
                      <button
                        onClick={() => toggleTaskCompletion(activeRoutine.id, task.id)}
                        className={`mt-0.5 flex-shrink-0 h-5 w-5 rounded-full border ${
                          task.completed 
                            ? `${themeColors.medium} border-transparent text-white flex items-center justify-center` 
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {task.completed && <CheckCircle size={16} className="text-white" />}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <h4 className={`font-medium ${task.completed ? 'line-through text-wellness-charcoal/50' : ''}`}>
                            {task.title}
                          </h4>
                          {task.priority && (
                            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                              task.priority === 'high' ? 'bg-rose-100 text-rose-800' :
                              task.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                          )}
                        </div>
                        
                        {task.description && (
                          <p className={`text-sm mt-1 ${task.completed ? 'text-wellness-charcoal/40' : 'text-wellness-charcoal/70'}`}>
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          {task.category && (
                            <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-wellness-charcoal/70">
                              {task.category}
                            </span>
                          )}
                          
                          {task.timeSlot && (
                            <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-wellness-charcoal/70 flex items-center">
                              <Clock size={10} className="mr-1" />
                              {task.timeSlot}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setActiveRoutine(null)}
              >
                Close
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => exportToPDF(activeRoutine)}
                  className="flex items-center"
                >
                  <Download size={16} className="mr-1" />
                  Export PDF
                </Button>
                
                <Button
                  onClick={() => handleEditRoutine(activeRoutine)}
                  className="bg-wellness-darkGreen hover:bg-wellness-darkGreen/90"
                >
                  <Edit size={16} className="mr-1" />
                  Edit Routine
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutineList;
