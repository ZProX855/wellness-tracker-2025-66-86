import React, { useState, useRef } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, Edit, Download, RefreshCw, List, Grid, Palette, Share2, Trash2, Flag } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface TimetableEntry {
  time: string;
  activity: string;
  category: 'routine' | 'work' | 'meal' | 'exercise' | 'leisure' | 'learning' | 'rest';
  description?: string;
  completed?: boolean;
  important?: boolean;
}

interface TimetableVisualizerProps {
  timetable: TimetableEntry[];
  onEditEntry: (entry: TimetableEntry, index: number) => void;
  onDeleteEntry: (index: TimetableEntry, index: number) => void;
  onToggleCompleted: (index: number) => void;
  onToggleImportant: (index: number) => void;
  onDownload: () => void;
  onShare: () => void;
  onRegenerate: () => void;
  colorTheme: 'soft' | 'vibrant' | 'pastel';
}

// Add a helper function to get category color based on the theme
const getCategoryColor = (category: string, theme: 'soft' | 'vibrant' | 'pastel') => {
  const colorMap = {
    soft: {
      routine: '#f0f4f8',
      work: '#e6f3e6',
      meal: '#f5f0e6',
      exercise: '#f0e6e6',
      leisure: '#e6e6f5',
      learning: '#e6f5f0',
      rest: '#f5e6f5'
    },
    vibrant: {
      routine: '#d0e0f0',
      work: '#c0e0c0',
      meal: '#f0d0b0',
      exercise: '#f0b0b0',
      leisure: '#c0c0f0',
      learning: '#b0f0d0',
      rest: '#e0b0e0'
    },
    pastel: {
      routine: '#e6f0fa',
      work: '#e6fae6',
      meal: '#faf0e6',
      exercise: '#fae6e6',
      leisure: '#e6e6fa',
      learning: '#e6faf0',
      rest: '#fae6fa'
    }
  };
  
  return colorMap[theme][category as keyof typeof colorMap[typeof theme]] || '#f5f5f5';
};

// Add a helper function to get category text color
const getCategoryTextColor = (category: string) => {
  const textColorMap = {
    routine: 'text-blue-800',
    work: 'text-green-800',
    meal: 'text-amber-800',
    exercise: 'text-red-800',
    leisure: 'text-indigo-800',
    learning: 'text-teal-800',
    rest: 'text-purple-800'
  };
  
  return textColorMap[category as keyof typeof textColorMap] || 'text-gray-800';
};

// Add a helper function to get category badge color
const getCategoryBadgeColor = (category: string) => {
  const badgeColorMap = {
    routine: 'bg-blue-100 text-blue-800',
    work: 'bg-green-100 text-green-800',
    meal: 'bg-amber-100 text-amber-800',
    exercise: 'bg-red-100 text-red-800',
    leisure: 'bg-indigo-100 text-indigo-800',
    learning: 'bg-teal-100 text-teal-800',
    rest: 'bg-purple-100 text-purple-800'
  };
  
  return badgeColorMap[category as keyof typeof badgeColorMap] || 'bg-gray-100 text-gray-800';
};

// Updated helper function to get PDF-friendly colors (using plain white)
const getPDFCategoryColor = () => {
  return '#FFFFFF'; // Plain white for all categories
};

// New helper function to get PDF-friendly text colors
const getPDFTextColor = () => {
  return '#333333'; // Dark gray but not too dark
};

