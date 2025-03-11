
import { jsPDF } from 'jspdf';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isSameDay } from 'date-fns';
import { RoutineData } from '../types/routine';
import html2canvas from 'html2canvas';

export const generatePDF = async (routineData: RoutineData, currentDate: Date) => {
  try {
    // Create a new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Set title
    const title = routineData.title || 'Daily Routine Tracker';
    const month = format(currentDate, 'MMMM yyyy');
    
    // Add PDF header
    doc.setFillColor(220, 53, 69); // Red header
    doc.rect(0, 0, 210, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text(title, 105, 12, { align: 'center' });
    doc.setFontSize(12);
    doc.text(month, 105, 20, { align: 'center' });
    doc.setTextColor(0, 0, 0);

    // Document description
    doc.setFontSize(10);
    doc.text(routineData.description || 'Personal daily tasks and habits', 20, 35);
    
    // Get all days in the month
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Draw calendar
    const calendarStartY = 45;
    const calendarWidth = 170;
    const dayWidth = calendarWidth / 7;
    const dayHeight = 20;
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Draw header row with day names
    doc.setFillColor(240, 240, 240);
    doc.rect(20, calendarStartY, calendarWidth, dayHeight, 'F');
    doc.setFontSize(9);
    dayNames.forEach((day, i) => {
      const x = 20 + i * dayWidth;
      const textX = x + dayWidth / 2;
      doc.setTextColor(i === 0 ? 220 : 0, 0, 0); // Red for Sunday
      doc.text(day, textX, calendarStartY + 5, { align: 'center' });
    });
    
    // Calculate number of weeks to display
    const numWeeks = Math.ceil((monthStart.getDay() + daysInMonth.length) / 7);
    
    // Draw calendar grid and days
    let currentDay = 0;
    for (let week = 0; week < numWeeks; week++) {
      for (let weekday = 0; weekday < 7; weekday++) {
        const dayIndex = week * 7 + weekday - monthStart.getDay();
        const x = 20 + weekday * dayWidth;
        const y = calendarStartY + dayHeight + week * dayHeight;
        
        // Draw cell border
        doc.setDrawColor(200, 200, 200);
        doc.rect(x, y, dayWidth, dayHeight);
        
        if (dayIndex >= 0 && dayIndex < daysInMonth.length) {
          const date = daysInMonth[dayIndex];
          const dateKey = date.toISOString().split('T')[0];
          
          // Draw day number
          doc.setFontSize(8);
          doc.setTextColor(weekday === 0 ? 220 : 0, 0, 0); // Red for Sunday
          doc.text(date.getDate().toString(), x + 3, y + 5);
          
          // Draw tasks for this day
          let taskY = y + 10;
          routineData.tasks.slice(0, 3).forEach((task, i) => {
            const isCompleted = !!routineData.completionStatus[dateKey]?.[task.id];
            
            // Draw checkbox
            doc.setDrawColor(120, 120, 120);
            doc.rect(x + 3, taskY - 3, 3, 3);
            
            if (isCompleted) {
              // Draw X for completed
              doc.setDrawColor(220, 0, 0);
              doc.line(x + 3, taskY - 3, x + 6, taskY);
              doc.line(x + 6, taskY - 3, x + 3, taskY);
            }
            
            // Draw task title
            doc.setFontSize(6);
            doc.setTextColor(0, 0, 0);
            const title = task.title.length > 12 ? task.title.substring(0, 12) + '...' : task.title;
            doc.text(title, x + 8, taskY);
            
            taskY += 4;
          });
        }
      }
    }
    
    // Add task list section
    const tasksStartY = calendarStartY + numWeeks * dayHeight + 20;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Tasks and Habits', 20, tasksStartY);
    
    // Underline
    doc.setDrawColor(220, 53, 69);
    doc.setLineWidth(0.5);
    doc.line(20, tasksStartY + 2, 190, tasksStartY + 2);
    
    // List all tasks
    let taskY = tasksStartY + 10;
    doc.setFontSize(10);
    
    routineData.tasks.forEach((task, index) => {
      const taskNumber = index + 1;
      doc.setTextColor(0, 0, 0);
      doc.text(`${taskNumber}. ${task.title}`, 25, taskY);
      
      // Add priority label
      const priorityColor = 
        task.priority === 'high' ? [220, 53, 69] : 
        task.priority === 'medium' ? [255, 193, 7] : 
        [0, 123, 255];
      
      doc.setFillColor(priorityColor[0], priorityColor[1], priorityColor[2]);
      doc.circle(22, taskY - 1, 1, 'F');
      
      // Add task description if available
      if (task.description) {
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(task.description, 30, taskY + 4);
        taskY += 8;
      } else {
        taskY += 6;
      }
      
      // Check if we need to start a new page
      if (taskY > 280) {
        doc.addPage();
        taskY = 20;
      }
    });
    
    // Add footer
    const currentDateStr = format(new Date(), 'PPP');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated on ${currentDateStr} | Daily Routine Tracker`, 105, 290, { align: 'center' });
    
    // Save the PDF
    doc.save(`${title}-${month}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};
