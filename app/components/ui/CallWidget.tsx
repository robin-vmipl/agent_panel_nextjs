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
  const [callDuration, setCallDuration] = useState("00:00");
  const [isInCall, setIsInCall] = useState(false);
  const [sipStatus, setSipStatus] = useState("Disconnected");

  const durationRef = useRef(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const callStateCheckRef = useRef<NodeJS.Timeout | null>(null);

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

  // State monitoring
  useEffect(() => {
    const checkCallState = () => {
      const incomingNumberEl = document.getElementById(
        "incoming-number"
      ) as HTMLElement;
      const callDetail = document.getElementById("callpick-detail");
      const hangupDiv = document.getElementById("hangup_div");
      const connectBtn = document.getElementById(
        "connect"
      ) as HTMLButtonElement;

      if (connectBtn?.textContent?.includes("Connected")) {
        setSipStatus("Connected");
      } else {
        setSipStatus("Disconnected");
      }

      const muteCheckbox = document.querySelector("#mute") as HTMLInputElement;
      if (muteCheckbox) setIsMuted(muteCheckbox.checked);

      const holdCheckbox = document.querySelector("#hold") as HTMLInputElement;
      if (holdCheckbox) setIsOnHold(holdCheckbox.checked);

      if (incomingNumberEl?.textContent?.includes("Incoming call from")) {
        const number =
          incomingNumberEl.textContent.replace("Incoming call from ", "") ||
          "Unknown";
        setIncomingNumber(number);
        setIsInCall(true);
        setIsAnswered(false);
        setOpen(true);
        return;
      }

      if (
        callDetail &&
        !callDetail.hasAttribute("hidden") &&
        hangupDiv &&
        !hangupDiv.classList.contains("d-none")
      ) {
        setIsAnswered(true);
        setIsInCall(true);
        setOpen(true);
        return;
      }

      if (
        hangupDiv?.classList.contains("d-none") &&
        callDetail?.hasAttribute("hidden") &&
        !incomingNumberEl?.textContent?.includes("Incoming call from")
      ) {
        resetCall();
      }
    };

    callStateCheckRef.current = setInterval(checkCallState, 150);
    return () => {
      if (callStateCheckRef.current) clearInterval(callStateCheckRef.current);
    };
  }, []);

  // 🔥 FIXED TIMER - Independent persistent timer
  useEffect(() => {
    if (isAnswered && !durationIntervalRef.current) {
      durationRef.current = 0;
      setCallDuration("00:00");

      durationIntervalRef.current = setInterval(() => {
        durationRef.current += 1;
        const minutes = Math.floor(durationRef.current / 60)
          .toString()
          .padStart(2, "0");
        const seconds = (durationRef.current % 60).toString().padStart(2, "0");
        setCallDuration(`${minutes}:${seconds}`);
        console.log("⏱️ Timer:", callDuration); // Debug log
      }, 1000);
    }

    return () => {
      if (!isAnswered && durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    };
  }, [isAnswered]);

  const resetTimer = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    durationRef.current = 0;
    setCallDuration("00:00");
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
    const answerBtn = document.querySelector(
      "#call button"
    ) as HTMLButtonElement;
    if (answerBtn && !isAnswered) {
      answerBtn.click();
      console.log("✅ ANSWER clicked");
    }
  }, [isAnswered]);

  const handleHangup = useCallback(() => {
    const hangupSelectors = [
      "#hangup button",
      "#hangup_div button",
      ".call.reject button",
      "#hangup",
    ];

    for (const selector of hangupSelectors) {
      const hangupBtn = document.querySelector(selector) as HTMLButtonElement;
      if (hangupBtn) {
        hangupBtn.focus();
        hangupBtn.click();
        console.log("✅ HANGUP clicked via", selector);
        return;
      }
    }
  }, []);

  const toggleMute = useCallback(() => {
    const muteCheckbox = document.querySelector("#mute") as HTMLInputElement;
    if (muteCheckbox) {
      muteCheckbox.click();
      console.log("✅ MUTE/UNMUTE toggled");
    }
  }, []);

  const toggleHold = useCallback(() => {
    const holdCheckbox = document.querySelector("#hold") as HTMLInputElement;
    if (holdCheckbox) {
      holdCheckbox.click();
      console.log("✅ HOLD/UNHOLD toggled");
    }
  }, []);

  const handleToggle = useCallback(() => {
    setOpen(!open);
  }, [open]);

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

      {/* PHONE ICON */}
      <button
        onClick={handleToggle}
        className="fixed bottom-6 right-6 z-[99999] w-16 h-16 rounded-full shadow-2xl border-4 border-white/30 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white flex items-center justify-center shadow-emerald-500/50 hover:shadow-emerald-500/70 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
        title="WebPhone"
      >
        <Phone className="w-8 h-8 drop-shadow-lg" />
      </button>

      {/* WEBPHONE MODAL */}
      <div
        className={`fixed bottom-24 right-6 z-[100000] w-[350px] h-[450px] bg-gradient-to-b from-slate-900 to-slate-800 backdrop-blur-xl shadow-3xl border border-emerald-400/50 rounded-2xl overflow-hidden transition-all duration-300 ${
          open
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-8 scale-95 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="p-4 bg-slate-800/90 border-b border-emerald-500/50 flex items-center justify-between">
          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
              sipStatus === "Connected"
                ? "bg-emerald-500/90 text-white"
                : "bg-slate-600/80 text-slate-300"
            }`}
          >
            <Wifi className="w-4 h-4" />
            {sipStatus}
          </div>
          {/* <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
            <Phone className="w-5 h-5 text-white" />
          </div> */}
        </div>

        {/* Call Info */}
        <div className="p-6 flex-1 flex flex-col justify-center items-center text-center space-y-4">
          <h2
            className={`text-xl font-bold ${
              isAnswered ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            {isAnswered ? "ACTIVE CALL" : "INCOMING CALL"}
          </h2>
          <div className="text-2xl font-mono font-bold text-white bg-slate-800/80 px-6 py-3 rounded-xl border border-slate-600">
            {incomingNumber || "Unknown"}
          </div>
          {isAnswered && (
            <div className="text-3xl font-mono font-bold text-emerald-400 bg-slate-900/90 px-8 py-4 rounded-xl border-2 border-emerald-500/50 shadow-2xl animate-pulse">
              {callDuration}
            </div>
          )}
        </div>

        {/* CONTROLS */}
        <div className="p-6 bg-slate-900/90 space-y-4 border-t border-slate-700">
          <div className="grid grid-cols-2 gap-3">
            {/* MUTE/UNMUTE */}
            <button
              onClick={toggleMute}
              className={`p-3 rounded-xl font-bold text-sm shadow-lg transition-all flex flex-col items-center gap-2 h-20 cursor-pointer active:scale-95 hover:scale-105 ${
                isMuted
                  ? "bg-red-600/90 text-white shadow-red-500/60 ring-2 ring-red-400/50"
                  : "bg-slate-700 hover:bg-slate-600 text-white hover:shadow-emerald-400/50"
              }`}
              title={isMuted ? "Click to UNMUTE" : "Click to MUTE"}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-md transition-all ${
                  isMuted
                    ? "bg-red-500/80 ring-2 ring-red-400/60"
                    : "bg-slate-600/80 hover:bg-emerald-500/30"
                }`}
              >
                {isMuted ? (
                  <MicOff className="w-6 h-6 drop-shadow-lg" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </div>
              <span className="uppercase tracking-wider text-xs">
                {isMuted ? "UNMUTE" : "MUTE"}
              </span>
            </button>

            {/* HOLD/RESUME */}
            <button
              onClick={toggleHold}
              className={`p-3 rounded-xl font-bold text-sm shadow-lg transition-all flex flex-col items-center gap-2 h-20 cursor-pointer active:scale-95 hover:scale-105 ${
                isOnHold
                  ? "bg-amber-600/90 text-white shadow-amber-500/60 ring-2 ring-amber-400/50"
                  : "bg-slate-700 hover:bg-slate-600 text-white hover:shadow-amber-400/50"
              }`}
              title={isOnHold ? "Click to RESUME" : "Click to HOLD"}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-md transition-all ${
                  isOnHold
                    ? "bg-amber-500/80 ring-2 ring-amber-400/60"
                    : "bg-slate-600/80 hover:bg-amber-500/30"
                }`}
              >
                {isOnHold ? (
                  <Play className="w-6 h-6 drop-shadow-lg" />
                ) : (
                  <Pause className="w-6 h-6" />
                )}
              </div>
              <span className="uppercase tracking-wider text-xs">
                {isOnHold ? "RESUME" : "HOLD"}
              </span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* ✅ ANSWER - GRAY & SUPER FADED */}
            <button
              onClick={handleAnswer}
              disabled={isAnswered}
              className={`p-4 rounded-xl font-bold text-lg shadow-md transition-all flex flex-col items-center gap-2 h-24 group ${
                isAnswered
                  ? "bg-gray-800/50 text-gray-500 opacity-25 cursor-not-allowed shadow-none border-2 border-gray-600/50 hover:scale-100 active:scale-100"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/50 hover:scale-105 active:scale-95 cursor-pointer hover:shadow-emerald-500/70"
              }`}
              title="Answer Call"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  isAnswered
                    ? "bg-gray-700/30 border border-gray-600/50"
                    : "bg-emerald-500/80 border-4 border-emerald-400/60 hover:scale-110"
                }`}
              >
                <Phone
                  className={`w-7 h-7 ${isAnswered ? "opacity-40" : ""}`}
                />
              </div>
              <span className={`${isAnswered ? "opacity-40" : ""}`}>
                ANSWER
              </span>
            </button>

            {/* HANGUP - SUPER COLORFUL */}
            <button
              onClick={handleHangup}
              className={`p-4 rounded-xl font-black text-lg shadow-2xl transition-all flex flex-col items-center gap-2 h-24 cursor-pointer group hover:scale-105 active:scale-95 ring-4 ring-red-400/60 ${
                isAnswered
                  ? "bg-gradient-to-br from-red-600 to-red-800 text-white shadow-red-500/70 hover:shadow-red-600/80 hover:from-red-700 hover:to-red-900"
                  : "bg-red-600/60 text-slate-300 hover:bg-red-600/80 opacity-70 hover:opacity-100 shadow-red-400/40"
              }`}
              title="Hangup Call"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-2xl transition-all group-hover:scale-110 group-hover:rotate-[-5deg] ${
                  isAnswered
                    ? "bg-gradient-to-br from-red-500/90 to-red-600/90 border-4 border-red-400/70 shadow-red-500/60"
                    : "bg-red-500/50 border-2 border-red-400/50"
                }`}
              >
                <PhoneOff className="w-7 h-7 drop-shadow-lg" />
              </div>
              <span className="uppercase tracking-widest drop-shadow-md">
                HANGUP
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
