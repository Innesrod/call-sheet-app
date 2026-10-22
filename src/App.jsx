import React, { useState } from "react";
import html2pdf from "html2pdf.js";

const CREW_LIBRARY_KEY = "cif-call-sheet-crew-library-v1";
const LAST_PROJECT_KEY = "cif-call-sheet-last-project-v1";

function createDay(number) {
  return {
    id: Date.now() + Math.random(),
    label: `Day ${number}`,
    date: "",
    callTime: "8:30 AM",
    lunch: "",
    wrap: "",
    weatherLocation: "",
    weatherTemp: "",
    weatherConditions: "",
    sunTimes: "",
    schedule: [
      { time: "8:30 AM", activity: "Crew Call / Load In", location: "", notes: "" },
      { time: "11:00 AM", activity: "Room Ready", location: "", notes: "" },
    ],
  };
}

const createCrewMember = () => ({
  id: Date.now() + Math.random(),
  name: "",
  role: "",
  callTime: "",
  phone: "",
  responsibility: "",
});

const createClient = () => ({
  id: Date.now() + Math.random(),
  name: "",
  role: "",
  callTime: "",
  contact: "",
  notes: "",
});

const createLocation = () => ({
  id: Date.now() + Math.random(),
  name: "",
  address: "",
  parking: "",
  loadIn: "",
  notes: "",
});

const createAttachment = () => ({
  id: Date.now() + Math.random(),
  name: "",
  url: "",
  notes: "",
});

const getMapLink = (address) =>
  address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : "";

function loadCrewLibrary() {
  try {
    const saved = localStorage.getItem(CREW_LIBRARY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveCrewLibrary(library) {
  localStorage.setItem(CREW_LIBRARY_KEY, JSON.stringify(library));
}

function formatDate(value) {
  if (!value) return "Shoot Date TBD";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Shoot Date TBD";
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function createBlankProject() {
  return {
    projectName: "",
    clientName: "",
    logo: "",
    shootDays: [createDay(1)],
    crew: [{ ...createCrewMember(), role: "DP / Producer", callTime: "8:30 AM" }],
    clients: [{ ...createClient(), role: "Client Contact", callTime: "No Call" }],
    locations: [{ ...createLocation(), name: "Main Location" }],
