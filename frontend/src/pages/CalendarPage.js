// import React, { useState, useEffect } from 'react';
// import { Calendar, momentLocalizer } from 'react-big-calendar';
// import moment from 'moment';
// import "react-big-calendar/lib/css/react-big-calendar.css";
// import { useNavigate } from 'react-router-dom';
// import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import './CalendarPage.css';
// import { fetchUserEvents, addEvent, deleteEvent } from '../services/calendarService';
// import { setTaskReminder, checkForReminders } from '../services/reminderService';
// import { auth } from '../firebase'; // Firebase auth
// import { PickersDay } from '@mui/x-date-pickers/PickersDay';

// const localizer = momentLocalizer(moment);

// const CalendarPage = () => {
//   const [events, setEvents] = useState([]);
//   const [openDialog, setOpenDialog] = useState(false);
//   const [newEvent, setNewEvent] = useState({ title: '', reminderTime: null, start: '', end: '' });

//   const navigate = useNavigate();

//   // Redirect to Main
//   const handleWelcomeRedirect = () => {
//     navigate('/welcome');
//   };

//   // Fetch events and reminders
//   useEffect(() => {
//     const loadEvents = async () => {
//       const user = auth.currentUser;
//       if (!user) {
//         alert('Please log in to view your events');
//         return;
//       }

//       try {
//         const userEvents = await fetchUserEvents(user.uid);
//         const formattedEvents = userEvents.map(event => ({
//           ...event,
//           start: new Date(event.start),
//           end: new Date(event.end),
//         }));
//         setEvents(formattedEvents);

//         // Check for reminders after loading events
//         checkForReminders(formattedEvents);

//       } catch (error) {
//         console.error('Error fetching user events:', error.message);
//       }
//     };

//     loadEvents();

//     // Check reminders every minute
//     const reminderInterval = setInterval(() => checkForReminders(events), 60000);

//     return () => clearInterval(reminderInterval); // Cleanup on unmount
//   }, [events]);

//   // Open dialog for adding a new event
//   const handleSelectSlot = (slotInfo) => {
//     setNewEvent({ ...newEvent, start: slotInfo.start, end: slotInfo.end });
//     setOpenDialog(true);
//   };

//   // Close dialog
//   const handleCloseDialog = () => {
//     setOpenDialog(false);
//     setNewEvent({ title: '', reminderTime: null, start: '', end: '' });
//   };

//   // Handle adding a new event
//   const handleAddEvent = async () => {
//     const user = auth.currentUser;
//     if (!user) {
//       alert('You must be logged in to add an event.');
//       return;
//     }

//     if (newEvent.title && newEvent.reminderTime) {
//       try {
//         console.log('New Event:', newEvent);
//         const savedEvent = await addEvent({
//           ...newEvent,
//           uid: user.uid,
//           reminderTime: newEvent.reminderTime.toISOString() // Pass reminder time as ISO string
//         });

//         if (!savedEvent.eventId) {
//           throw new Error('Event ID is missing. Unable to set reminder.');
//         }

//         await setTaskReminder(savedEvent.eventId, newEvent.reminderTime.toISOString());

//         const updatedEvent = {
//           ...newEvent,
//           id: savedEvent.eventId,
//           start: new Date(newEvent.start),
//           end: new Date(newEvent.end),
//         };

//         setEvents((prevEvents) => [...prevEvents, updatedEvent]); // Append new event to the state

//         alert('Event and reminder added successfully');
//         handleCloseDialog();
//       } catch (error) {
//         console.error('Error adding event or setting reminder:', error.message);
//         alert('Failed to add event or set reminder');
//       }
//     } else {
//       alert('Event title and reminder time are required.');
//     }
//   };

//   // Handle deleting an event
//   const handleDeleteEvent = async (eventId) => {
//     try {
//       await deleteEvent(eventId);
//       setEvents(events.filter((event) => event.id !== eventId));
//       alert('Event deleted successfully');
//     } catch (error) {
//       console.error('Error deleting event:', error.message);
//       alert('Failed to delete event');
//     }
//   };

//   // Custom PickersDay component with key passed directly
// /**
//  * CustomPickersDay component used for rendering custom day cells in the DateTimePicker.
//  * 
//  * @param {object} props - The props passed to PickersDay component.
//  */
// const CustomPickersDay = (props) => {
//   const { day, selected } = props;

//   // You can customize the style or behavior here, for example, highlighting the selected day.
//   return (
//     <PickersDay
//       {...props} // Spread the default props passed to PickersDay
//       day={day}
//       selected={selected}
//     />
//   );
// };


//   return (
//     <div>
//       <button className="homeButton" onClick={handleWelcomeRedirect}>Home</button>
//       <h2>Weekly Calendar</h2>
//       <Calendar
//         localizer={localizer}
//         events={events}
//         startAccessor="start"
//         endAccessor="end"
//         selectable
//         style={{ height: 1000, margin: "50px" }}
//         defaultView="week"
//         onSelectSlot={handleSelectSlot}
//         onDoubleClickEvent={(event) => {
//           const confirmDelete = window.confirm('Do you want to delete this event?');
//           if (confirmDelete) {
//             handleDeleteEvent(event.id);
//           }
//         }}
//       />

//       <LocalizationProvider dateAdapter={AdapterDateFns}>
//         <Dialog open={openDialog} onClose={handleCloseDialog}>
//           <DialogTitle>Add New Event</DialogTitle>
//           <DialogContent>
//             <TextField
//               autoFocus
//               margin="dense"
//               label="Event Title"
//               fullWidth
//               value={newEvent.title}
//               onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
//             />
// <DateTimePicker
//   label="Reminder Time"
//   value={newEvent.reminderTime}
//   onChange={(newValue) => setNewEvent({ ...newEvent, reminderTime: newValue })}
//   renderDay={(day, selected, { key, ...props }) => (  // Destructure key out of props
//     <CustomPickersDay
//       key={day.toString()}  // Pass the key directly here
//       day={day}
//       selected={selected}
//       {...props}  // Spread other props, which no longer include key
//     />
//   )}
//   renderInput={(props) => <TextField {...props} fullWidth margin="dense" />}
// />



//           </DialogContent>
//           <DialogActions>
//             <Button onClick={handleCloseDialog}>Cancel</Button>
//             <Button onClick={handleAddEvent} color="primary">Add Event</Button>
//           </DialogActions>
//         </Dialog>
//       </LocalizationProvider>
//     </div>
//   );
// };

// export default CalendarPage;
