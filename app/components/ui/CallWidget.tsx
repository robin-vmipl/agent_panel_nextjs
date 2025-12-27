"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Phone, PhoneOff, MicOff, Mic, Pause, Play } from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";

export default function CallWidget() {
  const { sipConfig, user, isAuthenticated } = useAuth();

  const [open, setOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [isInCall, setIsInCall] = useState(false); // ✅ NEW: Call state
  const [callDuration, setCallDuration] = useState("00:00");

  const durationRef = useRef<number>(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const sipNumberInputRef = useRef<HTMLInputElement | null>(null);
  const sipCallBtnRef = useRef<HTMLButtonElement | null>(null);
  const sipHangupBtnRef = useRef<HTMLButtonElement | null>(null);

  // ✅ SIP Config for demo-*.js
  useEffect(() => {
    if (sipConfig.username && sipConfig.password && isAuthenticated) {
      (window as any).SIP_USERNAME = sipConfig.username;
      (window as any).SIP_PASSWORD = sipConfig.username;
      (window as any).WEBSOCKET_HOST = "vconrtc.smartping.io";
      (window as any).WEBSOCKET_PORT = 8080;
      (window as any).SIP_PORT = 8443;
      console.log("✅ SIP Config loaded:", sipConfig.username);
    }
  }, [sipConfig.username, sipConfig.password, isAuthenticated]);

  // ✅ SIP Elements + Call State Detection
  useEffect(() => {
    const sipPanel = document.getElementById("sipPanel");
    if (sipPanel) {
      sipNumberInputRef.current = sipPanel.querySelector(
        "#numberToCall"
      ) as HTMLInputElement | null;
      sipCallBtnRef.current = sipPanel.querySelector(
        "#call button"
      ) as HTMLButtonElement | null;
      sipHangupBtnRef.current = sipPanel.querySelector(
        "#hangup button"
      ) as HTMLButtonElement | null;
    }

    // ✅ SIP CALL STATE LISTENERS (demo-*.js events)
    const checkCallState = setInterval(() => {
      const callDetail = document.getElementById("callpick-detail");
      const hangupDiv = document.getElementById("hangup_div");

      // ✅ DETECT INCOMING/ACTIVE CALL
      if (callDetail && !callDetail.hasAttribute("hidden")) {
        setIsInCall(true);
      } else if (hangupDiv && !hangupDiv.classList.contains("d-none")) {
        setIsInCall(true);
      } else {
        setIsInCall(false);
      }
    }, 1000);

    return () => clearInterval(checkCallState);
  }, []);

  // ✅ CALL DURATION - STARTS on call, STOPS on hangup
  useEffect(() => {
    if (isInCall) {
      // ✅ START TIMER when call active
      durationIntervalRef.current = setInterval(() => {
        durationRef.current += 1;
        const minutes = Math.floor(durationRef.current / 60)
          .toString()
          .padStart(2, "0");
        const seconds = (durationRef.current % 60).toString().padStart(2, "0");
        setCallDuration(`${minutes}:${seconds}`);
      }, 1000);
    } else {
      // ✅ STOP + RESET on hangup
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      durationRef.current = 0;
      setCallDuration("00:00");
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [isInCall]);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
    const muteCheckbox = document.querySelector(
      "#mute"
    ) as HTMLInputElement | null;
    if (muteCheckbox) muteCheckbox.checked = !isMuted;
  }, [isMuted]);

  const toggleHold = useCallback(() => {
    setIsOnHold(!isOnHold);
    const holdCheckbox = document.querySelector(
      "#hold"
    ) as HTMLInputElement | null;
    if (holdCheckbox) holdCheckbox.checked = !isOnHold;
  }, [isOnHold]);

  const handleHangup = useCallback(() => {
    sipHangupBtnRef.current?.click();
    setIsMuted(false);
    setIsOnHold(false);
    // ✅ Timer auto-stops via isInCall state
  }, []);

  const handleAnswer = useCallback(() => {
    sipCallBtnRef.current?.click();
  }, []);

  return (
    <>
      {/* ✅ HIDDEN SIP CONTROL BUTTONS */}
      <button id="connect" style={{ display: "none" }} />
      <button id="disconnect" style={{ display: "none" }} />

      {/* Floating Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-xl shadow-xl flex items-center justify-center transition-all duration-300 backdrop-blur-sm border-3 bg-linear-to-r from-emerald-500 to-emerald-600 border-emerald-400 shadow-emerald-500/50 hover:shadow-emerald-500/75 hover:scale-105"
        title="Web Phone"
      >
        {open ? (
          <PhoneOff className="w-6 h-6 text-white drop-shadow-md" />
        ) : (
          <Phone className="w-6 h-6 text-white drop-shadow-md" />
        )}
      </button>

      {/* SIP Panel */}
      <div
        id="sipPanel"
        className={`fixed bottom-20 right-4 z-50 w-80 max-h-[65vh] bg-linear-to-b from-slate-900/95 to-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 transition-all duration-500 p-4 overflow-hidden ${
          open
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8 pointer-events-none"
        }`}
      >
        {/* HIDDEN SIP ELEMENTS */}
        <div style={{ display: "none" }}>
          <button className="chatbot-button" id="chatbotButton" />
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
                                <button className="keypad not-visible">
                                  +
                                </button>
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
                            >
                              <h4>Incoming call</h4>
                              <h2 id="custNumBig" />
                              <h5>
                                Mobile <span id="custNumSmall" />
                              </h5>
                              <h3 className="callDuration mt-4" />
                            </div>
                            <div className="webrtc-callpick">
                              <div
                                className="call reject d-none"
                                id="hangup_div"
                              >
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
                            <audio
                              src="/sip/sample.mp3"
                              className="show"
                              id="remoteAudio"
                              controls
                            />
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

        {/* CLEAN UI */}
        <div className="space-y-3 h-full flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-700/50">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-linear-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Web Phone
                </h3>
                {/* ✅ StatusDropdown CONTROLS this */}
                <p id="sipStatus" className="text-xs text-red-400">
                  Disconnected
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 hover:bg-slate-800/50 rounded-lg transition-all hover:scale-105"
            >
              <svg
                className="w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* ✅ CALL DURATION - ONLY when isInCall = true */}
          <div className="flex-1 flex flex-col justify-center items-center space-y-2">
            {isInCall && callDuration !== "00:00" && (
              <div className="flex items-center space-x-1 text-emerald-400">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs font-mono">Call: {callDuration}</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="space-y-2">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={toggleMute}
                disabled={!isInCall}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm shadow-lg transition-all hover:scale-105 ${
                  isMuted
                    ? "bg-linear-to-r from-red-500 to-red-600 text-white shadow-red-500/50"
                    : "bg-slate-700/50 border-2 border-slate-600/50 text-slate-300 hover:border-emerald-400 hover:text-emerald-400 hover:shadow-emerald-500/25"
                } ${!isInCall ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isMuted ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
                {isMuted ? "Unmute" : "Mute"}
              </button>
              <button
                type="button"
                onClick={toggleHold}
                disabled={!isInCall}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm shadow-lg transition-all hover:scale-105 ${
                  isOnHold
                    ? "bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/50"
                    : "bg-slate-700/50 border-2 border-slate-600/50 text-slate-300 hover:border-amber-400 hover:text-amber-400 hover:shadow-amber-500/25"
                } ${!isInCall ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isOnHold ? (
                  <Play className="w-4 h-4" />
                ) : (
                  <Pause className="w-4 h-4" />
                )}
                {isOnHold ? "Resume" : "Hold"}
              </button>
            </div>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleAnswer}
                disabled={!isInCall}
                className="flex-1 bg-linear-to-r from-emerald-500 to-teal-600 text-white font-bold py-4 px-4 rounded-xl shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Phone className="w-5 h-5" />
                Answer
              </button>
              <button
                type="button"
                onClick={handleHangup}
                disabled={!isInCall}
                className="flex-1 bg-linear-to-r from-red-500 to-red-600 text-white font-bold py-4 px-3 rounded-xl shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PhoneOff className="w-5 h-5" />
                Hangup
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
