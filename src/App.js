//App.js

import Calendar from "./Components/Calendar";
import Footer from "./Components/Footer";
import Header from "./Components/Header";
import api from "./API/axiosConfig.js"; //imprting axios config for API calls
import { useState,useEffect} from "react";  //importing useEffect and useState hooks

function App() {
  // State to store the list of events
  const [events, setEvents] = useState([]);

  // Fetching events data from the server when the component mounts
  useEffect(() => {
    const getEvents = async () => {

    try{
      // Sending GET request to fetch events data
      const response = await api.get("/events");
      console.log(response.data);

      // Updating the events state with the fetched data
      setEvents(response.data);
    }
    catch(error){
      console.log(error);
    }

  };

    getEvents(); // Calling the getEvents function
  }, [events]);  // Run whenever events state changes

  return (
    <div className="App">
      
      <Header></Header>
      <Calendar events={events} setEvents={setEvents}></Calendar>
      
      <Footer></Footer>
      
    </div>
  );
}

export default App;