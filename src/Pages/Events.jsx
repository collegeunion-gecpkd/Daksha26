import { useState, useEffect, useCallback } from "react";

import Spinner from "../Components/Spinner";
import "./Events.scss";

const FILTER_CHIPS = [
  { label: "All",      key: "all" },
  { label: "Offstage", key: "Offstage" },
  { label: "Day 1",    key: "Day 1" },
  { label: "Day 2",    key: "Day 2" },
  { label: "Day 3",    key: "Day 3" },
];

function getEmbeddedFormUrl(url) {
  if (!url) return "";
  if (url.includes("viewform")) {
    return url.includes("embedded=true")
      ? url
      : `${url}${url.includes("?") ? "&" : "?"}embedded=true`;
  }
  return url;
}

function formatDisplayTime(timeStr) {
  if (!timeStr) return "";
  const str = String(timeStr).trim();
  if (str.includes("GMT") || str.includes("1899")) {
    const match = str.match(/(\d{2}):(\d{2}):\d{2}/);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = match[2];
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
    }
  }
  return str;
}

function Events() {
  const [eventData, setEventData] = useState(() => {
    try {
      const cached = localStorage.getItem("daksha_events_cache_v2");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeRegEvent, setActiveRegEvent] = useState(null);
  const [iframeLoading, setIframeLoading] = useState(true);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && activeRegEvent) {
        setActiveRegEvent(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeRegEvent]);

  // Lock body scroll when registration modal is open
  useEffect(() => {
    if (activeRegEvent) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeRegEvent]);

  // Fetch events with stale-while-revalidate
  const fetchEvents = useCallback(() => {
    if (eventData.length === 0) setIsLoading(true);
    setError(null);

    // Primary: Google Sheets Apps Script / Web endpoint
    fetch(
      "https://script.google.com/macros/s/AKfycbxCw-ulTAh7K7olhKI_jNzDJZI8rc8S7ucLmCSWJDnh8bN8vyqbYf6SqPb7LRSuDllp/exec?type=events"
    )
      .then((response) => {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.data) && data.data.length > 0) {
          setEventData(data.data);
          try {
            localStorage.setItem("daksha_events_cache_v2", JSON.stringify(data.data));
          } catch (e) {
            void e;
          }
          setIsLoading(false);
        } else {
          throw new Error("Invalid remote data format");
        }
      })
      .catch(() => {
        // Fallback: Bundled events data (works offline and on slow 4G)
        fetch("/eventsData.json")
          .then((res) => res.json())
          .then((fallbackData) => {
            if (Array.isArray(fallbackData) && fallbackData.length > 0) {
              setEventData(fallbackData);
              try {
                localStorage.setItem("daksha_events_cache_v2", JSON.stringify(fallbackData));
              } catch (e) {
                void e;
              }
              setError(null);
            } else {
              setError("Failed to load events. Please check your connection.");
            }
          })
          .catch(() => {
            setError("Failed to load events. Please check your connection.");
          })
          .finally(() => {
            setIsLoading(false);
          });
      });
  }, [eventData.length]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredEvents = Array.isArray(eventData)
    ? eventData.filter((event) => {
        if (!event) return false;

        // Filter chip logic
        if (activeFilter !== "all") {
          const dateStr = String(event.EventDate || "").toLowerCase();
          const catStr = String(event.EventCategory || "").toLowerCase();

          if (activeFilter === "Offstage") {
            const isOffstage =
              catStr === "offstage" ||
              dateStr.includes("offstage") ||
              dateStr.includes("sep 16") ||
              dateStr.includes("sep 17");
            if (!isOffstage) return false;
          } else if (activeFilter === "Day 1") {
            const isDay1 = dateStr.includes("day 1") || dateStr.includes("sep 22");
            if (!isDay1) return false;
          } else if (activeFilter === "Day 2") {
            const isDay2 = dateStr.includes("day 2") || dateStr.includes("sep 23");
            if (!isDay2) return false;
          } else if (activeFilter === "Day 3") {
            const isDay3 = dateStr.includes("day 3") || dateStr.includes("sep 24");
            if (!isDay3) return false;
          }
        }

        // Text search matching
        const term = searchTerm.trim().toLowerCase();
        if (!term) return true;
        const matches = (val) => val != null && String(val).toLowerCase().includes(term);
        return (
          matches(event.EventName) ||
          matches(event.Winner1) ||
          matches(event.Winner2) ||
          matches(event.Winner3) ||
          matches(event.Winner1Year) ||
          matches(event.Winner2Year) ||
          matches(event.Winner3Year) ||
          matches(event.EventDate) ||
          matches(event.EventStage) ||
          matches(event.EventState) ||
          matches(event.EventCategory)
        );
      })
    : [];

  const openRegistrationModal = (event) => {
    setIframeLoading(true);
    setActiveRegEvent(event);
  };

  const closeRegistrationModal = () => {
    setActiveRegEvent(null);
  };

  return (
    <>
      <div className="title--box">
        <h1>Events</h1>
        <input
          type="text"
          className="Search"
          placeholder="Search event, winner, stage…"
          value={searchTerm}
          onChange={handleSearchChange}
          aria-label="Search events"
        />
      </div>

      {/* Filter chips: All, Offstage, Day 1, Day 2, Day 3 */}
      <div className="filter-chips" role="group" aria-label="Filter events by day or type">
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip.key}
            type="button"
            className={"filter-chip" + (activeFilter === chip.key ? " filter-chip--active" : "")}
            onClick={() => setActiveFilter(chip.key)}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" style={{ textAlign: "center", color: "rgba(255,100,100,0.9)", padding: "2rem" }}>
          {error}
        </p>
      )}

      {isLoading && eventData.length === 0 ? (
        <Spinner />
      ) : (
        <div className="event_box">
          {filteredEvents.length === 0 ? (
            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.6)", padding: "3rem 1rem", width: "100%", fontSize: "1rem" }}>
              {searchTerm
                ? "No events found matching \"" + searchTerm + "\""
                : "No events available for this filter."}
            </p>
          ) : (
            filteredEvents.map((row) => (
              <div className="event_card" key={row.EventName}>
                <div className="mele">
                  <span className="eventDate">{row.EventDate}</span>
                  <span className="eventState" data-state={row.EventState}>
                    {row.EventState}
                  </span>
                </div>
                <hr />
                <div className="event-name-row">
                  <span className="eventName">{row.EventName}</span>
                  {row.EventCategory && (
                    <span className={"eventCategory eventCategory--" + (row.EventCategory || "").toLowerCase()}>
                      {row.EventCategory}
                    </span>
                  )}
                </div>

                <span className="eventStage" data-state={row.EventStage}>
                  Stage: {row.EventStage || "Stage TBA"}
                </span>

                {row.EventState === "Result Announced" ? (
                  <span className="eventStartTime">Event Started At {formatDisplayTime(row.EventStart)}</span>
                ) : (
                  <span className="eventStartTime">Event Starts At {formatDisplayTime(row.EventStart)}</span>
                )}

                {/* Winners with year */}
                <span className="FirstWinner Winner" data-state={row.Winner1}>
                  First: {row.Winner1} {row.Winner1Year ? `(${row.Winner1Year})` : ""}
                </span>
                <span className="SecondWinner Winner" data-state={row.Winner2}>
                  Second: {row.Winner2} {row.Winner2Year ? `(${row.Winner2Year})` : ""}
                </span>
                <span className="ThirdWinner Winner" data-state={row.Winner3}>
                  Third: {row.Winner3} {row.Winner3Year ? `(${row.Winner3Year})` : ""}
                </span>

                {/* In-Site Register Button */}
                {row.RegistrationLink ? (
                  <button
                    type="button"
                    onClick={() => openRegistrationModal(row)}
                    className="event-register-btn"
                  >
                    Register
                  </button>
                ) : (
                  <span className="event-register-btn event-register-btn--disabled" aria-disabled="true">
                    Registration Opening Soon
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* In-Site Google Form Registration Modal */}
      {activeRegEvent && (
        <div
          className="reg-modal-overlay"
          onClick={closeRegistrationModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-event-title"
        >
          <div className="reg-modal" onClick={(e) => e.stopPropagation()}>
            <div className="reg-modal__header">
              <div className="reg-modal__info">
                <span className="reg-modal__eyebrow">Daksha &apos;26 Registration</span>
                <h2 id="modal-event-title" className="reg-modal__title">
                  {activeRegEvent.EventName}
                </h2>
                <p className="reg-modal__meta">
                  <span>{activeRegEvent.EventDate}</span>
                  <span>•</span>
                  <span>{activeRegEvent.EventStage || "Stage TBA"}</span>
                </p>
              </div>
              <button
                type="button"
                className="reg-modal__close"
                onClick={closeRegistrationModal}
                aria-label="Close registration modal"
              >
                ✕
              </button>
            </div>

            <div className="reg-modal__body">
              {iframeLoading && (
                <div className="reg-modal__loading">
                  <Spinner />
                  <p>Loading registration form…</p>
                </div>
              )}
              <iframe
                src={getEmbeddedFormUrl(activeRegEvent.RegistrationLink)}
                title={`Register for ${activeRegEvent.EventName}`}
                className="reg-modal__iframe"
                onLoad={() => setIframeLoading(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Events;
