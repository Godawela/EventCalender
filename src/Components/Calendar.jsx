import React, { useRef, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'tippy.js/dist/tippy.css'; // Import tippy.js styles
import './Calendar.css';
import axios from 'axios';
import tippy from 'tippy.js';




export default function Calendar() {
    const calendarRef = useRef(null);
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [eventDetails, setEventDetails] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [isAllDay, setIsAllDay] = useState(false);
    const [showEventModal, setShowEventModal] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);
    const [mode, setMode] = useState('create'); // 'create' or 'update'

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get('http://localhost:8080/events');
                const externalEvents=await fetchExternalEvents();
                setEvents([...response.data,...externalEvents]);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };

        fetchEvents();
    }, []);

    const fetchExternalEvents = async () => {
        try {
            const response = await axios.get('#'); 
            return response.data.map(event => ({
                ...event,
                source: 'external',
            }));
        } catch (error) {
            console.error('Error fetching external events:', error);
            return [];
        }
    };


    const handleDateClick = (info) => {
        setSelectedDate(info.date);
        setShowDatePicker(true);
        setStartTime(new Date(info.date));
        setEndTime(new Date(info.date));
        setEventDetails('');
        setIsAllDay(false);
        setMode('create');
        setShowEventModal(true);
    };

    const handleEventClick = (info) => {
        const event = info.event;
        setCurrentEvent(event);
        setEventDetails(event.extendedProps.description);
        setStartTime(new Date(event.start));
        setEndTime(event.end ? new Date(event.end) : new Date(event.start));
        setIsAllDay(event.allDay);
        setMode('update');
        setShowEventModal(true);
    };

    const handleButtonClick = () => {
        setShowDatePicker(true);
        setSelectedDate(new Date());
        setStartTime(new Date());
        setEndTime(new Date());
        setEventDetails('');
        setIsAllDay(false);
        setCurrentEvent(null);
        setMode('create');
        setShowEventModal(true);
    };

    const handleSaveOrUpdateEvent = async () => {
        if (mode === 'create') {
            await handleAddEvent();
        } else {
            await handleUpdateEvent();
        }
    };

    const handleAddEvent = async () => {
        try {
            const newEvent = {
                id: events.length + 1,
                title: eventDetails,
                start: startTime.toISOString(),
                end: endTime.toISOString(),
                allDay: isAllDay,
                description: eventDetails,
            };

            const response = await axios.post('http://localhost:8080/events', newEvent);
            setEvents([...events, response.data]);
            setShowDatePicker(false);
            setShowEventModal(false);
            setEventDetails('');
        } catch (error) {
            console.error('Error creating event:', error);
        }
    };

    const handleUpdateEvent = async () => {
        if (currentEvent.source === 'external') {
            alert('External events cannot be updated.');
            return;
        }

        try {
            const updatedEvent = {
                ...currentEvent.extendedProps, // Use extendedProps to preserve other fields
                id: currentEvent.id,
                title: eventDetails,
                start: startTime.toISOString(),
                end: endTime.toISOString(),
                allDay: isAllDay,
                description: eventDetails,
            };

            await axios.put(`http://localhost:8080/events/${currentEvent.id}`, updatedEvent);
            setEvents(events.map(event => (event.id === currentEvent.id ? updatedEvent : event)));
            setShowEventModal(false);
            setCurrentEvent(null);
        } catch (error) {
            console.error('Error updating event:', error);
        }
    };

    const handleDeleteEvent = async () => {
        if (currentEvent.source==='external'){
            alert("External Events cannot be deleted");
            return;
        }

        try {
            await axios.delete(`http://localhost:8080/events/${currentEvent.id}`);
            setEvents(events.filter(event => event.id !== currentEvent.id));
            setShowEventModal(false);
            setCurrentEvent(null);
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    const handleAllDayChange = (event) => {
        setIsAllDay(event.target.checked);
    };

    const handleMouseEnter = (info) => {
        const start = new Date(info.event.start).toLocaleString();
        const end = info.event.end ? new Date(info.event.end).toLocaleString() : 'No end time';
        const description = info.event.extendedProps.description || 'No details provided';

        tippy(info.el, {
            content: `
                <strong>${info.event.title}</strong><br>
                <strong>Start:</strong> ${start}<br>
                <strong>End:</strong> ${end}<br>
                <strong>Details:</strong> ${description}
            `,
            arrow: true,
            placement: 'top',
            allowHTML: true,
        });
    };

    return (
        <div className='allcal'>
            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                initialView={'dayGridMonth'}
                selectable={true}
                editable={true}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                events={events}
                eventMouseEnter={handleMouseEnter}
                eventColor='#00CCCC'
                eventBackgroundColor='black'
                displayEventTime={true}
                displayEventEnd={true}
                eventOrder='start'
                headerToolbar={{
                    start: 'today prev,next',
                    center: 'title',
                    end: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
                }}
                height={'90vh'}
               
            />

            <div className="button1" onClick={handleButtonClick}>
                Create New Event
            </div>

            {showEventModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{mode === 'create' ? 'Create Event' : 'Update Event'}</h2>
                        <div className='button2-container'>
                            <label>Start Time: </label>
                            <DatePicker
                                selected={startTime}
                                onChange={(date) => {
                                    setStartTime(date);
                                    if (endTime < date) {
                                        setEndTime(date);
                                    }
                                }}
                                showTimeSelect
                                timeIntervals={15}
                                dateFormat="Pp"
                            />
                        </div>
                        <br />
                        <div className='button2-container'>
                            <label>End Time: </label>
                            <DatePicker
                                selected={endTime}
                                onChange={(date) => setEndTime(date)}
                                showTimeSelect
                                timeIntervals={15}
                                dateFormat="Pp"
                            />
                        </div>
                        <div className='button2-container'>
                            <div className="eventdetails">
                                <label>Event Details: </label>
                                <input
                                    type="text"
                                    placeholder="Event details"
                                    value={eventDetails}
                                    onChange={(e) => setEventDetails(e.target.value)}
                                    style={{ width: '300px', height: '50px' }}
                                />
                            </div>
                            <input
                                type="checkbox"
                                id="allDayCheckbox"
                                checked={isAllDay}
                                onChange={handleAllDayChange}
                            />
                            <label htmlFor="allDayCheckbox">All Day</label>
                        </div>
                        <div className="button2-container">
                            <div className="button2" onClick={handleSaveOrUpdateEvent}>
                                {mode === 'create' ? 'Save' : 'Update'}
                            </div>
                            
                            {mode === 'update' && (
                                    
                                <div style={{ margin: '20px 120px' }} className="button2" onClick={handleDeleteEvent}>
                                    Delete
                                </div>
                            )}
                        </div>
                        <div className="button2-container">
                            <button className="button2" onClick={() => setShowEventModal(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
