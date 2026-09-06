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

function getEventDetails(row) {
  if (!row) return {};
  const regStatus = String(row.RegistrationStatus || row.RegistrationLink || "").trim();
  const isOpen = regStatus.toLowerCase() === "open";

  // Check if columns are shifted due to legacy Google Apps Script (where Winner1 contains "Solo" or "Group")
  const w1Str = String(row.Winner1 || "").trim().toLowerCase();
  const isShifted = w1Str === "solo" || w1Str === "group";

  const winner1 = isShifted ? (row.Winner1Year || "") : (row.Winner1 || "");
  const winner1Year = isShifted ? (row.Winner2 || "") : (row.Winner1Year || "");
  const winner2 = isShifted ? (row.Winner2Year || "") : (row.Winner2 || "");
  const winner2Year = isShifted ? (row.Winner3 || "") : (row.Winner2Year || "");
  const winner3 = isShifted ? (row.Winner3Year || "") : (row.Winner3 || "");
  const winner3Year = isShifted ? "" : (row.Winner3Year || "");

  return {
    regStatus,
    isOpen,
    winner1,
    winner1Year,
    winner2,
    winner2Year,
    winner3,
    winner3Year,
  };
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

  // Custom Form States
  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    Phone: "",
    Department: "",
    Year: "",
    RegNo: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && activeRegEvent) {
        closeRegistrationModal();
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
    setActiveRegEvent(event);
    setSubmitSuccess(false);
    setSubmitError(null);
    setFormData({ Name: "", Email: "", Phone: "", Department: "", Year: "", RegNo: "" });
  };

  const closeRegistrationModal = () => {
    setActiveRegEvent(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Replace with your Web App URL later if it changes
      const webAppUrl = "https://script.google.com/macros/s/AKfycbyNYEXJ3_ZE0THqDdskKYnDE3PzSgzES2hBrV9ILEmYyvuiBpZHuivXQZwhiSgHONgx/exec";
      
      const payload = {
        ...formData,
        EventName: activeRegEvent.EventName
      };

      const response = await fetch(webAppUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      if (result.result === "success") {
        setSubmitSuccess(true);
        setFormData({ Name: "", Email: "", Phone: "", Department: "", Year: "", RegNo: "" });
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (err) {
      setSubmitError("Failed to submit registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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

                {/* Winners with year & Register button */}
                {(() => {
                  const details = getEventDetails(row);
                  return (
                    <>
                      <span className="FirstWinner Winner" data-state={details.winner1}>
                        First: {details.winner1} {details.winner1Year ? `(${details.winner1Year})` : ""}
                      </span>
                      <span className="SecondWinner Winner" data-state={details.winner2}>
                        Second: {details.winner2} {details.winner2Year ? `(${details.winner2Year})` : ""}
                      </span>
                      <span className="ThirdWinner Winner" data-state={details.winner3}>
                        Third: {details.winner3} {details.winner3Year ? `(${details.winner3Year})` : ""}
                      </span>

                      {/* In-Site Register Button */}
                      {details.isOpen ? (
                        <button
                          type="button"
                          onClick={() => openRegistrationModal(row)}
                          className="event-register-btn"
                        >
                          Register
                        </button>
                      ) : (
                        <span className="event-register-btn event-register-btn--disabled" aria-disabled="true" style={{textTransform: 'capitalize'}}>
                          {details.regStatus || "Registration Opening Soon"}
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
            ))
          )}
        </div>
      )}

      {/* In-Site Custom Registration Modal */}
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

            <div className="reg-modal__body reg-modal__body--custom">
              {submitSuccess ? (
                <div className="reg-success-message">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width: '64px', height: '64px', stroke: '#4caf50', margin: '0 auto 1rem', display: 'block'}}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <h3 style={{color: 'white', marginBottom: '0.5rem', fontSize: '1.5rem', textAlign: 'center'}}>Registration Successful!</h3>
                  <p style={{color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem', textAlign: 'center'}}>You have successfully registered for {activeRegEvent.EventName}.</p>
                  <button type="button" onClick={closeRegistrationModal} className="reg-submit-btn" style={{marginTop: '1rem'}}>Close</button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="custom-reg-form">
                  {submitError && <div className="reg-error-message">{submitError}</div>}
                  
                  <div className="form-group">
                    <label htmlFor="Name">Full Name</label>
                    <input type="text" id="Name" name="Name" value={formData.Name} onChange={handleInputChange} required placeholder="e.g. John Doe" />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="Email">Email Address</label>
                    <input type="email" id="Email" name="Email" value={formData.Email} onChange={handleInputChange} required placeholder="e.g. john@example.com" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="Phone">Phone Number</label>
                    <input type="tel" id="Phone" name="Phone" value={formData.Phone} onChange={handleInputChange} required placeholder="e.g. 9876543210" />
                  </div>

                  <div className="form-group-row" style={{display: 'flex', gap: '1rem'}}>
                    <div className="form-group" style={{flex: 1}}>
                      <label htmlFor="Department">Department</label>
                      <select id="Department" name="Department" value={formData.Department} onChange={handleInputChange} required>
                        <option value="" disabled>Select dept</option>
                        <option value="CE">CE</option>
                        <option value="CSE">CSE</option>
                        <option value="ECE">ECE</option>
                        <option value="EEE">EEE</option>
                        <option value="IT">IT</option>
                        <option value="MECH">MECH</option>
                      </select>
                    </div>

                    <div className="form-group" style={{flex: 1}}>
                      <label htmlFor="Year">Year of Study</label>
                      <select id="Year" name="Year" value={formData.Year} onChange={handleInputChange} required>
                        <option value="" disabled>Select year</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="MTech 1st Year">MTech 1st Year</option>
                        <option value="MTech 2nd Year">MTech 2nd Year</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="RegNo">University Reg No (Optional)</label>
                    <input type="text" id="RegNo" name="RegNo" value={formData.RegNo} onChange={handleInputChange} placeholder="e.g. PKD20CS001" />
                  </div>

                  <button type="submit" className="reg-submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Complete Registration"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Events;
