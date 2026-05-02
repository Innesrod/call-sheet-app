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
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>CIF Call Sheet Builder</h1>

      <h2>Project Info</h2>

      <div style={{ display: "grid", gap: 10, maxWidth: 400 }}>
        <input
          placeholder="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />

        <input
          placeholder="Client Name"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
        />

        <input
          placeholder="Call Time"
          value={callTime}
          onChange={(e) => setCallTime(e.target.value)}
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <input
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <input
          placeholder="Weather"
          value={weather}
          onChange={(e) => setWeather(e.target.value)}
        />
      </div>

      <hr style={{ margin: "20px 0" }} />

      <h2>Call Sheet Preview</h2>

      <div
        style={{
          border: "2px solid black",
          padding: 20,
          maxWidth: 600,
          background: "#fff"
        }}
      >
        <h1>{projectName || "Project Name"}</h1>
        <p>{clientName || "Client Name"}</p>

        <p><b>Call Time:</b> {callTime || "TBD"}</p>
        <p><b>Date:</b> {date || "TBD"}</p>
        <p><b>Location:</b> {location || "TBD"}</p>
        <p><b>Weather:</b> {weather || "TBD"}</p>
      </div>

      <br />

      <button
        onClick={handlePrint}
        style={{
          padding: "10px 20px",
          background: "black",
          color: "white",
          border: "none",
          cursor: "pointer"
        }}
      >
        Print / Save as PDF
      </button>
    </div>
  );
}
