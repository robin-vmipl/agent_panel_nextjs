"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Phone, PhoneOff, MicOff, Mic, Pause, Play, Wifi } from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";

export default function CallWidget() {
  const { sipConfig, user, isAuthenticated } = useAuth();

  const [open, setOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [incomingNumber, setIncomingNumber] = useState("");
  const [callDuration, setCallDuration] = useState("00:00:00");
  const [isInCall, setIsInCall] = useState(false);
  const [sipStatus, setSipStatus] = useState("Disconnected");

  const durationRef = useRef(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const callStateCheckRef = useRef<NodeJS.Timeout | null>(null);

  // 🔥 GLOBAL SIP.js EVENT LISTENERS
  useEffect(() => {
    const handleCallReceived = () => {
      console.log("🔥 CALLWIDGET: onCallReceived - RINGING");
      setIsInCall(true);
      setIsAnswered(false);
      setOpen(true);
    };

    const handleCallAnswered = () => {
      console.log("🔥 CALLWIDGET: onCallAnswered - ANSWERED");
      setIsAnswered(true);
      setIsInCall(true);
      setOpen(true);
    };

    const handleCallHangup = () => {
      console.log("🔥 CALLWIDGET: onCallHangup - ENDED");
      resetCall();
    };

    (window as any).onCallReceived = handleCallReceived;
    (window as any).onCallAnswered = handleCallAnswered;
    (window as any).onCallHangup = handleCallHangup;

    return () => {
      delete (window as any).onCallReceived;
      delete (window as any).onCallAnswered;
      delete (window as any).onCallHangup;
    };
  }, []);

  // DURATION TIMER
  useEffect(() => {
    if (isInCall && !durationIntervalRef.current) {
      durationIntervalRef.current = setInterval(() => {
        durationRef.current += 1;
        const hours = Math.floor(durationRef.current / 3600)
          .toString()
          .padStart(2, "0");
        const minutes = Math.floor((durationRef.current % 3600) / 60)
          .toString()
          .padStart(2, "0");
        const seconds = (durationRef.current % 60).toString().padStart(2, "0");
        setCallDuration(`${hours}:${minutes}:${seconds}`);
      }, 1000);
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    };
  }, [isInCall]);

  // SIP Config
  useEffect(() => {
    if (sipConfig.username && sipConfig.password && isAuthenticated) {
      (window as any).SIP_USERNAME = sipConfig.username;
      (window as any).SIP_PASSWORD = sipConfig.username;
      (window as any).WEBSOCKET_HOST = "vconrtc.smartping.io";
      (window as any).WEBSOCKET_PORT = 8080;
      (window as any).SIP_PORT = 8443;
    }
  }, [sipConfig.username, sipConfig.password, isAuthenticated]);

  // STATUS CHECKER (FALLBACK + MUTE/HOLD SYNC)
  useEffect(() => {
    const checkStatus = () => {
      const muteCheckbox = document.querySelector("#mute") as HTMLInputElement;
      const holdCheckbox = document.querySelector("#hold") as HTMLInputElement;
      const connectBtn = document.getElementById(
        "connect"
      ) as HTMLButtonElement;

      if (muteCheckbox) setIsMuted(muteCheckbox.checked);
      if (holdCheckbox) setIsOnHold(holdCheckbox.checked);

      if (connectBtn?.textContent?.includes("Connected")) {
        setSipStatus("Connected");
      } else {
        setSipStatus("Disconnected");
      }

      // FALLBACK: Incoming number detection
      const incomingNumberEl = document.getElementById(
        "incoming-number"
      ) as HTMLElement;
      if (incomingNumberEl?.textContent?.includes("Incoming call from")) {
        const number =
          incomingNumberEl.textContent.replace("Incoming call from ", "") ||
          "Unknown";
        setIncomingNumber(number);
      }
    };

    callStateCheckRef.current = setInterval(checkStatus, 200);
    return () => {
      if (callStateCheckRef.current) {
        clearInterval(callStateCheckRef.current);
      }
    };
  }, []);

  const resetTimer = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    durationRef.current = 0;
    setCallDuration("00:00:00");
  };

  const resetCall = () => {
    setIsInCall(false);
    setIsAnswered(false);
    setOpen(false);
    setIncomingNumber("");
    setIsMuted(false);
    setIsOnHold(false);
    resetTimer();
  };

  const handleAnswer = useCallback(() => {
    console.log("✅ Manual Answer clicked");

    // 🔥 CHECK IF ALREADY ANSWERING OR ANSWERED
    const callDiv = document.querySelector("#call") as HTMLDivElement;
    const callButton = callDiv?.querySelector("button") as HTMLButtonElement;

    if (
      callButton &&
      !callButton.disabled &&
      callButton.textContent?.includes("Answer")
    ) {
      console.log("✅ SIP Answer button found and clickable");
      callButton.click();
    } else {
      console.log("❌ SIP Answer button not available or disabled");
    }
  }, []);

  const handleHangup = useCallback(() => {
    const hangupButton = document.getElementById("hangup") as HTMLButtonElement;
    if (hangupButton) hangupButton.click();
  }, []);

  const toggleMute = useCallback(() => {
    const muteCheckbox = document.querySelector("#mute") as HTMLInputElement;
    if (muteCheckbox) muteCheckbox.click();
  }, []);

  const toggleHold = useCallback(() => {
    const holdCheckbox = document.querySelector("#hold") as HTMLInputElement;
    if (holdCheckbox) holdCheckbox.click();
  }, []);

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  return (
    <>
      {/* SIP ELEMENTS */}
      <button id="connect" style={{ display: "none" }} />
      <button id="disconnect" style={{ display: "none" }} />
      <button
        className="chatbot-button"
        id="chatbotButton"
        style={{ display: "none" }}
      />

      {/* SIP PANEL */}
      <div id="sipPanel" style={{ display: "none" }}>
        <div id="tabContent" className="tabContent">
          <div className="row">
            <div className="col-sm-12">
              <div className="smartphone">
                <div className="content">
                  <div className="mobile-wrapper">
                    <div className="phone">
                      <div className="phone-container">
                        <div className="webrtc-container">
                          <button
                            id="sipLogoutBtn"
                            className="btn btn-primary"
                          />
                          <div className="webrtc-connection" />
                          <div id="output">
                            <div id="incoming-number" />
                            <input type="text" id="numberToCall" />
                          </div>
                          <div className="webrtc-rows">
                            {[
                              "1",
                              "2",
                              "3",
                              "4",
                              "5",
                              "6",
                              "7",
                              "8",
                              "9",
                              "*",
                              "0",
                              "#",
                            ].map((d) => (
                              <div
                                key={d}
                                className="digit box"
                                id={`digit-${d}`}
                              >
                                <button className="keypad">{d}</button>
                                <div className="sub" />
                              </div>
                            ))}
                          </div>
                          <div className="webrtc-rows">
                            <div className="digit box hold1">
                              <input
                                type="checkbox"
                                className="not-visible"
                                id="hold1"
                              />
                              <i className="fa fa-pause" />
                            </div>
                            <div className="digit box plus">
                              <button className="keypad not-visible">+</button>
                            </div>
                            <div className="digit box mute">
                              <input
                                type="checkbox"
                                className="not-visible"
                                id="mute"
                              />
                              <i className="fa fa-microphone" />
                            </div>
                            <i className="fa fa-long-arrow-left box backspace" />
                          </div>
                          <div
                            id="callpick-detail"
                            className="callpick-detail text-center mt-4"
                            hidden
                          >
                            <h4>Incoming call</h4>
                            <h2 id="custNumBig" />
                            <h5>
                              Mobile <span id="custNumSmall" />
                            </h5>
                            <h3 className="callDuration mt-4" />
                          </div>
                          <div className="webrtc-callpick">
                            <div className="call reject d-none" id="hangup_div">
                              <button id="hangup">
                                <i className="fa fa-phone" /> Hangup
                              </button>
                            </div>
                            <div className="call answer" id="call">
                              <button>
                                <i className="fa fa-phone" /> Answer
                              </button>
                            </div>
                          </div>
                          <div id="webrtc-rows" className="webrtc-rows">
                            <div className="digit box hold">
                              <input
                                type="checkbox"
                                className="not-visible"
                                id="hold"
                              />
                              <i id="pauseIcon" className="fa fa-pause" />
                            </div>
                          </div>
                          <audio src="/sip/sample.mp3" id="remoteAudio" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TOGGLE BUTTON */}
      <button
        onClick={handleToggle}
        className={`fixed bottom-6 right-6 z-99999 rounded-full shadow-2xl border-4 border-white/30 text-white flex items-center justify-center transition-all duration-200 cursor-pointer ${
          isInCall
            ? "w-16 h-16 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/50 hover:shadow-emerald-500/70 hover:scale-110 active:scale-95"
            : "w-12 h-12 bg-slate-600/80 hover:bg-slate-500/90 hover:scale-105 active:scale-95"
        }`}
        title={
          isInCall ? (open ? "Hide WebPhone" : "Show WebPhone") : "WebPhone"
        }
      >
        <Phone
          className={`drop-shadow-lg ${isInCall ? "w-8 h-8" : "w-6 h-6"}`}
        />
      </button>

      {/* WEBPHONE WIDGET */}
      {isInCall && (
        <div
          className={`fixed bottom-24 right-6 z-100000 w-87.5 h-112.5 bg-linear-to-b from-slate-900 to-slate-800 backdrop-blur-xl shadow-3xl border border-emerald-400/50 rounded-2xl overflow-hidden transition-all duration-300 ${
            open
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-8 scale-95 pointer-events-none"
          }`}
        >
          {/* Header */}
          <div className="p-3 bg-slate-800/90 border-b border-emerald-500/50 flex items-center justify-between h-14">
            <div
              className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                sipStatus === "Connected"
                  ? "bg-emerald-500/90 text-white"
                  : "bg-slate-600/80 text-slate-300"
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              {sipStatus}
            </div>
            <div className="w-9 h-9 bg-gray-400 rounded-lg flex items-center justify-center">
              <Phone className="w-4.5 h-4.5 text-white" />
            </div>
          </div>

          {/* Call Info */}
          <div className="p-4 flex flex-col justify-center items-center text-center space-y-3 h-52.5">
            <h2
              className={`text-lg font-bold ${
                isAnswered ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {isAnswered ? "IN CALL" : "INCOMING CALL"}
            </h2>
            <div className="text-xl font-mono font-bold text-white bg-slate-800/80 px-5 py-2.5 rounded-xl border border-slate-600">
              {incomingNumber || "Unknown"}
            </div>
            <div
              className={`text-xl font-mono font-bold px-6 py-2.5 rounded-xl shadow-xl ${
                isAnswered
                  ? "text-emerald-400 bg-slate-900/90 border-2 border-emerald-500/50 animate-pulse"
                  : "text-amber-400 bg-amber-900/80 border-2 border-amber-500/50 animate-pulse"
              }`}
            >
              {callDuration}
            </div>
          </div>

          {/* 🔥 PERFECT CONTROLS - FIXED HOVER + MANUAL ANSWER */}
          <div className="p-4 bg-slate-900/90 border-t border-slate-700 h-42.5 grid grid-cols-2 grid-rows-2 gap-3">
            {/* MUTE */}
            <button
              onClick={toggleMute}
              disabled={!isAnswered}
              className={`group h-full flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-lg font-bold text-xs shadow-lg transition-all duration-200 ${
                !isAnswered
                  ? "opacity-40 bg-slate-700/60 cursor-not-allowed shadow-none ring-1 ring-slate-500/30 hover:scale-100"
                  : isMuted
                  ? "bg-red-600/90 text-white shadow-red-500/60 ring-1 ring-red-400/50 hover:scale-105 active:scale-95 cursor-pointer"
                  : "bg-slate-700 hover:bg-slate-600 text-white hover:shadow-emerald-400/50 hover:scale-105 active:scale-95 cursor-pointer"
              }`}
              title={
                !isAnswered ? "Wait for answer..." : isMuted ? "UNMUTE" : "MUTE"
              }
            >
              {/* ICON + TEXT SAME AS BEFORE */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-md transition-all shrink-0 ${
                  !isAnswered
                    ? "bg-slate-600/50 opacity-60"
                    : isMuted
                    ? "bg-red-500/80 ring-1 ring-red-400/60"
                    : "bg-slate-600/80 hover:bg-emerald-500/30"
                }`}
              >
                {isMuted ? (
                  <MicOff className="w-4.5 h-4.5 drop-shadow-lg" />
                ) : (
                  <Mic className="w-4.5 h-4.5" />
                )}
              </div>
              <span className="uppercase tracking-wider text-xs leading-tight">
                {isMuted ? "UNMUTE" : "MUTE"}
              </span>
            </button>

            {/* HOLD */}
            <button
              onClick={toggleHold}
              disabled={!isAnswered}
              className={`group h-full flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-lg font-bold text-xs shadow-lg transition-all duration-200 ${
                !isAnswered
                  ? "opacity-40 bg-slate-700/60 cursor-not-allowed shadow-none ring-1 ring-slate-500/30 hover:scale-100"
                  : isOnHold
                  ? "bg-amber-600/90 text-white shadow-amber-500/60 ring-1 ring-amber-400/50 hover:scale-105 active:scale-95 cursor-pointer"
                  : "bg-slate-700 hover:bg-slate-600 text-white hover:shadow-amber-400/50 hover:scale-105 active:scale-95 cursor-pointer"
              }`}
              title={
                !isAnswered
                  ? "Wait for answer..."
                  : isOnHold
                  ? "RESUME"
                  : "HOLD"
              }
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-md transition-all shrink-0 ${
                  !isAnswered
                    ? "bg-slate-600/50 opacity-60"
                    : isOnHold
                    ? "bg-amber-500/80 ring-1 ring-amber-400/60"
                    : "bg-slate-600/80 hover:bg-amber-500/30"
                }`}
              >
                {isOnHold ? (
                  <Play className="w-4.5 h-4.5 drop-shadow-lg" />
                ) : (
                  <Pause className="w-4.5 h-4.5" />
                )}
              </div>
              <span className="uppercase tracking-wider text-xs leading-tight">
                {isOnHold ? "RESUME" : "HOLD"}
              </span>
            </button>

            {/* ANSWER - FIXED MANUAL ANSWER */}
            <button
              onClick={handleAnswer}
              disabled={isAnswered}
              className={`group h-full flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-lg font-bold text-xs shadow-lg transition-all duration-200 ${
                isAnswered
                  ? "bg-emerald-600/60 text-emerald-100 shadow-emerald-500/40 ring-1 ring-emerald-400/40 cursor-not-allowed opacity-70 pointer-events-none"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/50 hover:scale-105 active:scale-95 cursor-pointer"
              }`}
              title={isAnswered ? "Call Answered" : "Answer Call (Manual)"}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-md transition-all shrink-0 ${
                  isAnswered
                    ? "bg-emerald-500/60 border-2 border-emerald-400/50"
                    : "bg-emerald-500/80 border-2 border-emerald-400/60 hover:scale-110"
                }`}
              >
                <Phone
                  className={`w-4.5 h-4.5 transition-opacity ${
                    isAnswered ? "opacity-70" : ""
                  }`}
                />
              </div>
              <span
                className={`uppercase tracking-wider text-xs font-semibold ${
                  isAnswered ? "opacity-70" : ""
                }`}
              >
                {isAnswered ? "ANSWERED" : "ANSWER"}
              </span>
            </button>

            {/* HANGUP */}
            <button
              onClick={handleHangup}
              disabled={!isAnswered}
              className={`group h-full flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-lg font-black text-xs shadow-2xl transition-all duration-200 ring-2 ring-red-400/60 hover:scale-105 active:scale-95 ${
                !isAnswered
                  ? "opacity-40 bg-slate-700/60 cursor-not-allowed shadow-none text-slate-300 hover:scale-100"
                  : "bg-linear-to-br from-red-600 to-red-800 text-white shadow-red-500/70 hover:shadow-red-600/80 hover:from-red-700 hover:to-red-900 cursor-pointer"
              }`}
              title={!isAnswered ? "Wait for answer..." : "Hangup Call"}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-2xl transition-all shrink-0 group-hover:scale-110 ${
                  !isAnswered
                    ? "bg-slate-600/50 opacity-60 border-2 border-slate-500/40"
                    : "bg-linear-to-br from-red-500/90 to-red-600/90 border-2 border-red-400/70 shadow-red-500/60"
                }`}
              >
                <PhoneOff className="w-4.5 h-4.5 drop-shadow-lg" />
              </div>
              <span className="uppercase tracking-widest text-xs leading-tight drop-shadow-sm">
                HANGUP
              </span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
