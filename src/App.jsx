import React, { useState } from "react";

export default function App() {
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [callTime, setCallTime] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState("");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>CIF Call Sheet Builder</h1>

      <h2>Project Info</h2>
      <input
        placeholder="Project Name"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
      />
      <br />

      <input
        placeholder="Client Name"
        value={clientName}
        onChange={(e) => setClientName(e.target.value)}
      />
      <br />

      <input
        placeholder="Call Time"
        value={callTime}
        onChange={(e) => setCallTime(e.target.value)}
      />
      <br />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <br />

      <input
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <br />

      <input
        placeholder="Weather"
        value={weather}
        onChange={(e) => setWeather(e.target.value)}
      />

      <hr />

      <h2>Preview</h2>

      <div style={{ border: "1px solid black", padding: 20 }}>
        <h1>{projectName || "Project Name"}</h1>
        <p>{clientName}</p>
        <p><b>Call Time:</b> {callTime}</p>
        <p><b>Date:</b> {date}</p>
        <p><b>Location:</b> {location}</p>
        <p><b>Weather:</b> {weather}</p>
      </div>

      <br />

      <button onClick={handlePrint}>
        Print / Save as PDF
      </button>
    </div>
  );
}
