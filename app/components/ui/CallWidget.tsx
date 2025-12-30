"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Phone, PhoneOff, MicOff, Mic, Pause, Play, Wifi } from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import toast from "react-hot-toast";
import { apiFetch } from "@/app/lib/api";

export default function CallWidget() {
  const { sipConfig, user, isAuthenticated } = useAuth();

  // 🔥 ORIGINAL STATES + NEW STATES FOR TRANSFER + FEEDBACK
  const [open, setOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [incomingNumber, setIncomingNumber] = useState("");
  const [callDuration, setCallDuration] = useState("00:00:00");
  const [isInCall, setIsInCall] = useState(false);
  const [sipStatus, setSipStatus] = useState("Disconnected");

  // 🔥 NEW STATES
  const [transferPopup, setTransferPopup] = useState(false);
  const [ingroups, setIngroups] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [loading, setLoading] = useState(false);

  const durationRef = useRef(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const callStateCheckRef = useRef<NodeJS.Timeout | null>(null);

  // 🔥 ALL ORIGINAL useEffects (UNCHANGED)
  useEffect(() => {
    const handleCallReceived = () => {
      setIsInCall(true);
      setIsAnswered(false);
      setOpen(true);
    };

    const handleCallAnswered = () => {
      setIsAnswered(true);
      setIsInCall(true);
      setOpen(true);
    };

    const handleCallHangup = () => {
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

  useEffect(() => {
    if (sipConfig.username && sipConfig.password && isAuthenticated) {
      (window as any).SIP_USERNAME = sipConfig.username;
      (window as any).SIP_PASSWORD = sipConfig.username;
      (window as any).WEBSOCKET_HOST = "vconrtc.smartping.io";
      (window as any).WEBSOCKET_PORT = 8080;
      (window as any).SIP_PORT = 8443;
    }
  }, [sipConfig.username, sipConfig.password, isAuthenticated]);

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

  // 🔥 NEW API FUNCTIONS
  const fetchIngroups = useCallback(async () => {
    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/agent/ingroups`
      );
      setIngroups(data || []);
    } catch (err: any) {
      console.error("Ingroups fetch failed:", err);
      toast.error(err.message || "Failed to load groups");
    }
  }, []);

  const handleFeedback = async () => {
    setLoading(true);
    try {
      await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/agent/call_transfer_api`,
        {
          method: "POST",
          body: JSON.stringify({ action: "feedback" }),
        }
      );
      toast.success("Feedback submitted successfully!");
      handleHangup();
    } catch (err: any) {
      toast.error(err.message || "Feedback failed");
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedGroup) {
      toast.error("Please select a group");
      return;
    }
    setLoading(true);
    try {
      await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/agent/call_transfer_api`,
        {
          method: "POST",
          body: JSON.stringify({ action: "transfer", queue: selectedGroup }),
        }
      );
      toast.success("Call transferred successfully!");
      setTransferPopup(false);
      setSelectedGroup("");
      handleHangup();
    } catch (err: any) {
      toast.error(err.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAnswered) {
      fetchIngroups();
    }
  }, [isAnswered, fetchIngroups]);

  // 🔥 ALL ORIGINAL FUNCTIONS (UNCHANGED)
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
    setTransferPopup(false);
    setSelectedGroup("");
    resetTimer();
  };

  const handleAnswer = useCallback(() => {
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
      console.log("SIP Answer button not available or disabled");
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
      {/* 🔥 ORIGINAL SIP HTML - 100% UNCHANGED */}
      <button id="connect" style={{ display: "none" }} />
      <button id="disconnect" style={{ display: "none" }} />
      <button
        className="chatbot-button"
        id="chatbotButton"
        style={{ display: "none" }}
      />

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

      {/* 🔥 TOGGLE BUTTON */}
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

      {/* 🔥 PERFECT WEBPHONE - ZERO EMPTY SPACE */}
      {isInCall && (
        <div
          className={`fixed bottom-24 right-6 z-100000 w-87.5 h-115 bg-linear-to-b from-slate-900 to-slate-800 backdrop-blur-xl shadow-3xl border border-emerald-400/50 rounded-2xl overflow-hidden transition-all duration-300 ${
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

          {/* Call Info - TIGHTER */}
          <div className="p-3 flex flex-col justify-center items-center text-center space-y-2 h-40">
            <h2
              className={`text-lg font-bold ${
                isAnswered ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {isAnswered ? "IN CALL" : "INCOMING CALL"}
            </h2>
            <div className="text-xl font-mono font-bold text-white bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-600">
              {incomingNumber || "Unknown"}
            </div>
            <div
              className={`text-lg font-mono font-bold px-5 py-2 rounded-xl shadow-xl ${
                isAnswered
                  ? "text-emerald-400 bg-slate-900/90 border-2 border-emerald-500/50 animate-pulse"
                  : "text-amber-400 bg-amber-900/80 border-2 border-amber-500/50 animate-pulse"
              }`}
            >
              {callDuration}
            </div>
          </div>

          {/* 🔥 PERFECT 3x2 GRID - YOUR EXACT ORDER */}
          <div className="p-3 bg-slate-900/90 border-t border-slate-700 h-50 grid grid-cols-3 grid-rows-2 gap-2.5">
            {/* ROW 1: ANSWER(1st), MUTE, HOLD */}
            {/* ANSWER - LEFT MOST */}
            <button
              onClick={handleAnswer}
              disabled={isAnswered}
              className={`group h-full flex flex-col items-center justify-center gap-1 p-1.5 rounded-lg font-bold text-xs shadow-lg transition-all duration-200 ${
                isAnswered
                  ? "bg-emerald-600/60 text-emerald-100 shadow-emerald-500/40 ring-1 ring-emerald-400/40 cursor-not-allowed opacity-70 pointer-events-none"
                  : "bg-linear-to-r from-emerald-600 to-emerald-700 text-white shadow-emerald-500/50 hover:scale-105 active:scale-95 cursor-pointer"
              }`}
              title={isAnswered ? "Call Answered" : "Answer Call"}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-md transition-all shrink-0 ${
                  isAnswered
                    ? "bg-emerald-500/60 border-2 border-emerald-400/50"
                    : "bg-linear-to-r from-emerald-500/80 to-emerald-600/80 border-2 border-emerald-400/60 hover:scale-110"
                }`}
              >
                <Phone
                  className={`w-3.5 h-3.5 transition-opacity ${
                    isAnswered ? "opacity-70" : ""
                  }`}
                />
              </div>
              <span
                className={`uppercase tracking-wider text-xs font-semibold ${
                  isAnswered ? "opacity-70" : ""
                }`}
              >
                ANSWER
              </span>
            </button>

            {/* MUTE */}
            <button
              onClick={toggleMute}
              disabled={!isAnswered}
              className={`group h-full flex flex-col items-center justify-center gap-1 p-1.5 rounded-lg font-bold text-xs shadow-lg transition-all duration-200 ${
                !isAnswered
                  ? "opacity-40 bg-slate-700/60 cursor-not-allowed shadow-none ring-1 ring-slate-500/30"
                  : isMuted
                  ? "bg-linear-to-r from-red-600/90 to-red-700/90 text-white shadow-red-500/60 ring-1 ring-red-400/50 hover:scale-105 active:scale-95 cursor-pointer"
                  : "bg-slate-700 hover:bg-slate-600 text-white hover:shadow-emerald-400/50 hover:scale-105 active:scale-95 cursor-pointer"
              }`}
              title={
                !isAnswered ? "Wait for answer..." : isMuted ? "UNMUTE" : "MUTE"
              }
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-md transition-all shrink-0 ${
                  !isAnswered
                    ? "bg-slate-600/50 opacity-60"
                    : isMuted
                    ? "bg-linear-to-r from-red-500/80 to-red-600/80 ring-1 ring-red-400/60"
                    : "bg-slate-600/80"
                }`}
              >
                {isMuted ? (
                  <MicOff className="w-3.5 h-3.5 drop-shadow-lg" />
                ) : (
                  <Mic className="w-3.5 h-3.5" />
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
              className={`group h-full flex flex-col items-center justify-center gap-1 p-1.5 rounded-lg font-bold text-xs shadow-lg transition-all duration-200 ${
                !isAnswered
                  ? "opacity-40 bg-slate-700/60 cursor-not-allowed shadow-none ring-1 ring-slate-500/30"
                  : isOnHold
                  ? "bg-linear-to-r from-amber-600/90 to-amber-700/90 text-white shadow-amber-500/60 ring-1 ring-amber-400/50 hover:scale-105 active:scale-95 cursor-pointer"
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
                className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-md transition-all shrink-0 ${
                  !isAnswered
                    ? "bg-slate-600/50 opacity-60"
                    : isOnHold
                    ? "bg-linear-to-r from-amber-500/80 to-amber-600/80 ring-1 ring-amber-400/60"
                    : "bg-slate-600/80"
                }`}
              >
                {isOnHold ? (
                  <Play className="w-3.5 h-3.5 drop-shadow-lg" />
                ) : (
                  <Pause className="w-3.5 h-3.5" />
                )}
              </div>
              <span className="uppercase tracking-wider text-xs leading-tight">
                {isOnHold ? "RESUME" : "HOLD"}
              </span>
            </button>

            {/* ROW 2: TRANSFER(1st), FEEDBACK, HANGUP(Right most) */}
            {/* TRANSFER - LEFT MOST */}
            <button
              onClick={() => {
                setTransferPopup(true);
                fetchIngroups();
              }}
              disabled={!isAnswered}
              className={`group h-full flex flex-col items-center justify-center gap-1 p-1.5 rounded-lg font-bold text-xs shadow-lg transition-all duration-200 ${
                !isAnswered
                  ? "opacity-40 bg-slate-700/60 cursor-not-allowed shadow-none"
                  : "bg-linear-to-r from-blue-600/90 to-blue-700/90 text-white shadow-blue-500/60 ring-1 ring-blue-400/50 hover:scale-105 active:scale-95 cursor-pointer"
              }`}
              title={!isAnswered ? "Wait for answer..." : "Transfer Call"}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-md transition-all shrink-0 ${
                  !isAnswered
                    ? "bg-slate-600/50 opacity-60"
                    : "bg-linear-to-r from-blue-500/80 to-blue-600/80 ring-1 ring-blue-400/60"
                }`}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </div>
              <span className="uppercase tracking-wider text-xs leading-tight">
                TRANSFER
              </span>
            </button>

            {/* FEEDBACK */}
            <button
              onClick={handleFeedback}
              disabled={!isAnswered || loading}
              className={`group h-full flex flex-col items-center justify-center gap-1 p-1.5 rounded-lg font-bold text-xs shadow-lg transition-all duration-200 ${
                !isAnswered || loading
                  ? "opacity-40 bg-slate-700/60 cursor-not-allowed shadow-none"
                  : "bg-linear-to-r from-purple-600/90 to-pink-600/90 text-white shadow-purple-500/60 ring-1 ring-purple-400/50 hover:scale-105 active:scale-95 cursor-pointer"
              }`}
              title={!isAnswered ? "Wait for answer..." : "Call Feedback"}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-md transition-all shrink-0 ${
                  !isAnswered || loading
                    ? "bg-slate-600/50 opacity-60"
                    : "bg-linear-to-r from-purple-500/80 to-pink-500/80 ring-1 ring-purple-400/60"
                }`}
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </div>
              <span className="uppercase tracking-wider text-xs leading-tight">
                FEEDBACK
              </span>
            </button>

            {/* HANGUP - RIGHT MOST */}
            <button
              onClick={handleHangup}
              disabled={!isAnswered}
              className={`group h-full flex flex-col items-center justify-center gap-1 p-1.5 rounded-lg font-black text-xs shadow-2xl transition-all duration-200 ring-2 ring-red-400/60 hover:scale-105 active:scale-95 ${
                !isAnswered
                  ? "opacity-40 bg-slate-700/60 cursor-not-allowed shadow-none text-slate-300"
                  : "bg-linear-to-br from-red-600 to-red-800 text-white shadow-red-500/70 hover:shadow-red-600/80 hover:from-red-700 hover:to-red-900 cursor-pointer"
              }`}
              title={!isAnswered ? "Wait for answer..." : "Hangup Call"}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-2xl transition-all shrink-0 group-hover:scale-110 ${
                  !isAnswered
                    ? "bg-slate-600/50 opacity-60 border-2 border-slate-500/40"
                    : "bg-linear-to-br from-red-500/90 to-red-600/90 border-2 border-red-400/70 shadow-red-500/60"
                }`}
              >
                <PhoneOff className="w-3.5 h-3.5 drop-shadow-lg" />
              </div>
              <span className="uppercase tracking-widest text-xs leading-tight drop-shadow-sm">
                HANGUP
              </span>
            </button>
          </div>
        </div>
      )}

      {/* 🔥 TRANSFER POPUP - WORKING */}
      {transferPopup && (
        <div className="fixed inset-0 z-100001 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-linear-to-b from-slate-900/95 to-slate-800/95 w-full max-w-sm rounded-2xl border-2 border-blue-500/40 shadow-3xl backdrop-blur-xl max-h-[70vh] overflow-hidden">
            {/* Header */}
            <div className="p-5 bg-linear-to-r from-blue-600/95 to-blue-700/95 border-b border-blue-500/40">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                  Transfer Call
                </h3>
                <button
                  onClick={() => setTransferPopup(false)}
                  className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all group"
                  disabled={loading}
                >
                  <svg
                    className="w-4 h-4"
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
            </div>

            {/* Groups List */}
            <div className="p-5 max-h-72 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                </div>
              ) : ingroups.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <p className="font-medium">No Groups Available</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {ingroups.map((group) => (
                    <label
                      key={group}
                      className="flex items-center p-3 bg-slate-800/50 hover:bg-slate-700/70 border-2 border-transparent hover:border-blue-400/50 rounded-lg transition-all cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="transferGroup"
                        value={group}
                        checked={selectedGroup === group}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 focus:ring-blue-500 mr-3"
                      />
                      <span className="font-semibold text-white text-sm group-hover:text-blue-300">
                        {group}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Footer - CANCEL + TRANSFER SUBMIT */}
            <div className="p-5 bg-slate-800/50 border-t border-slate-700/50 flex gap-3">
              <button
                onClick={() => {
                  setTransferPopup(false);
                  setSelectedGroup("");
                }}
                className="flex-1 h-11 px-4 py-2 bg-slate-700/60 hover:bg-slate-600/80 text-slate-200 rounded-lg border border-slate-600/50 transition-all font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                disabled={!selectedGroup || loading}
                className={`flex-1 h-11 px-6 font-bold rounded-lg transition-all shadow-lg flex items-center justify-center ${
                  !selectedGroup || loading
                    ? "bg-slate-700/60 text-slate-400 cursor-not-allowed shadow-none"
                    : "bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-blue-500/50 hover:shadow-blue-600/60 hover:scale-[1.02]"
                }`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Transfer Call"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
