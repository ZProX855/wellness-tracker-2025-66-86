
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Plus, X, Save, Trash2, MoveUp, MoveDown, Clock, CheckCircle, PlusCircle
} from 'lucide-react';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

type RoutineType = 'daily' | 'weekly' | 'monthly';
type TaskPriority = 'low' | 'medium' | 'high';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  completed: boolean;
  category?: string;
  timeSlot?: string;
}

interface RoutineForm {
  name: string;
  description: string;
  type: RoutineType;
  theme: string;
}

const RoutineBuilder: React.FC = () => {
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<RoutineForm>({
    defaultValues: {
      name: '',
      description: '',
      type: 'daily',
      theme: 'default'
    }
  });
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([new Date()]);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<string[]>(['Personal', 'Work', 'Health', 'Custom']);
  const [newCategory, setNewCategory] = useState('');
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const routineType = watch('type');

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    
    const task: Task = {
      id: uuidv4(),
      title: newTask,
      description: '',
      priority: 'medium',
      completed: false,
      category: 'Personal',
      timeSlot: ''
    };
    
    setTasks([...tasks, task]);
    setNewTask('');
  };

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    toast.success("Task updated");
    setSelectedTask(null);
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    if (selectedTask?.id === taskId) setSelectedTask(null);
    toast.success("Task removed");
  };

  const handleMoveTask = (taskId: string, direction: 'up' | 'down') => {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (
      (direction === 'up' && taskIndex === 0) || 
      (direction === 'down' && taskIndex === tasks.length - 1)
    ) {
      return;
    }
    
    const newTasks = [...tasks];
    const newIndex = direction === 'up' ? taskIndex - 1 : taskIndex + 1;
    [newTasks[taskIndex], newTasks[newIndex]] = [newTasks[newIndex], newTasks[taskIndex]];
    setTasks(newTasks);
  };

  const handleAddCategory = () => {
    if (!newCategory.trim() || categories.includes(newCategory)) {
      setShowCategoryInput(false);
      setNewCategory('');
      return;
    }
    
    setCategories([...categories, newCategory]);
    setShowCategoryInput(false);
    setNewCategory('');
  };

  const saveRoutine = async (data: RoutineForm) => {
    if (tasks.length === 0) {
      toast.error("Please add at least one task to your routine");
      return;
    }

    setIsSaving(true);
    
    try {
      const routineData = {
        user_id: user!.id,
        name: data.name,
        description: data.description,
        type: data.type,
        theme: data.theme,
        tasks: tasks,
        dates: selectedDates.map(date => format(date, 'yyyy-MM-dd')),
        created_at: new Date().toISOString(),
        category_list: categories
      };
      
      const { data: savedRoutine, error } = await supabase
        .from('user_routines')
        .insert([routineData])
        .select();
      
      if (error) throw error;
      
      toast.success("Routine saved successfully!");
      
      // Reset form
      setValue('name', '');
      setValue('description', '');
      setValue('type', 'daily');
      setValue('theme', 'default');
      setTasks([]);
      setSelectedDates([new Date()]);
    } catch (error) {
      console.error('Error saving routine:', error);
      toast.error("Failed to save routine. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium text-wellness-darkGreen mb-4">Create Your Routine</h2>
        
        <form onSubmit={handleSubmit(saveRoutine)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="routineName">Routine Name</Label>
                <Input 
                  id="routineName"
                  placeholder="Morning Ritual, Study Plan, etc."
                  {...register('name', { required: "Routine name is required" })}
                  className="mt-1"
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="routineDescription">Description (Optional)</Label>
                <Textarea 
                  id="routineDescription"
                  placeholder="What's the purpose of this routine?"
                  {...register('description')}
                  className="mt-1 h-24"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="routineType">Routine Type</Label>
                  <Select 
                    defaultValue="daily"
                    onValueChange={(value) => setValue('type', value as RoutineType)}
                  >
                    <SelectTrigger id="routineType" className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="routineTheme">Color Theme</Label>
                  <Select 
                    defaultValue="default"
                    onValueChange={(value) => setValue('theme', value)}
                  >
                    <SelectTrigger id="routineTheme" className="mt-1">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default (Green)</SelectItem>
                      <SelectItem value="blue">Calm Blue</SelectItem>
                      <SelectItem value="purple">Creative Purple</SelectItem>
                      <SelectItem value="rose">Energetic Rose</SelectItem>
                      <SelectItem value="amber">Warm Amber</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div>
              <Label>Schedule</Label>
              <div className="mt-1 border rounded-md p-2 bg-white">
                <Calendar
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={(dates) => setSelectedDates(dates || [new Date()])}
                  className="rounded-md border-0"
                  weekStartsOn={1}
                />
              </div>
              <p className="text-xs text-wellness-charcoal/70 mt-1">
                {routineType === 'daily' ? 'Select days to apply this routine' : 
                 routineType === 'weekly' ? 'Select weeks to apply this routine' :
                 'Select months to apply this routine'}
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label>Tasks</Label>
              <div className="mt-1 flex">
                <Input
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Add a new task..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTask();
                    }
                  }}
                />
                <Button 
                  type="button"
                  onClick={handleAddTask}
                  className="ml-2 bg-wellness-mediumGreen hover:bg-wellness-darkGreen"
                >
                  <Plus size={18} />
                  <span className="ml-1">Add</span>
                </Button>
              </div>
            </div>
            
            {tasks.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-wellness-softGreen/30">
                    <tr>
                      <th className="py-2 pl-4 text-left text-sm font-medium text-wellness-darkGreen">Task</th>
                      <th className="py-2 text-left text-sm font-medium text-wellness-darkGreen">Category</th>
                      <th className="py-2 text-left text-sm font-medium text-wellness-darkGreen">Priority</th>
                      <th className="py-2 pr-4 text-right text-sm font-medium text-wellness-darkGreen">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task, index) => (
                      <tr key={task.id} className="border-t border-wellness-softGreen/30">
                        <td className="py-3 pl-4 text-sm text-wellness-charcoal">{task.title}</td>
                        <td className="py-3 text-sm text-wellness-charcoal">{task.category}</td>
                        <td className="py-3 text-sm">
                          <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                            task.priority === 'high' ? 'bg-rose-100 text-rose-800' :
                            task.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-right space-x-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTaskSelect(task)}
                            className="h-8 w-8 p-0 text-wellness-darkGreen"
                          >
                            <PlusCircle size={16} />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveTask(task.id, 'up')}
                            disabled={index === 0}
                            className="h-8 w-8 p-0 text-wellness-darkGreen"
                          >
                            <MoveUp size={16} />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveTask(task.id, 'down')}
                            disabled={index === tasks.length - 1}
                            className="h-8 w-8 p-0 text-wellness-darkGreen"
                          >
                            <MoveDown size={16} />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTaskDelete(task.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 border rounded-md bg-gray-50">
                <CheckCircle className="h-12 w-12 mx-auto text-wellness-softGreen opacity-50" />
                <p className="mt-2 text-wellness-charcoal/70">No tasks added yet</p>
                <p className="text-sm text-wellness-charcoal/50">Add tasks to build your routine</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-wellness-darkGreen hover:bg-wellness-darkGreen/90"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2" size={18} />
                  Save Routine
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
      
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Edit Task</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTask(null)}
                className="h-8 w-8 p-0"
              >
                <X size={18} />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="taskTitle">Task Title</Label>
                <Input
                  id="taskTitle"
                  value={selectedTask.title}
                  onChange={(e) => setSelectedTask({...selectedTask, title: e.target.value})}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="taskDescription">Description (Optional)</Label>
                <Textarea
                  id="taskDescription"
                  value={selectedTask.description || ''}
                  onChange={(e) => setSelectedTask({...selectedTask, description: e.target.value})}
                  className="mt-1"
                  placeholder="Add details about this task..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="taskCategory">Category</Label>
                  <div className="relative">
                    {!showCategoryInput ? (
                      <Select
                        value={selectedTask.category}
                        onValueChange={(value) => {
                          if (value === "add-new") {
                            setShowCategoryInput(true);
                          } else {
                            setSelectedTask({...selectedTask, category: value});
                          }
                        }}
                      >
                        <SelectTrigger id="taskCategory" className="mt-1">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                          <SelectItem value="add-new">+ Add new category</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1 flex">
                        <Input
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          placeholder="New category name"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          onClick={handleAddCategory}
                          className="ml-2 bg-wellness-mediumGreen hover:bg-wellness-darkGreen"
                          size="sm"
                        >
                          <Check size={14} />
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            setShowCategoryInput(false);
                            setNewCategory('');
                          }}
                          variant="ghost"
                          size="sm"
                          className="ml-1"
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="taskPriority">Priority</Label>
                  <Select
                    value={selectedTask.priority}
                    onValueChange={(value) => setSelectedTask({...selectedTask, priority: value as TaskPriority})}
                  >
                    <SelectTrigger id="taskPriority" className="mt-1">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="taskTimeSlot">Time Slot (Optional)</Label>
                <Input
                  id="taskTimeSlot"
                  type="time"
                  value={selectedTask.timeSlot || ''}
                  onChange={(e) => setSelectedTask({...selectedTask, timeSlot: e.target.value})}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedTask(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => handleTaskUpdate(selectedTask)}
                className="bg-wellness-darkGreen hover:bg-wellness-darkGreen/90"
              >
                Update Task
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutineBuilder;