const TimetableVisualizer: React.FC<TimetableVisualizerProps> = ({
  timetable,
  onEditEntry,
  onDeleteEntry,
  onToggleCompleted,
  onToggleImportant,
  onDownload,
  onShare,
  onRegenerate,
  colorTheme
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<'list' | 'card'>('list');
  const pdfRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  
  // Generate a PDF of the timetable
  const generatePDF = async () => {
    if (!pdfRef.current) return;
    
    try {
      // Create a temporary div for PDF content
      const pdfContent = document.createElement('div');
      pdfContent.style.padding = '20px';
      pdfContent.style.background = '#FFFFFF';
      
      // Create header
      const header = document.createElement('h2');
      header.textContent = `Daily Timetable: ${selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`;
      header.style.color = '#333333'; // Dark text for better readability
      header.style.marginBottom = '16px';
      header.style.fontSize = '16px';
      header.style.fontWeight = 'bold';
      header.style.textAlign = 'center';
      pdfContent.appendChild(header);
      
      // Create table element with clean design
      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.fontSize = '10px';
      table.style.border = '1px solid #ddd';
      
      // Add table header
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      
      const headers = ['Time', 'Activity', 'Category', 'Status'];
      
      headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.padding = '8px';
        th.style.textAlign = 'left';
        th.style.borderBottom = '1px solid #ddd';
        th.style.backgroundColor = '#f5f5f5'; // Light gray background
        th.style.color = '#333333';
        th.style.fontWeight = 'bold';
        headerRow.appendChild(th);
      });
      
      thead.appendChild(headerRow);
      table.appendChild(thead);
      
      // Add table body
      const tbody = document.createElement('tbody');
      
      timetable.forEach((entry, index) => {
        const row = document.createElement('tr');
        
        // Simple alternating row colors for better readability
        row.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f9f9f9';
        row.style.borderBottom = '1px solid #eee';
        
        // Time cell
        const timeCell = document.createElement('td');
        timeCell.textContent = entry.time;
        timeCell.style.padding = '8px';
        timeCell.style.color = getPDFTextColor();
        timeCell.style.borderRight = '1px solid #eee';
        row.appendChild(timeCell);
        
        // Activity cell
        const activityCell = document.createElement('td');
        activityCell.textContent = entry.activity;
        activityCell.style.padding = '8px';
        activityCell.style.color = getPDFTextColor();
        activityCell.style.borderRight = '1px solid #eee';
        
        // Add strikethrough for completed items
        if (entry.completed) {
          activityCell.style.textDecoration = 'line-through';
          activityCell.style.color = '#999';
        }
        
        // Add important indicator
        if (entry.important) {
          activityCell.textContent = `${entry.activity} (Important)`;
          activityCell.style.fontWeight = 'bold';
        }
        
        // Add description if available
        if (entry.description) {
          const descSpan = document.createElement('div');
          descSpan.textContent = entry.description;
          descSpan.style.fontSize = '8px';
          descSpan.style.color = '#666';
          descSpan.style.marginTop = '2px';
          activityCell.appendChild(descSpan);
        }
        
        row.appendChild(activityCell);
        
        // Category cell
        const categoryCell = document.createElement('td');
        categoryCell.textContent = entry.category.charAt(0).toUpperCase() + entry.category.slice(1);
        categoryCell.style.padding = '8px';
        categoryCell.style.color = getPDFTextColor();
        categoryCell.style.borderRight = '1px solid #eee';
        row.appendChild(categoryCell);
        
        // Status cell
        const statusCell = document.createElement('td');
        statusCell.style.padding = '8px';
        statusCell.textContent = entry.completed ? 'Completed' : 'Pending';
        statusCell.style.color = entry.completed ? '#4CAF50' : '#FF9800';
        row.appendChild(statusCell);
        
        tbody.appendChild(row);
      });
      
      table.appendChild(tbody);
      pdfContent.appendChild(table);
      
      // Add summary section
      const summarySection = document.createElement('div');
      summarySection.style.marginTop = '16px';
      summarySection.style.fontSize = '9px';
      
      // Count activities by category
      const categoryCounts: Record<string, number> = {};
      timetable.forEach(entry => {
        if (!categoryCounts[entry.category]) {
          categoryCounts[entry.category] = 0;
        }
        categoryCounts[entry.category]++;
      });
      
      // Add summary header
      const summaryHeader = document.createElement('div');
      summaryHeader.textContent = 'Summary';
      summaryHeader.style.fontWeight = 'bold';
      summaryHeader.style.marginBottom = '4px';
      summarySection.appendChild(summaryHeader);
      
      // Add category counts
      const categoryList = document.createElement('ul');
      categoryList.style.margin = '0';
      categoryList.style.paddingLeft = '16px';
      
      Object.entries(categoryCounts).forEach(([category, count]) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${category.charAt(0).toUpperCase() + category.slice(1)}: ${count} activities`;
        categoryList.appendChild(listItem);
      });
      
      summarySection.appendChild(categoryList);
      
      // Add completion status
      const completedCount = timetable.filter(entry => entry.completed).length;
      const completionStatus = document.createElement('div');
      completionStatus.style.marginTop = '4px';
      completionStatus.textContent = `Completed: ${completedCount} of ${timetable.length} (${Math.round((completedCount / timetable.length) * 100)}%)`;
      summarySection.appendChild(completionStatus);
      
      pdfContent.appendChild(summarySection);
      
      // Add signature
      const signature = document.createElement('div');
      signature.style.marginTop = '16px';
      signature.style.fontSize = '8px';
      signature.style.color = '#999';
      signature.style.textAlign = 'center';
      signature.textContent = 'Generated by Wellness Assistant';
      
      pdfContent.appendChild(signature);
      
      // Append to DOM temporarily (invisible)
      pdfContent.style.position = 'absolute';
      pdfContent.style.left = '-9999px';
      document.body.appendChild(pdfContent);
      
      // Generate canvas from the custom HTML
      const canvas = await html2canvas(pdfContent, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      // Remove from DOM
      document.body.removeChild(pdfContent);
      
      // Create PDF with reduced size (A5 instead of A4)
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5' // Using A5 for smaller PDF
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('my_timetable.pdf');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <Card className="bg-white rounded-xl overflow-hidden shadow-md border-wellness-softGreen/20">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-medium text-wellness-darkGreen mb-1">
              Your Daily Timetable
            </h2>
            <p className="text-sm text-wellness-charcoal">
              A personalized schedule based on your wellness goals
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRegenerate}
              className="border-wellness-darkGreen text-wellness-darkGreen hover:bg-wellness-softGreen/20"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generatePDF}
              className="border-wellness-darkGreen text-wellness-darkGreen hover:bg-wellness-softGreen/20"
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onShare}
              className="border-wellness-darkGreen text-wellness-darkGreen hover:bg-wellness-softGreen/20"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/3">
            <div className="bg-wellness-softBeige/30 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-wellness-darkGreen font-medium flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Select Date
                </h3>
              </div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="border-0"
              />
            </div>
            
            <div className="bg-wellness-softGreen/10 p-4 rounded-lg">
              <h3 className="text-wellness-darkGreen font-medium mb-3">Categories</h3>
              <div className="grid grid-cols-1 gap-2">
                {['routine', 'work', 'meal', 'exercise', 'leisure', 'learning', 'rest'].map((category) => (
                  <div 
                    key={category} 
                    className="flex items-center p-2 rounded-md"
                    style={{ backgroundColor: getCategoryColor(category, colorTheme) }}
                  >
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: getCategoryColor(category, 'vibrant') }}></div>
                    <span className={`text-sm capitalize ${getCategoryTextColor(category)}`}>
                      {category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="lg:w-2/3" ref={pdfRef}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-wellness-darkGreen font-medium">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h3>
              <div className="flex items-center space-x-2">
                <Button 
                  variant={view === 'list' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setView('list')}
                  className={view === 'list' ? 'bg-wellness-darkGreen text-white' : 'border-wellness-darkGreen text-wellness-darkGreen'}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button 
                  variant={view === 'card' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setView('card')}
                  className={view === 'card' ? 'bg-wellness-darkGreen text-white' : 'border-wellness-darkGreen text-wellness-darkGreen'}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="timetable" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="timetable" className="data-[state=active]:bg-wellness-darkGreen data-[state=active]:text-white">
                  Timetable
                </TabsTrigger>
                <TabsTrigger value="schedule" className="data-[state=active]:bg-wellness-darkGreen data-[state=active]:text-white">
                  Schedule
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="timetable">
                {timetable.length > 0 ? (
                  <div className="space-y-2">
                    {view === 'list' ? (
                      timetable.map((entry, index) => (
                        <div 
                          key={index} 
                          className={`flex items-start p-3 rounded-lg ${entry.completed ? 'opacity-70' : ''}`}
                          style={{ backgroundColor: getCategoryColor(entry.category, colorTheme) }}
                        >
                          <div className="flex-shrink-0 w-20 text-sm font-medium text-wellness-darkGreen pt-0.5">
                            {entry.time}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center">
                                  <h4 className={`font-medium ${entry.completed ? 'line-through text-wellness-charcoal/70' : 'text-wellness-darkGreen'}`}>
                                    {entry.activity}
                                  </h4>
                                  {entry.important && (
                                    <Flag className="h-3.5 w-3.5 ml-1.5 text-amber-500 important-flag" />
                                  )}
                                </div>
                                <Badge variant="outline" className={`mt-1 text-xs ${getCategoryBadgeColor(entry.category)}`}>
                                  {entry.category}
                                </Badge>
                                {entry.description && (
                                  <p className="text-sm text-wellness-charcoal mt-1">
                                    {entry.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => onToggleCompleted(index)}
                                  className={`p-1 rounded-full hover:bg-white/50 ${entry.completed ? 'text-green-500' : 'text-gray-400'}`}
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </button>
                                <button 
                                  onClick={() => onToggleImportant(index)}
                                  className={`p-1 rounded-full hover:bg-white/50 ${entry.important ? 'text-amber-500' : 'text-gray-400'}`}
                                >
                                  <Flag className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            
                            <div className="flex justify-end space-x-1 mt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEditEntry(entry, index)}
                                className="h-8 px-2 bg-white/50 hover:bg-white/70"
                              >
                                <Edit className="h-3 w-3 mr-1" /> Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDeleteEntry(index)}
                                className="h-8 px-2 text-red-500 bg-white/50 hover:bg-white/70"
                              >
                                <Trash2 className="h-3 w-3 mr-1" /> Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {timetable.map((entry, index) => (
                          <div 
                            key={index} 
                            className={`rounded-lg overflow-hidden border shadow-sm ${entry.completed ? 'opacity-70' : ''}`}
                          >
                            <div 
                              className="p-3"
                              style={{ backgroundColor: getCategoryColor(entry.category, colorTheme) }}
                            >
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className={`text-xs ${getCategoryBadgeColor(entry.category)}`}>
                                  {entry.category}
                                </Badge>
                                <div className="flex space-x-2">
                                  <button 
                                    onClick={() => onToggleCompleted(index)}
                                    className={`p-1 rounded-full hover:bg-white/50 ${entry.completed ? 'text-green-500' : 'text-gray-400'}`}
                                  >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </button>
                                  <button 
                                    onClick={() => onToggleImportant(index)}
                                    className={`p-1 rounded-full hover:bg-white/50 ${entry.important ? 'text-amber-500' : 'text-gray-400'}`}
                                  >
                                    <Flag className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              <div className="mt-2">
                                <div className="text-sm font-medium text-wellness-darkGreen">
                                  {entry.time}
                                </div>
                                <div className="flex items-center mt-1">
                                  <h4 className={`font-medium ${entry.completed ? 'line-through text-wellness-charcoal/70' : 'text-wellness-darkGreen'}`}>
                                    {entry.activity}
                                  </h4>
                                  {entry.important && (
                                    <Flag className="h-3.5 w-3.5 ml-1.5 text-amber-500 important-flag" />
                                  )}
                                </div>
                                {entry.description && (
                                  <p className="text-sm text-wellness-charcoal mt-1">
                                    {entry.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex justify-end space-x-1 p-2 bg-white">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEditEntry(entry, index)}
                                className="h-8 px-2 hover:bg-gray-100"
                              >
                                <Edit className="h-3 w-3 mr-1" /> Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDeleteEntry(index)}
                                className="h-8 px-2 text-red-500 hover:bg-gray-100"
                              >
                                <Trash2 className="h-3 w-3 mr-1" /> Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <Clock className="h-12 w-12 mb-2 text-slate-300" />
                    <p className="text-lg">No activities scheduled for this day</p>
                    <p className="text-sm">Start a conversation with the AI assistant to create a timetable</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="schedule">
                {timetable.length > 0 ? (
                  <div>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-wellness-softGreen/10">
                          <tr>
                            <th className="py-3 px-4 text-left text-sm font-medium text-wellness-darkGreen">Time</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-wellness-darkGreen">Activity</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-wellness-darkGreen hidden md:table-cell">Category</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-wellness-darkGreen w-24">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {timetable.map((entry, index) => (
                            <tr 
                              key={index} 
                              className={`${entry.completed ? 'bg-gray-50' : 'bg-white'}`}
                            >
                              <td className="py-3 px-4 text-sm text-wellness-charcoal">
                                {entry.time}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center">
                                  <span className={`text-sm font-medium ${entry.completed ? 'line-through text-wellness-charcoal/70' : 'text-wellness-darkGreen'}`}>
                                    {entry.activity}
                                  </span>
                                  {entry.important && (
                                    <Flag className="h-3.5 w-3.5 ml-1.5 text-amber-500 important-flag" />
                                  )}
                                </div>
                                {entry.description && (
                                  <p className="text-xs text-wellness-charcoal mt-1">
                                    {entry.description}
                                  </p>
                                )}
                              </td>
                              <td className="py-3 px-4 hidden md:table-cell">
                                <Badge variant="outline" className={`${getCategoryBadgeColor(entry.category)}`}>
                                  {entry.category}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-1">
                                  <button 
                                    onClick={() => onToggleCompleted(index)}
                                    className={`p-1 rounded-full hover:bg-gray-100 ${entry.completed ? 'text-green-500' : 'text-gray-400'}`}
                                  >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </button>
                                  <button 
                                    onClick={() => onToggleImportant(index)}
                                    className={`p-1 rounded-full hover:bg-gray-100 ${entry.important ? 'text-amber-500' : 'text-gray-400'}`}
                                  >
                                    <Flag className="h-4 w-4" />
                                  </button>
                                  <button 
                                    onClick={() => onEditEntry(entry, index)}
                                    className="p-1 rounded-full text-blue-500 hover:bg-gray-100"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-500 border rounded-lg">
                    <Clock className="h-12 w-12 mb-2 text-slate-300" />
                    <p className="text-lg">No activities scheduled for this day</p>
                    <p className="text-sm">Start a conversation with the AI assistant to create a timetable</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TimetableVisualizer;
