import { useState, useEffect } from "react";

import Spinner from "../Components/Spinner";
import "./Events.scss";

function Events() {
  const [eventData, setEventData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetch(
      "https://script.google.com/macros/s/AKfycbyGujyOWsqlnFyJGPzIvICGVBLW1yqp99YDkTsb_7a2575PG--75PYZdAD00T0ziwyM/exec?type=events"
    )
      .then((response) => {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          setEventData(data.data);
        } else {
          setEventData([]);
        }
        setIsLoading(false);
      })
      .catch(() => {
        // Fall back to bundled events data
        fetch("/eventsData.json")
          .then((res) => res.json())
          .then((fallbackData) => {
            if (Array.isArray(fallbackData) && fallbackData.length > 0) {
              setEventData(fallbackData);
              setError(null);
            } else {
              setError("Failed to load events. Please check your connection and try again.");
            }
          })
          .catch(() => {
            setError("Failed to load events. Please check your connection and try again.");
          })
          .finally(() => {
            setIsLoading(false);
          });
      });
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredEvents = Array.isArray(eventData)
    ? eventData.filter((event) => {
        if (!event) return false;
        const term = searchTerm.trim().toLowerCase();
        if (!term) return true;
        const matches = (val) => val != null && String(val).toLowerCase().includes(term);
        return (
          matches(event.EventName) ||
          matches(event.Winner1) ||
          matches(event.Winner2) ||
          matches(event.Winner3) ||
          matches(event.EventDate) ||
          matches(event.EventStage) ||
          matches(event.EventState)
        );
      })
    : [];

  return (
    <>
      <div className="title--box">
        <h1>Events</h1>
        <input
          type="text"
          className="Search"
          placeholder="Search Event, Winner, Day, Stage"
          value={searchTerm}
          onChange={handleSearchChange}
          aria-label="Search events"
        />
      </div>

      {error && (
        <p role="alert" style={{ textAlign: "center", color: "rgba(255,100,100,0.9)", padding: "2rem" }}>
          {error}
        </p>
      )}

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="event_box">
          {filteredEvents.length === 0 ? (
            <p style={{ textAlign: "center", color: "rgba(255, 255, 255, 0.6)", padding: "3rem 1rem", width: "100%", fontSize: "1rem" }}>
              {searchTerm ? `No events found matching "${searchTerm}"` : "No events available at this time."}
            </p>
          ) : (
            filteredEvents.map((row) => (
              <div className="event_card" key={row.EventName}>
                <div className="mele">
                  <span className="eventDate"> {row.EventDate}</span>
                  <span className="eventState" data-state={row.EventState}>
                    {row.EventState}
                  </span>
                </div>
                <hr />
                <span className="eventName">{row.EventName}</span>
                <span className="eventStage" data-state={row.EventStage}>
                  Stage: {row.EventStage}
                </span>
                {row.EventState == "Result Announced" ? (
                  <span className="eventStartTime" data-state={row.EventStart}>
                    Event Started At {row.EventStart}
                  </span>
                ) : (
                  <span className="eventStartTime" data-state={row.EventStart}>
                    Event Starts At {row.EventStart}
                  </span>
                )}
                <span className="FirstWinner Winner" data-state={row.Winner1}>
                  First : {row.Winner1}
                </span>
                <span className="SecondWinner Winner" data-state={row.Winner2}>
                  Second : {row.Winner2}
                </span>
                <span className="ThirdWinner Winner" data-state={row.Winner3}>
                  Third : {row.Winner3}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
}

export default Events;
