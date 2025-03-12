
import { jsPDF } from 'jspdf';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { RoutineData } from '../types/routine';
import html2canvas from 'html2canvas';

// Modern color palette
const colors = {
  primary: '#34d399', // Wellness green
  secondary: '#d1fae5', // Soft green
  text: '#1e293b', // Dark slate
  background: '#ffffff', // White
  lightGray: '#f9fafb', // Background for alternating rows
  mediumGray: '#e5e7eb', // Border colors
  lightText: '#64748b', // Subtitle text
  accent: '#0ea5e9', // Blue accent
  completed: '#22c55e', // Success green
  incomplete: '#cbd5e1' // Lighter gray for incomplete
};

// Custom font and styling function
const applyFontStyles = (doc: jsPDF, style: 'title' | 'subtitle' | 'heading' | 'normal' | 'small') => {
  doc.setTextColor(colors.text);
  
  switch (style) {
    case 'title':
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      break;
    case 'subtitle':
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.lightText);
      break;
    case 'heading':
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      break;
    case 'normal':
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      break;
    case 'small':
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.lightText);
      break;
  }
};

export const generatePDF = async (routineData: RoutineData, currentDate: Date) => {
  try {
    // Create a new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Get the dates we need to display
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    
    // Determine if we're showing a daily, weekly, or monthly view
    const viewMode = routineData.timeFrame;
    const title = routineData.title || 'Habit Tracker';
    
    // Format the date period string based on the view
    let periodString = '';
    if (viewMode === 'daily') {
      periodString = format(currentDate, 'MMMM yyyy');
    } else if (viewMode === 'weekly') {
      periodString = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
    }
    
    // PDF Header with clean design
    const headerHeight = 40;
    // Light background for header
    doc.setFillColor(colors.secondary);
    doc.rect(0, 0, 210, headerHeight, 'F');
    
    // Title
    applyFontStyles(doc, 'title');
    doc.text(title, 105, 15, { align: 'center' });
    
    // Subtitle (month/period)
    applyFontStyles(doc, 'subtitle');
    doc.text(periodString, 105, 25, { align: 'center' });
    
    // Add a subtle divider line
    doc.setDrawColor(colors.mediumGray);
    doc.setLineWidth(0.2);
    doc.line(20, headerHeight + 5, 190, headerHeight + 5);
    
    // Add description
    applyFontStyles(doc, 'normal');
    doc.text(routineData.description || 'Track your daily habits and build consistency', 20, headerHeight + 15);
    
    // Track vertical position
    let yPos = headerHeight + 25;
    
    // Create a grid-based habit tracker similar to the reference image
    const columnWidth = 150;
    const rowHeight = 12;
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const numDays = daysInMonth.length;
    
    // Draw table header
    applyFontStyles(doc, 'heading');
    doc.text('Monthly Habit Practice', 105, yPos, { align: 'center' });
    yPos += 10;
    
    // Draw month label
    applyFontStyles(doc, 'normal');
    doc.text(`MONTH: ${format(currentDate, 'MMMM yyyy')}`, 20, yPos);
    yPos += 8;
    
    // Draw the day numbers row
    const cellWidth = 5;
    const tableStartX = 40;
    
    // Background for the header row
    doc.setFillColor(colors.secondary);
    doc.rect(tableStartX - 20, yPos - 5, 170, 8, 'F');
    
    // Draw HABIT label
    applyFontStyles(doc, 'normal');
    doc.text('HABIT', tableStartX - 15, yPos);
    
    // Draw day numbers
    applyFontStyles(doc, 'small');
    for (let i = 0; i < numDays; i++) {
      const day = daysInMonth[i].getDate();
      const x = tableStartX + (i * cellWidth);
      doc.text(day.toString(), x + 1, yPos);
    }
    yPos += 5;
    
    // Draw horizontal line
    doc.setDrawColor(colors.mediumGray);
    doc.line(20, yPos, 190, yPos);
    yPos += 5;
    
    // Draw habits and tracking grid
    routineData.tasks.forEach((task, index) => {
      // Draw habit name
      applyFontStyles(doc, 'normal');
      
      // Draw alternating row backgrounds
      if (index % 2 === 0) {
        doc.setFillColor(colors.lightGray);
        doc.rect(20, yPos - 5, 170, rowHeight, 'F');
      }
      
      // Truncate task title if too long
      const taskTitle = task.title.length > 15 ? task.title.substring(0, 15) + '...' : task.title;
      doc.text(taskTitle, tableStartX - 15, yPos);
      
      // Draw day cells
      for (let i = 0; i < numDays; i++) {
        const date = daysInMonth[i];
        const dateKey = date.toISOString().split('T')[0];
        const isCompleted = routineData.completionStatus[dateKey]?.[task.id] || false;
        
        const x = tableStartX + (i * cellWidth);
        
        // Draw cell border
        doc.setDrawColor(colors.mediumGray);
        doc.rect(x, yPos - 4, cellWidth, rowHeight - 1);
        
        // If completed, draw a checkmark or fill
        if (isCompleted) {
          doc.setFillColor(colors.primary);
          doc.circle(x + cellWidth/2, yPos, 1.5, 'F');
        }
      }
      
      yPos += rowHeight;
    });
    
    // Add reflection sections
    yPos += 10;
    
    // Draw two boxes side by side
    const boxWidth = 80;
    const boxHeight = 30;
    const leftBoxX = 20;
    const rightBoxX = 110;
    
    // Left box - What did you learn?
    doc.setDrawColor(colors.mediumGray);
    doc.setLineWidth(0.3);
    doc.rect(leftBoxX, yPos, boxWidth, boxHeight);
    
    applyFontStyles(doc, 'normal');
    doc.text('What did you learn?', leftBoxX + boxWidth/2, yPos + 5, { align: 'center' });
    
    // Right box - How can you improve?
    doc.rect(rightBoxX, yPos, boxWidth, boxHeight);
    doc.text('How can you improve next month?', rightBoxX + boxWidth/2, yPos + 5, { align: 'center' });
    
    // Add habits list section
    yPos += boxHeight + 15;
    
    applyFontStyles(doc, 'heading');
    doc.text('Habits Overview', 20, yPos);
    yPos += 2;
    
    // Add underline
    doc.setDrawColor(colors.primary);
    doc.setLineWidth(0.8);
    doc.line(20, yPos + 3, 60, yPos + 3);
    yPos += 10;
    
    // List all habits with their details
    applyFontStyles(doc, 'normal');
    routineData.tasks.forEach((task, index) => {
      const priorityDot = {
        high: '🔴',
        medium: '🟠',
        low: '🔵'
      };
      
      const bullet = priorityDot[task.priority] || '•';
      
      // Add habit with its priority indicator
      doc.text(`${bullet} ${task.title}`, 25, yPos);
      
      // Add description if available
      if (task.description) {
        applyFontStyles(doc, 'small');
        doc.text(task.description, 30, yPos + 4);
        yPos += 8;
      } else {
        yPos += 6;
      }
    });
    
    // Add footer with generation date
    const footerY = 285;
    applyFontStyles(doc, 'small');
    doc.text(`Generated on ${format(new Date(), 'PPP')} | ${title}`, 105, footerY, { align: 'center' });
    
    // Save the PDF
    doc.save(`${title}-${format(currentDate, 'MMM-yyyy')}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};
