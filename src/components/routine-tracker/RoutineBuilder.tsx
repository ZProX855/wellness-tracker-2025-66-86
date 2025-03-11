
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Plus, Edit, Trash2, Clock, Calendar, ArrowDown, CheckCircle } from 'lucide-react';
import { RoutineData, Task } from '../../types/routine';
import { v4 as uuidv4 } from 'uuid';

interface RoutineBuilderProps {
  routineData: RoutineData;
  updateRoutineData: (data: Partial<RoutineData>) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, task: Task) => void;
  removeTask: (taskId: string) => void;
  setSelectedTab: (tab: string) => void;
}

const RoutineBuilder: React.FC<RoutineBuilderProps> = ({
  routineData,
  updateRoutineData,
  addTask,
  updateTask,
  removeTask,
  setSelectedTab
}) => {
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'medium',
    timeOfDay: 'anytime',
    repeatDay: 'any'
  });
  
  const [showRepeatDayField, setShowRepeatDayField] = useState(routineData.timeFrame !== 'daily');

  useEffect(() => {
    setShowRepeatDayField(routineData.timeFrame !== 'daily');
  }, [routineData.timeFrame]);

  const resetTaskForm = () => {
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      timeOfDay: 'anytime',
      repeatDay: 'any'
    });
    setShowNewTaskForm(false);
    setEditingTaskId(null);
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;
    
    if (typeof newTask.priority !== 'string' || !['low', 'medium', 'high'].includes(newTask.priority)) {
      newTask.priority = 'medium';
    }
    
    if (typeof newTask.timeOfDay !== 'string' || !['morning', 'afternoon', 'evening', 'anytime'].includes(newTask.timeOfDay)) {
      newTask.timeOfDay = 'anytime';
    }
    
    const validRepeatDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'any'];
    if (typeof newTask.repeatDay !== 'string' || !validRepeatDays.includes(newTask.repeatDay)) {
      newTask.repeatDay = 'any';
    }
    
    const taskToSave: Task = {
      id: editingTaskId || uuidv4(),
      title: newTask.title || '',
      description: newTask.description || '',
      priority: newTask.priority as 'low' | 'medium' | 'high',
      timeOfDay: newTask.timeOfDay as 'morning' | 'afternoon' | 'evening' | 'anytime',
      repeatDay: showRepeatDayField ? 
        (newTask.repeatDay as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' | 'any') : 
        undefined,
      createdAt: editingTaskId ? undefined : new Date().toISOString()
    };
    
    if (editingTaskId) {
      updateTask(editingTaskId, taskToSave);
    } else {
      addTask(taskToSave);
    }
    resetTaskForm();
  };

  const startEditTask = (task: Task) => {
    setNewTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
      timeOfDay: task.timeOfDay,
      repeatDay: task.repeatDay || 'any'
    });
    setEditingTaskId(task.id);
    setShowNewTaskForm(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getTimeOfDayIcon = (timeOfDay: string) => {
    switch (timeOfDay) {
      case 'morning': return '🌅';
      case 'afternoon': return '☀️';
      case 'evening': return '🌙';
      case 'anytime': return '⏱️';
      default: return '⏱️';
    }
  };
  
  const goToCalendarView = () => {
    setSelectedTab('calendar');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-wellness-darkGreen">Routine Builder</h2>
        <div className="flex items-center text-sm text-wellness-charcoal/70">
          <ArrowDown className="h-4 w-4 mr-1" />
          <span>Follow the steps below</span>
        </div>
      </div>
      
      {/* Step 1: Configure Routine */}
      <Card className="bg-white/80 backdrop-blur-sm border-wellness-softGreen/30 shadow-sm hover:shadow transition-all overflow-hidden">
        <div className="bg-wellness-softGreen/30 px-6 py-2 border-b border-wellness-softGreen/20">
          <div className="flex items-center">
            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-wellness-darkGreen text-white text-sm mr-2">1</div>
            <CardTitle className="text-wellness-darkGreen">Configure Your Routine</CardTitle>
          </div>
        </div>
        <CardContent className="space-y-4 pt-5">
          <div className="space-y-2">
            <Label htmlFor="routine-title">Routine Title</Label>
            <Input 
              id="routine-title" 
              value={routineData.title} 
              onChange={e => updateRoutineData({ title: e.target.value })} 
              placeholder="My Daily Routine" 
              className="border-wellness-softGreen/30 focus:border-wellness-mediumGreen focus-visible:ring-wellness-mediumGreen/20" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="routine-description">Description</Label>
            <Textarea 
              id="routine-description" 
              value={routineData.description} 
              onChange={e => updateRoutineData({ description: e.target.value })} 
              placeholder="Personal daily tasks and habits" 
              rows={2} 
              className="border-wellness-softGreen/30 focus:border-wellness-mediumGreen focus-visible:ring-wellness-mediumGreen/20" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="time-frame">Time Frame</Label>
            <Select 
              value={routineData.timeFrame} 
              onValueChange={value => {
                if (value === 'daily' || value === 'weekly' || value === 'monthly') {
                  updateRoutineData({ timeFrame: value });
                  setShowRepeatDayField(value !== 'daily');
                }
              }}
            >
              <SelectTrigger id="time-frame" className="border-wellness-softGreen/30 focus:ring-wellness-mediumGreen/20">
                <SelectValue placeholder="Select time frame" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Step 2: Manage Tasks */}
      <Card className="bg-white/80 backdrop-blur-sm border-wellness-softGreen/30 shadow-sm hover:shadow transition-all overflow-hidden">
        <div className="bg-wellness-softGreen/30 px-6 py-2 border-b border-wellness-softGreen/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-wellness-darkGreen text-white text-sm mr-2">2</div>
              <CardTitle className="text-wellness-darkGreen">Manage Your Tasks</CardTitle>
            </div>
            <Button 
              onClick={() => setShowNewTaskForm(true)} 
              className="bg-wellness-darkGreen hover:bg-wellness-darkGreen/90"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </Button>
          </div>
        </div>
        <CardContent className="pt-5">
          {showNewTaskForm ? (
            <form onSubmit={handleTaskSubmit} className="space-y-4 border rounded-md p-4 bg-white shadow-sm mb-4">
              <div className="space-y-2">
                <Label htmlFor="task-title">Task Title</Label>
                <Input 
                  id="task-title" 
                  value={newTask.title || ''} 
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })} 
                  placeholder="Exercise" 
                  required 
                  className="border-wellness-softGreen/30 focus:border-wellness-mediumGreen focus-visible:ring-wellness-mediumGreen/20" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="task-description">Description (Optional)</Label>
                <Textarea 
                  id="task-description" 
                  value={newTask.description || ''} 
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })} 
                  placeholder="30 minutes of cardio" 
                  rows={2} 
                  className="border-wellness-softGreen/30 focus:border-wellness-mediumGreen focus-visible:ring-wellness-mediumGreen/20" 
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task-priority">Priority</Label>
                  <Select 
                    value={newTask.priority as 'low' | 'medium' | 'high'} 
                    onValueChange={(value: string) => {
                      if (value === 'low' || value === 'medium' || value === 'high') {
                        setNewTask({
                          ...newTask,
                          priority: value
                        });
                      }
                    }}
                  >
                    <SelectTrigger id="task-priority" className="border-wellness-softGreen/30 focus:ring-wellness-mediumGreen/20">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="task-time">Preferred Time</Label>
                  <Select 
                    value={newTask.timeOfDay as 'morning' | 'afternoon' | 'evening' | 'anytime'} 
                    onValueChange={(value: string) => {
                      if (value === 'morning' || value === 'afternoon' || value === 'evening' || value === 'anytime') {
                        setNewTask({
                          ...newTask,
                          timeOfDay: value
                        });
                      }
                    }}
                  >
                    <SelectTrigger id="task-time" className="border-wellness-softGreen/30 focus:ring-wellness-mediumGreen/20">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="afternoon">Afternoon</SelectItem>
                      <SelectItem value="evening">Evening</SelectItem>
                      <SelectItem value="anytime">Anytime</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {showRepeatDayField && (
                <div className="space-y-2">
                  <Label htmlFor="repeat-day">Repeat on Day</Label>
                  <Select 
                    value={newTask.repeatDay as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' | 'any'} 
                    onValueChange={(value: string) => {
                      const validValues = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'any'];
                      if (validValues.includes(value)) {
                        setNewTask({
                          ...newTask,
                          repeatDay: value as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' | 'any'
                        });
                      }
                    }}
                  >
                    <SelectTrigger id="repeat-day" className="border-wellness-softGreen/30 focus:ring-wellness-mediumGreen/20">
                      <SelectValue placeholder="Select repeat day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any day (default)</SelectItem>
                      <SelectItem value="monday">Monday</SelectItem>
                      <SelectItem value="tuesday">Tuesday</SelectItem>
                      <SelectItem value="wednesday">Wednesday</SelectItem>
                      <SelectItem value="thursday">Thursday</SelectItem>
                      <SelectItem value="friday">Friday</SelectItem>
                      <SelectItem value="saturday">Saturday</SelectItem>
                      <SelectItem value="sunday">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    {routineData.timeFrame === 'weekly' 
                      ? "Task will repeat on this day every week" 
                      : "Task will repeat on this day every week of the month"}
                  </p>
                </div>
              )}
              
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetTaskForm} 
                  className="border-wellness-mediumGreen/30 hover:bg-wellness-softGreen/20 text-wellness-darkGreen"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-wellness-darkGreen hover:bg-wellness-darkGreen/90">
                  {editingTaskId ? 'Update Task' : 'Add Task'}
                </Button>
              </div>
            </form>
          ) : routineData.tasks.length === 0 ? (
            <div className="text-center py-10 flex flex-col items-center gap-3">
              <div className="h-16 w-16 rounded-full bg-wellness-softGreen/40 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-wellness-darkGreen" />
              </div>
              <p className="text-gray-500">No tasks added yet. Click the "Add Task" button to create your first task.</p>
              <Button 
                onClick={() => setShowNewTaskForm(true)} 
                className="bg-wellness-darkGreen hover:bg-wellness-darkGreen/90 mt-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Your First Task
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-wellness-charcoal/70 mb-3">
                {routineData.tasks.length} {routineData.tasks.length === 1 ? 'task' : 'tasks'} in your routine
              </p>
              <div className="space-y-2">
                {routineData.tasks.map(task => (
                  <div 
                    key={task.id} 
                    className="flex items-center justify-between p-3 border border-wellness-softGreen/30 rounded-md hover:bg-wellness-softGreen/10 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="font-medium text-wellness-charcoal flex items-center">
                        <span>{task.title}</span>
                        {task.priority === 'high' && (
                          <span className="ml-2 inline-block h-2 w-2 bg-red-500 rounded-full"></span>
                        )}
                      </div>
                      {task.description && <div className="text-sm text-gray-500">{task.description}</div>}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className="flex items-center">
                          <span className="mr-1">{getTimeOfDayIcon(task.timeOfDay)}</span>
                          {task.timeOfDay}
                        </span>
                        {task.repeatDay && task.repeatDay !== 'any' && (
                          <span className="px-2 py-0.5 rounded-full bg-wellness-softGreen/30 text-wellness-darkGreen">
                            {task.repeatDay.charAt(0).toUpperCase() + task.repeatDay.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => startEditTask(task)} 
                        className="hover:bg-wellness-softGreen/20 text-wellness-darkGreen"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Task</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{task.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => removeTask(task.id)} className="bg-red-500 hover:bg-red-600">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Step 3: Final Step */}
      <Card className="bg-white/80 backdrop-blur-sm border-wellness-softGreen/30 shadow-sm hover:shadow transition-all overflow-hidden">
        <div className="bg-wellness-softGreen/30 px-6 py-2 border-b border-wellness-softGreen/20">
          <div className="flex items-center">
            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-wellness-darkGreen text-white text-sm mr-2">3</div>
            <CardTitle className="text-wellness-darkGreen">Track Your Progress</CardTitle>
          </div>
        </div>
        <CardContent className="pt-5">
          <div className="text-center p-4">
            <div className="mb-4 flex justify-center">
              <CheckCircle className="h-12 w-12 text-wellness-mediumGreen" />
            </div>
            <h3 className="text-lg font-medium mb-2">Ready to Track Your Routine!</h3>
            <p className="text-gray-500 mb-4">
              You've set up your routine. Switch to the Calendar tab to start tracking your daily progress.
            </p>
            <Button 
              className="bg-wellness-darkGreen hover:bg-wellness-darkGreen/90"
              onClick={goToCalendarView}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Go to Calendar View
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoutineBuilder;
