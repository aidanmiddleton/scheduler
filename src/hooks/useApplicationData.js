import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useApplicationData() {
  const [state, setState] = useState({
    day: "Monday",
    days: [],
    appointments: {},
    interviewers: {}
  });

  const setDay = day => setState({ ...state, day });

  useEffect(() => {
    
    Promise.all([
      axios.get('/api/days'),
      axios.get('/api/appointments'),
      axios.get('/api/interviewers')
    ])
      .then((all) => {
        setState(prev => ({ ...prev, days: all[0].data, appointments: all[1].data, interviewers: all[2].data }));
        console.log('this is the state ', state)
        // console.log(state.interviewers)
      });
  }, [])

  // ({...currentDayObject, spots: currentDayObject.spots - 1})
  function bookInterview(id, interview) {
    const appointment = {
      ...state.appointments[id],
      interview: { ...interview }
    };

    const appointments = {
      ...state.appointments,
      [id]: appointment
    };

    return axios
    .put(`/api/appointments/${id}`, { interview })
    .then(response => setState(state => ({ ...state, appointments })))
    .then( 
      () => {

        const currentDayObject = state.days.filter(obj => {return obj.name === state.day})[0];
        const currentDayIndex = currentDayObject.id - 1;
        let newDayObect = {}
        console.log(state.appointments.interview)
        if (!state.appointments[id].interview) {

          newDayObect = ({...currentDayObject, spots: currentDayObject.spots - 1})
        } else {
          newDayObect = ({...currentDayObject})
        }
        setState((state) => {
          const newState = ({...state});
          newState.days[currentDayIndex] = newDayObect

          return newState;     
      })
    })
    
  }

  function cancelInterview(id) {
    const appointment = {
      ...state.appointments[id],
      interview: null
    };

    const appointments = {
      ...state.appointments,
      [id]: appointment
    };

    return axios
    .delete(`http://localhost:8001/api/appointments/${id}`)
    .then(response => setState(state => ({ ...state, appointments })))
    .then( 
      () => {
        const currentDayObject = state.days.filter(obj => {return obj.name === state.day})[0];
        const currentDayIndex = currentDayObject.id - 1;
        const newDayObect = ({...currentDayObject, spots: currentDayObject.spots + 1})
        setState((state) => {
          const newState = ({...state});
          newState.days[currentDayIndex] = newDayObect

          return newState;     
      })
    })
  }

  return {
    state,
    setDay,
    bookInterview,
    cancelInterview
  };


};