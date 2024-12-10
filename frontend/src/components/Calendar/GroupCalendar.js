import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { addEventToCalendar } from '../../services/calendarService';
//import { setTaskReminder, checkForReminders } from '../services/reminderService';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import './CalendarCard.css';
import CalendarCard from './CalendarCard';
import Group, { getGroupById } from '../../../../Backend/models/groupModel';


const localizer = momentLocalizer(moment);

const GroupCalendar = (calendarID) => {
  const [events, setEvents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", reminderTime: null, start: "", end: "" , description:"", location:"", eventType:"Group"});
  
  const userId= getCurrentUserID();
  
  const calID = calendarID
  


  // Fetch events and reminders
  useEffect(() => {

    getEvents(calID).then((data) => {
      // Convert ISO strings to Date objects
      const parsedEvents = data.map((event) => ({
        ...event,
        start: new Date(event.startDate),
        end: new Date(event.endDate),
      }));
      setEvents(parsedEvents); // Update state with parsed events
      console.log(events)
    })
    
  }, []);


  const getEvents = (calendarID) => {
    try{
    const CalendarEvents = getCalendarEvents(calendarID);
    
    return CalendarEvents;
    } catch(error){
      console.log(error, 'Error fetching calendar events.')

    }
  }

  //getEvents(calID)


  // Open dialog for adding a new event
  const handleSelectSlot = (slotInfo) => {
    setNewEvent({ ...newEvent, start: slotInfo.start, end: slotInfo.end });
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewEvent({ title: "", reminderTime: null, start: "", end: "" });
  };

  // Handle adding a new event
  const handleAddEvent = async () => {
    if (newEvent.title) {
      try {
        
        const savedEvent = await addEventToCalendar(calID,{
          ...newEvent,
          uid: userId,
        });
        
        if (!savedEvent) {
          throw new Error('Event ID is missing. Unable to set reminder.');
        }   
        
        alert('Event and reminder added successfully');
        handleCloseDialog();
      } catch (error) {
        console.error('Error adding event or setting reminder:', error.message);
        alert('Failed to add event or set reminder');
      }
    } 
    
    else {
      alert('Event title and reminder time are required.');
    }

  };

  // Handle deleting an event
  const handleDeleteEvent = async (eventId) => {
  
  };

  // Custom PickersDay component with key passed directly
/**
 * CustomPickersDay component used for rendering custom day cells in the DateTimePicker.
 * 
 * @param {object} props - The props passed to PickersDay component.
 */
const CustomPickersDay = (props) => {
  const { day, selected } = props;

  // You can customize the style or behavior here, for example, highlighting the selected day.
  return (
    <PickersDay
      {...props} // Spread the default props passed to PickersDay
      day={day}
      selected={selected}
    />
  );
};
 

  return (
  
    
    <div >
      
        <div className='calendar-box'>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        style={{ height: "500px", width: "1000px", margin: "50px"}}
        onSelectSlot={handleSelectSlot}
        onDoubleClickEvent={(event) => {
          const confirmDelete = window.confirm('Do you want to delete this event?');
          if (confirmDelete) {
            handleDeleteEvent(event.id);
          }
        }}
      />
      </div>
      
      
      

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Dialog open={openDialog} onClose={handleCloseDialog}>


          <DialogTitle>Add New Event</DialogTitle>

          <DialogContent>

<TextField
              autoFocus
              margin="dense"
              label="Event Title"
              fullWidth
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            />




<TextField
              autoFocus
              margin="dense"
              label="Event Description"
              fullWidth
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            />

<TextField
              autoFocus
              margin="dense"
              label="Event Location"
              fullWidth
              value={newEvent.location}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
            />

    
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleAddEvent} color="primary">Add Event</Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    
    </div>
    
  );
};

export default GroupCalendar;

