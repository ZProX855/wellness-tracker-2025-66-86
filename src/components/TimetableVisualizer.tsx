
import React, { useState, useRef } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  List, 
  Grid as GridIcon, 
  Share2, 
  Download, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  Star, 
  StarOff,
  RefreshCw,
  Square,
  CheckSquare
} from 'lucide-react';
import { format } from 'date-fns';
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
  onDeleteEntry: (index: number) => void;
  onToggleCompleted: (index: number) => void;
  onToggleImportant: (index: number) => void;
  onDownload: () => void;
  onShare: () => void;
  onRegenerate: () => void;
  colorTheme: 'soft' | 'vibrant' | 'pastel';
}

// Color themes for the timetable
const colorThemes = {
  soft: {
    routine: 'bg-slate-100 text-slate-800 border-slate-200',
    work: 'bg-blue-100 text-blue-800 border-blue-200',
    meal: 'bg-amber-100 text-amber-800 border-amber-200',
    exercise: 'bg-green-100 text-green-800 border-green-200',
    leisure: 'bg-purple-100 text-purple-800 border-purple-200',
    learning: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    rest: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  vibrant: {
    routine: 'bg-slate-200 text-slate-900 border-slate-300',
    work: 'bg-blue-200 text-blue-900 border-blue-300',
    meal: 'bg-amber-200 text-amber-900 border-amber-300',
    exercise: 'bg-green-200 text-green-900 border-green-300',
    leisure: 'bg-purple-200 text-purple-900 border-purple-300',
    learning: 'bg-indigo-200 text-indigo-900 border-indigo-300',
    rest: 'bg-rose-200 text-rose-900 border-rose-300',
  },
  pastel: {
    routine: 'bg-slate-50 text-slate-700 border-slate-100',
    work: 'bg-blue-50 text-blue-700 border-blue-100',
    meal: 'bg-amber-50 text-amber-700 border-amber-100',
    exercise: 'bg-green-50 text-green-700 border-green-100',
    leisure: 'bg-purple-50 text-purple-700 border-purple-100',
    learning: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    rest: 'bg-rose-50 text-rose-700 border-rose-100',
  }
};

// PDF color themes - we need explicit colors for PDF
const pdfColorThemes = {
  routine: { light: '#F8FAFC', dark: '#334155' },  // slate
  work: { light: '#DBEAFE', dark: '#1E40AF' },     // blue
  meal: { light: '#FEF3C7', dark: '#92400E' },     // amber
  exercise: { light: '#DCFCE7', dark: '#166534' }, // green
  leisure: { light: '#F3E8FF', dark: '#6B21A8' },  // purple
  learning: { light: '#E0E7FF', dark: '#3730A3' }, // indigo
  rest: { light: '#FFE4E6', dark: '#9F1239' },     // rose
};

const TimetableVisualizer: React.FC<TimetableVisualizerProps> = ({
  timetable,
  onEditEntry,
  onDeleteEntry,
  onToggleCompleted,
  onToggleImportant,
  onShare,
  onRegenerate,
  colorTheme
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewType, setViewType] = useState<"timeline" | "table" | "grid">("timeline");
  const tableRef = useRef<HTMLDivElement>(null);
  
  // Get color based on activity category
  const getCategoryColor = (category: TimetableEntry['category']) => {
    return colorThemes[colorTheme][category];
  };

  // Format the current selected date
  const formattedDate = format(selectedDate, 'EEEE, MMMM d, yyyy');
  
  // Calculate time percentage for timeline view (0-24 hours)
  const getTimePercentage = (timeString: string) => {
    const timeRegex = /(\d{1,2}):(\d{2})\s*(AM|PM)/i;
    const match = timeString.match(timeRegex);
    
    if (!match) return 0;
    
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();
    
    // Convert to 24-hour format
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    // Calculate percentage (hours + minutes as fraction of hour) / 24 * 100
    return (hours + minutes / 60) / 24 * 100;
  };
  
  // Sort timetable entries by time
  const sortedTimetable = [...timetable].sort((a, b) => {
    return getTimePercentage(a.time) - getTimePercentage(b.time);
  });

  // Enhanced PDF download function
  const downloadTimetableAsPDF = async () => {
    // Create new PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Set title
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(40, 80, 60); // Teal color
    pdf.setFontSize(18);
    pdf.text(`Daily Timetable: ${formattedDate}`, 15, 15);
    
    // Draw decorative header
    pdf.setFillColor(230, 245, 240); // Light teal background
    pdf.roundedRect(10, 20, 190, 10, 2, 2, 'F');
    pdf.setTextColor(40, 80, 60);
    pdf.setFontSize(10);
    pdf.text('Time', 15, 27);
    pdf.text('Activity', 60, 27);
    pdf.text('Category', 140, 27);
    pdf.text('Done', 175, 27);
    
    // Set start Y position for timetable entries
    let yPos = 40;
    const entryHeight = 15;
    const pageHeight = 270;
    
    // Function to check if we need a new page
    const checkForNewPage = (currentY: number, entryHeight: number) => {
      if (currentY + entryHeight > pageHeight) {
        pdf.addPage();
        yPos = 20;
        return true;
      }
      return false;
    };
    
    // Draw color category legend
    pdf.setFontSize(9);
    pdf.setTextColor(80, 80, 80);
    pdf.text('Categories:', 15, pageHeight + 10);
    
    let legendX = 40;
    const categories = ['routine', 'work', 'meal', 'exercise', 'leisure', 'learning', 'rest'] as const;
    
    categories.forEach((cat) => {
      const color = pdfColorThemes[cat];
      pdf.setFillColor(hexToRgb(color.light).r, hexToRgb(color.light).g, hexToRgb(color.light).b);
      pdf.roundedRect(legendX, pageHeight + 7, 6, 6, 1, 1, 'F');
      pdf.setTextColor(hexToRgb(color.dark).r, hexToRgb(color.dark).g, hexToRgb(color.dark).b);
      pdf.text(cat.charAt(0).toUpperCase() + cat.slice(1), legendX + 8, pageHeight + 11);
      legendX += 25;
    });
    
    // Draw timetable entries
    for (const entry of sortedTimetable) {
      // Check if we need a new page
      checkForNewPage(yPos, entryHeight);
      
      // Get category colors
      const color = pdfColorThemes[entry.category];
      
      // Draw background for entry
      pdf.setFillColor(hexToRgb(color.light).r, hexToRgb(color.light).g, hexToRgb(color.light).b);
      pdf.roundedRect(10, yPos - 4, 190, entryHeight, 2, 2, 'F');
      
      // Draw time
      pdf.setTextColor(hexToRgb(color.dark).r, hexToRgb(color.dark).g, hexToRgb(color.dark).b);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text(entry.time, 15, yPos + 3);
      
      // Draw activity (with strikethrough if completed)
      pdf.setFont("helvetica", entry.completed ? "italic" : "normal");
      const activityText = entry.activity.length > 50 ? entry.activity.substring(0, 47) + '...' : entry.activity;
      
      if (entry.completed) {
        // For completed items, show in lighter color
        pdf.setTextColor(hexToRgb(color.dark).r, hexToRgb(color.dark).g, hexToRgb(color.dark).b, 0.7);
        pdf.text(activityText, 60, yPos + 3);
        
        // Draw strikethrough line
        pdf.setDrawColor(hexToRgb(color.dark).r, hexToRgb(color.dark).g, hexToRgb(color.dark).b, 0.5);
        const textWidth = pdf.getTextWidth(activityText);
        pdf.line(60, yPos + 1, 60 + textWidth, yPos + 1);
      } else {
        pdf.setTextColor(hexToRgb(color.dark).r, hexToRgb(color.dark).g, hexToRgb(color.dark).b);
        pdf.text(activityText, 60, yPos + 3);
      }
      
      // Add description if exists (smaller text)
      if (entry.description) {
        const descriptionText = entry.description.length > 60 ? entry.description.substring(0, 57) + '...' : entry.description;
        pdf.setFontSize(8);
        pdf.setTextColor(hexToRgb(color.dark).r, hexToRgb(color.dark).g, hexToRgb(color.dark).b, 0.7);
        pdf.text(descriptionText, 60, yPos + 8);
      }
      
      // Draw category badge
      pdf.setFillColor(hexToRgb(color.dark).r, hexToRgb(color.dark).g, hexToRgb(color.dark).b, 0.1);
      pdf.setDrawColor(hexToRgb(color.dark).r, hexToRgb(color.dark).g, hexToRgb(color.dark).b);
      pdf.roundedRect(140, yPos - 1, 25, 6, 1, 1, 'FD');
      pdf.setFontSize(7);
      pdf.setTextColor(hexToRgb(color.dark).r, hexToRgb(color.dark).g, hexToRgb(color.dark).b);
      pdf.text(entry.category.charAt(0).toUpperCase() + entry.category.slice(1), 143, yPos + 2.5);
      
      // Draw checkbox
      pdf.setDrawColor(80, 80, 80);
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(175, yPos - 1, 6, 6, 1, 1, entry.completed ? 'F' : 'FD');
      
      // If completed, draw a checkmark
      if (entry.completed) {
        pdf.setDrawColor(40, 167, 69); // Green color
        pdf.setLineWidth(0.5);
        // Draw a checkmark
        pdf.line(176, yPos + 2, 178, yPos + 4);
        pdf.line(178, yPos + 4, 181, yPos);
      }
      
      // Add star for important items
      if (entry.important) {
        pdf.setFillColor(255, 193, 7); // Amber color
        const starSize = 3;
        const starX = 50;
        const starY = yPos + 1;
        drawStar(pdf, starX, starY, 5, starSize, starSize/2);
      }
      
      // Increase Y position for next entry
      yPos += entryHeight + 2;
    }
    
    // Add footer
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(8);
    pdf.text('Generated by Wellness Assistant', 80, 285);
    
    // Save PDF
    pdf.save(`timetable_${format(selectedDate, 'yyyy-MM-dd')}.pdf`);
  };
  
  // Helper function to draw a star - modified to use jsPDF methods
  const drawStar = (pdf: jsPDF, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
    let rot = Math.PI/2*3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;
    
    pdf.setFillColor(255, 193, 7); // Amber color for stars
    
    // Create polygon points for the star
    const points = [];
    
    for(let i = 0; i < spikes; i++) {
      // Outer point
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      points.push([x, y]);
      rot += step;
      
      // Inner point
      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      points.push([x, y]);
      rot += step;
    }
    
    // Draw the star using a polygon
    if (points.length > 0) {
      // Convert points to the format jsPDF expects
      const flatPoints: number[] = [];
      for (const [px, py] of points) {
        flatPoints.push(px, py);
      }
      
      // Draw the polygon
      pdf.triangle(
        points[0][0], points[0][1],
        points[1][0], points[1][1],
        points[2][0], points[2][1],
        'F'
      );
      
      // Draw the remaining triangles to complete the star
      for (let i = 2; i < points.length - 1; i++) {
        pdf.triangle(
          points[0][0], points[0][1],
          points[i][0], points[i][1],
          points[i+1][0], points[i+1][1],
          'F'
        );
      }
      
      // Close the star by connecting the last point to the first
      pdf.triangle(
        points[0][0], points[0][1],
        points[points.length-1][0], points[points.length-1][1],
        points[1][0], points[1][1],
        'F'
      );
    }
  };
  
  // Helper function to convert hex to rgb
  const hexToRgb = (hex: string, alpha = 1) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b, a: alpha };
  };

  return (
    <Card className="p-6 shadow-md bg-white rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-teal-600" />
          <h2 className="text-xl font-semibold text-slate-800">
            Your Timetable for {formattedDate}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRegenerate}
            className="text-teal-600 border-teal-200 hover:bg-teal-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onShare}
            className="text-teal-600 border-teal-200 hover:bg-teal-50"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={downloadTimetableAsPDF}
            className="text-teal-600 border-teal-200 hover:bg-teal-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-1">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="border rounded-lg"
            highlightToday
          />
          
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-medium text-slate-700">Categories:</h3>
            <div className="flex flex-wrap gap-2">
              {(['routine', 'work', 'meal', 'exercise', 'leisure', 'learning', 'rest'] as const).map(category => (
                <Badge 
                  key={category} 
                  variant="outline"
                  className={`${getCategoryColor(category)}`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger 
                value="timeline" 
                onClick={() => setViewType("timeline")}
                className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-800"
              >
                <Clock className="h-4 w-4 mr-2" />
                Timeline
              </TabsTrigger>
              <TabsTrigger 
                value="table" 
                onClick={() => setViewType("table")}
                className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-800"
              >
                <List className="h-4 w-4 mr-2" />
                Table
              </TabsTrigger>
              <TabsTrigger 
                value="grid" 
                onClick={() => setViewType("grid")}
                className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-800"
              >
                <GridIcon className="h-4 w-4 mr-2" />
                Cards
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="timeline" className="mt-0">
              <div className="relative h-[500px] border-l-2 border-slate-200 ml-6 pl-6 overflow-y-auto pr-2" ref={tableRef}>
                {sortedTimetable.length > 0 ? (
                  sortedTimetable.map((entry, index) => (
                    <div 
                      key={index} 
                      className={`relative mb-6 ${entry.completed ? 'opacity-60' : ''}`}
                      style={{
                        marginTop: index === 0 ? `${getTimePercentage(entry.time)}px` : `${(getTimePercentage(entry.time) - getTimePercentage(sortedTimetable[index-1].time)) * 8}px`
                      }}
                    >
                      <div className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-white border-2 border-teal-500 z-10">
                        <div className="w-2 h-2 rounded-full bg-teal-500 m-[5px]"></div>
                      </div>
                      <div 
                        className={`
                          p-4 rounded-lg border shadow-sm 
                          ${getCategoryColor(entry.category)} 
                          ${entry.important ? 'ring-2 ring-amber-400' : ''}
                        `}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-lg">{entry.time}</span>
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => onToggleCompleted(index)} 
                              className="h-7 w-7 p-0 hover:bg-white/20"
                              title={entry.completed ? "Mark as not completed" : "Mark as completed"}
                            >
                              {entry.completed ? 
                                <CheckSquare className="h-5 w-5 text-green-600" /> : 
                                <Square className="h-5 w-5 text-slate-400" />
                              }
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => onToggleImportant(index)} 
                              className="h-7 w-7 p-0 hover:bg-white/20"
                              title={entry.important ? "Remove importance" : "Mark as important"}
                            >
                              {entry.important ? 
                                <Star className="h-5 w-5 text-amber-500 fill-amber-500" /> : 
                                <StarOff className="h-5 w-5 text-slate-400" />
                              }
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => onEditEntry(entry, index)} 
                              className="h-7 w-7 p-0 hover:bg-white/20"
                              title="Edit activity"
                            >
                              <Edit className="h-5 w-5 text-slate-500" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => onDeleteEntry(index)} 
                              className="h-7 w-7 p-0 hover:bg-white/20 hover:text-red-500"
                              title="Delete activity"
                            >
                              <Trash2 className="h-5 w-5 text-slate-500" />
                            </Button>
                          </div>
                        </div>
                        <p className={`text-base mt-1 ${entry.completed ? 'line-through' : ''}`}>
                          {entry.activity}
                        </p>
                        {entry.description && (
                          <p className="text-sm mt-1 opacity-80">{entry.description}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <Clock className="h-12 w-12 mb-2 text-slate-300" />
                    <p className="text-lg">No activities scheduled for this day</p>
                    <p className="text-sm">Start a conversation with the AI assistant to create a timetable</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="table" className="mt-0">
              {timetable.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedTimetable.map((entry, index) => (
                        <tr key={index} className={entry.completed ? 'bg-gray-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {entry.important && <Star className="h-4 w-4 text-amber-500 fill-amber-500 mr-1" />}
                              <span className="font-medium">{entry.time}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className={entry.completed ? 'line-through text-gray-500' : ''}>
                              {entry.activity}
                              {entry.description && (
                                <p className="text-xs text-gray-500 mt-1">{entry.description}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getCategoryColor(entry.category)}>
                              {entry.category.charAt(0).toUpperCase() + entry.category.slice(1)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => onToggleCompleted(index)} 
                                className={`h-8 w-8 p-0 rounded-full ${entry.completed ? 'bg-green-100' : 'bg-gray-100'}`}
                                title={entry.completed ? "Mark as not completed" : "Mark as completed"}
                              >
                                {entry.completed ? 
                                  <CheckSquare className="h-5 w-5 text-green-600" /> : 
                                  <Square className="h-5 w-5 text-gray-400" />
                                }
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => onToggleImportant(index)} 
                                className={`h-8 w-8 p-0 rounded-full ${entry.important ? 'bg-amber-100' : 'bg-gray-100'}`}
                                title={entry.important ? "Remove importance" : "Mark as important"}
                              >
                                {entry.important ? 
                                  <Star className="h-5 w-5 text-amber-500 fill-amber-500" /> : 
                                  <StarOff className="h-5 w-5 text-gray-400" />
                                }
                              </Button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => onEditEntry(entry, index)} 
                                className="h-8 w-8 p-0"
                                title="Edit activity"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => onDeleteEntry(index)} 
                                className="h-8 w-8 p-0 text-red-500"
                                title="Delete activity"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500 border rounded-lg">
                  <Clock className="h-12 w-12 mb-2 text-slate-300" />
                  <p className="text-lg">No activities scheduled for this day</p>
                  <p className="text-sm">Start a conversation with the AI assistant to create a timetable</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="grid" className="mt-0">
              {timetable.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {sortedTimetable.map((entry, index) => (
                    <div 
                      key={index} 
                      className={`
                        p-4 rounded-lg border shadow-sm 
                        ${getCategoryColor(entry.category)} 
                        ${entry.completed ? 'opacity-70' : ''}
                        ${entry.important ? 'ring-2 ring-amber-400' : ''}
                      `}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-lg">{entry.time}</h3>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onToggleCompleted(index)} 
                            className="h-7 w-7 p-0 hover:bg-white/20"
                            title={entry.completed ? "Mark as not completed" : "Mark as completed"}
                          >
                            {entry.completed ? 
                              <CheckSquare className="h-5 w-5 text-green-600" /> : 
                              <Square className="h-5 w-5 text-slate-400" />
                            }
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onToggleImportant(index)} 
                            className="h-7 w-7 p-0 hover:bg-white/20"
                            title={entry.important ? "Remove importance" : "Mark as important"}
                          >
                            {entry.important ? 
                              <Star className="h-5 w-5 text-amber-500 fill-amber-500" /> : 
                              <StarOff className="h-5 w-5 text-slate-400" />
                            }
                          </Button>
                        </div>
                      </div>
                      <p className={`text-base mb-2 ${entry.completed ? 'line-through' : ''}`}>
                        {entry.activity}
                      </p>
                      {entry.description && (
                        <p className="text-sm opacity-80 mb-3">{entry.description}</p>
                      )}
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
                  ))}
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
    </Card>
  );
};

export default TimetableVisualizer;
