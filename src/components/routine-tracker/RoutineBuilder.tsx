
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { Plus, Edit, Trash2, Clock, Info } from 'lucide-react';
import { RoutineData, Task } from '../../types/routine';
import { v4 as uuidv4 } from 'uuid';

interface RoutineBuilderProps {
  routineData: RoutineData;
  updateRoutineData: (data: Partial<RoutineData>) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, task: Task) => void;
  removeTask: (taskId: string) => void;
}

const RoutineBuilder: React.FC<RoutineBuilderProps> = ({
  routineData,
  updateRoutineData,
  addTask,
  updateTask,
  removeTask
}) => {
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'medium',
    timeOfDay: 'anytime'
  });

  // Reset the task form
  const resetTaskForm = () => {
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      timeOfDay: 'anytime'
    });
    setShowNewTaskForm(false);
    setEditingTaskId(null);
  };

  // Handle task form submission
  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTask.title) return;
    
    const taskToSave: Task = {
      id: editingTaskId || uuidv4(),
      title: newTask.title || '',
      description: newTask.description || '',
      priority: newTask.priority as 'low' | 'medium' | 'high' || 'medium',
      timeOfDay: newTask.timeOfDay as 'morning' | 'afternoon' | 'evening' | 'anytime' || 'anytime',
      createdAt: editingTaskId ? undefined : new Date().toISOString()
    };
    
    if (editingTaskId) {
      updateTask(editingTaskId, taskToSave);
    } else {
      addTask(taskToSave);
    }
    
    resetTaskForm();
  };

  // Start editing a task
  const startEditTask = (task: Task) => {
    setNewTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
      timeOfDay: task.timeOfDay
    });
    setEditingTaskId(task.id);
    setShowNewTaskForm(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Routine Settings</CardTitle>
          <CardDescription>
            Configure your routine tracker settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="routine-title">Routine Title</Label>
            <Input
              id="routine-title"
              value={routineData.title}
              onChange={(e) => updateRoutineData({ title: e.target.value })}
              placeholder="My Daily Routine"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="routine-description">Description</Label>
            <Textarea
              id="routine-description"
              value={routineData.description}
              onChange={(e) => updateRoutineData({ description: e.target.value })}
              placeholder="Personal daily tasks and habits"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="time-frame">Time Frame</Label>
            <Select
              value={routineData.timeFrame}
              onValueChange={(value) => updateRoutineData({ timeFrame: value as 'daily' | 'weekly' | 'monthly' })}
            >
              <SelectTrigger id="time-frame">
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
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>
              Manage tasks for your routine
            </CardDescription>
          </div>
          <Button onClick={() => setShowNewTaskForm(true)} className="bg-wellness-darkGreen hover:bg-wellness-darkGreen/90">
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </Button>
        </CardHeader>
        <CardContent>
          {showNewTaskForm ? (
            <form onSubmit={handleTaskSubmit} className="space-y-4 border rounded-md p-4">
              <div className="space-y-2">
                <Label htmlFor="task-title">Task Title</Label>
                <Input
                  id="task-title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Exercise"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="task-description">Description (Optional)</Label>
                <Textarea
                  id="task-description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="30 minutes of cardio"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task-priority">Priority</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                  >
                    <SelectTrigger id="task-priority">
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
                    value={newTask.timeOfDay}
                    onValueChange={(value) => setNewTask({ ...newTask, timeOfDay: value })}
                  >
                    <SelectTrigger id="task-time">
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
              
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetTaskForm}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-wellness-darkGreen hover:bg-wellness-darkGreen/90">
                  {editingTaskId ? 'Update Task' : 'Add Task'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              {routineData.tasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No tasks created yet. Click "Add Task" to get started.</p>
                </div>
              ) : (
                routineData.tasks.map((task) => (
                  <div 
                    key={task.id}
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
                  >
                    <div className="space-y-1">
                      <div className="font-medium">{task.title}</div>
                      {task.description && (
                        <div className="text-sm text-gray-500">{task.description}</div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {task.priority}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {task.timeOfDay}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => startEditTask(task)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
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
                            <AlertDialogAction 
                              onClick={() => removeTask(task.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RoutineBuilder;
