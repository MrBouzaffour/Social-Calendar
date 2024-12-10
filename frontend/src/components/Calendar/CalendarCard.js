import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { addEventToCalendar, editEventInfo, getCalendarEvents, addReminder, deleteEvent } from '../../services/calendarService';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import './CalendarCard.css';
import { getCurrentUserID } from '../../services/authService';




const EventComponent = ({ event }) => {
  const start = moment(event.start).format("h:mm A"); // Format start time
  const end = moment(event.end).format("h:mm A");     // Format end time

  return (
    <div>
      <strong>{event.title}</strong>
      <div>{`${start} - ${end}`}</div>
    </div>
  );
};






const localizer = momentLocalizer(moment);

const CalendarCard = ({calendarID}) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [reminderDate, setReminderDate] = useState(null);


  const [events, setEvents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", reminderTime: null, start: "", end: "" , description:"", location:"", eventType:"Personal", show:false});
  const [updateCalendar, setUpdateCalendar]= useState(false);
  const userId= getCurrentUserID();
  
  const calID = calendarID
  


  // Fetch events and reminders
  useEffect(() => {

    getEvents(calID).then((data) => {
      console.log(data);
      if(data.length != 0){
        // Convert ISO strings to Date objects
        const parsedEvents = data.map((event) => ({
          ...event,
          start: new Date(event.startDate),
          end: new Date(event.endDate),
        }));
        setEvents(parsedEvents); // Update state with parsed events
      }
      else{
        setEvents([]);
      }
      console.log(events);
    })
    
  }, [updateCalendar]);


  const getEvents = async (calendarID) => {
    try{
    const CalendarEvents = await getCalendarEvents(calendarID);
    console.log(calendarID);
    return CalendarEvents;
    } catch(error){
      console.log(error, 'Error fetching calendar events.')

    }
  }

  // Open dialog for adding a new event
  const handleSelectSlot = (slotInfo) => {
    setNewEvent({ ...newEvent, start: slotInfo.start, end: slotInfo.end });
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewEvent({ title: "", reminderTime: null, start: "", end: "" , description:"", location:"", eventType:"Personal", show:false});
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
        
        alert('Event added successfully');
        setUpdateCalendar(!updateCalendar);
        handleCloseDialog();
      } catch (error) {
        console.error('Error adding event:', error.message);
        alert('Failed to add event');
      }
    } 
    
    else {
      alert('Event title is required.');
    }

  };

  // Handle deleting an event
  const handleDeleteEvent = async () => {
    try {  
      const deletedEvent = await deleteEvent(calID,selectedEvent.id);
      if (!deletedEvent) {
        throw new Error('Unable to delete event.');
      }   
      
      alert('Event deleted successfully');
      setUpdateCalendar(!updateCalendar);
      setShowPopup(false);
    } catch (error) {
      console.error('Error deleting event:', error.message);
      alert('Failed to delete event');
    }
  };



  const handleEventClick = (event) => {
    
    setSelectedEvent(event);
    setShowPopup(true);
    setIsEditing(false); 
  };

 
  const closePopup = () => {
    setShowPopup(false);
    setSelectedEvent(null);
    setIsEditing(false);
  };
  const handleEditToggle = () => {
    setIsEditing(true); // Toggle editing mode
  };


  const handlePrivacyToggle = () => {
    setSelectedEvent((prev) => ({
      ...prev,
      isPrivate: !prev.isPrivate,
    }));
  };

  const handleSetReminder = async () => {
    try{
    if (!reminderDate) {
      alert("Please select a date and time for the reminder.");
      return;
    }
    const reminder= await addReminder(userId,calID,selectedEvent.id, reminderDate,selectedEvent.title)

    if (!reminder) {
      throw new Error('Unable to set reminder.');
    } 

    alert(
      `Reminder set for "${selectedEvent?.title}" on ${moment(
        reminderDate
      ).format("LLL")}`
    )} catch(error){



    }
    setReminderDate(null); // Reset reminder date after setting
  };



  const handleEditEventSave = async () => {

    const eventId = selectedEvent.id;
    try {
        
      const savedEvent = await editEventInfo(calID,eventId,{
        ...selectedEvent,
        uid: userId,
      });
      
      if (!savedEvent) {
        throw new Error('Unable to edit event.');
      }   
      alert('Event edited successfully');
      setIsEditing(false);
      setShowPopup(false);
    } catch (error) {
      console.error('Error editing event:', error.message);
      alert('Failed to edit event');
    }
    setUpdateCalendar(!updateCalendar);
    setIsEditing(false);
    setShowPopup(false);
     // Close popup after saving
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
        onSelectEvent={handleEventClick}
        components={{
          event: EventComponent,}}
      />
{showPopup && (
        <div className="popup-overlay" onClick={closePopup}>
          <div
            className="popup-container"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the popup
          >
            {isEditing ? (
              <>
                <h3>Edit Event</h3>
                <input
                  type="text"
                  name="title"
                  value={selectedEvent.title}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, title: e.target.value })}
                  className="popup-input"
                  placeholder="Title"
                />
                <textarea
                  name="description"
                  value={selectedEvent.description}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, description: e.target.value })}
                  className="popup-textarea"
                  placeholder="Description"
                />
                <input
                  type="text"
                  name="location"
                  value={selectedEvent.location}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, location: e.target.value })}
                  className="popup-input"
                  placeholder="Location"
                />
                <div className="privacy-toggle">
                  <label>
                    <span>{selectedEvent.isPrivate ? "Private" : "Public"}</span>
                    <input
                      type="checkbox"
                      checked={selectedEvent.isPrivate}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, show: e.target.value })}
                    />
                  </label>
                </div>
                <div className="popup-buttons">
                  <button onClick={handleEditEventSave} className="popup-button save">
                    Save
                  </button>
                  <button onClick={closePopup} className="popup-button cancel">
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>{selectedEvent.title}</h3>
                <p>
                  <strong>Start:</strong>{" "}
                  {moment(selectedEvent.start).format("LLL")}
                </p>
                <p>
                  <strong>End:</strong>{" "}
                  {moment(selectedEvent.end).format("LLL")}
                </p>
                <p>
                  <strong>Description:</strong> {selectedEvent.description}
                </p>
                <p>
                  <strong>Location:</strong> {selectedEvent.location}
                </p>
                <p>
                  <strong>Privacy:</strong>{" "}
                  {selectedEvent.show ? "Public" : "Private"}
                </p>
                <div className="reminder-section">
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      label="Reminder Date & Time"
                      value={reminderDate}
                      onChange={(newValue) => setReminderDate(newValue)}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </LocalizationProvider>
                  <button
                    variant="contained"
                    color="warning"
                    onClick={handleSetReminder}
                    className='reminderButton'
                  >
                    Set Reminder
                  </button>
                </div>
                <div className="popup-buttons">
                  <button
                    onClick={handleEditToggle}
                    className="popup-button edit"
                  >
                    Edit
                  </button>
                  <button
                    variant="outlined"
                    color="error"
                    onClick={handleDeleteEvent}
                    className="popup-button delete"
                  >
                    Delete
                  </button>
                  <button onClick={closePopup} className="popup-button close">
                    Close
                  </button>
                </div>
              </>
            )}{

  
            }
          </div>
        </div>
      )}


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

export default CalendarCard;
