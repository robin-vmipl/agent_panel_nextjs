"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Phone, PhoneOff, MicOff, Mic, Pause, Play, Wifi } from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import toast from "react-hot-toast";
import { apiFetch } from "@/app/lib/api";
import { WebPhoneToggle, WebPhoneContainer } from "@/app/components/webphone";

const SIP_HTML = (
  <>
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
                        <button id="sipLogoutBtn" className="btn btn-primary" />
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
  </>
);

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
  const [transferPopup, setTransferPopup] = useState(false);
  const [ingroups, setIngroups] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasOpenedCrm, setHasOpenedCrm] = useState(false);

  const [isCtcCall, setIsCtcCall] = useState(false); // NEW STATE FOR CTC CALLS

  const durationRef = useRef(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const callStateCheckRef = useRef<NodeJS.Timeout | null>(null);
  const currentCallIdRef = useRef<string>("");

  // 🔥 ALL FUNCTIONS
  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

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

  const handleTransferClick = () => {
    setTransferPopup(true);
    fetchIngroups();
  };

  const closeTransfer = () => {
    setTransferPopup(false);
    setSelectedGroup("");
  };

  const selectGroup = (group: string) => setSelectedGroup(group);

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
    setHasOpenedCrm(false);
    currentCallIdRef.current = "";
    resetTimer();
  };

  // 🔥 SIP EVENT HANDLERS
  useEffect(() => {
    const handleCallReceived = () => {
      setIsInCall(true);
      setIsAnswered(false);
      setOpen(true);
      setHasOpenedCrm(false);
      currentCallIdRef.current = "";
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

  // 🔥 CALL DURATION TIMER
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

  // 🔥 SIP CONFIG
  useEffect(() => {
    if (sipConfig.username && sipConfig.password && isAuthenticated) {
      (window as any).SIP_USERNAME = sipConfig.username;
      (window as any).SIP_PASSWORD = sipConfig.username;
      (window as any).WEBSOCKET_HOST = "vconrtc.smartping.io";
      (window as any).WEBSOCKET_PORT = 8080;
      (window as any).SIP_PORT = 8443;
    }
  }, [sipConfig.username, sipConfig.password, isAuthenticated]);

  // 🔥 STATUS CHECK + GLOBAL SIP DATA
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

      // USE GLOBAL SIP DATA INSTEAD OF DOM PARSING
      const sipData = (window as any).SIP_CALL_DATA;
      if (sipData?.currentIncomingNumber) {
        setIncomingNumber(sipData.currentIncomingNumber);
      }

      // CTC PAGE DETECTION - CHECK LOADED SCRIPT
      const sipScript = Array.from(document.querySelectorAll("script")).find(
        (script) => script.src?.includes("demo-1-ctc")
      );
      setIsCtcCall(!!sipScript); // true = CTC, false = Dashboard
    };

    callStateCheckRef.current = setInterval(checkStatus, 200);
    return () => {
      if (callStateCheckRef.current) {
        clearInterval(callStateCheckRef.current);
      }
    };
  }, []);

  // 🔥 FETCH INGROUPS ON ANSWER
  useEffect(() => {
    if (isAnswered) {
      fetchIngroups();
    }
  }, [isAnswered, fetchIngroups]);

  // 🔥 AUTO CRM - GLOBAL SIP DATA VERSION (NO DOM PARSING!)
  useEffect(() => {
    if (isAnswered && !hasOpenedCrm) {
      console.log("🎤 SIP Call answered - Auto opening CRM...");

      const openCrmOnce = async () => {
        try {
          // 🔥 USE GLOBAL SIP DATA DIRECTLY
          const sipData = (window as any).SIP_CALL_DATA;
          const incomingNum = sipData?.currentIncomingNumber || "";

          // Only proceed if we have a real incoming number (new call detection)
          if (incomingNum && incomingNum !== currentCallIdRef.current) {
            currentCallIdRef.current = incomingNum;

            const data = await apiFetch(
              `${process.env.NEXT_PUBLIC_API_URL}/agent/call_details`
            );
            const { call_details } = data;

            if (call_details) {
              const encryptStringData = (
                data: string | null
              ): string | null => {
                if (!data) return null;
                try {
                  return btoa(unescape(encodeURIComponent(data)));
                } catch {
                  return null;
                }
              };

              const userID = encryptStringData(call_details.user || null);
              const uniqueID = encryptStringData(
                call_details.external_update_fields_data || null
              );
              const mobileNumber = encryptStringData(
                (call_details.external_transferconf || "").slice(-10)
              );

              const url = `https://pmfby.gov.in/krph/?userID=${userID}&uniqueID=${uniqueID}&mobileNumber=${mobileNumber}`;
              window.open(url, "_blank");

              setHasOpenedCrm(true);
              console.log("Auto CRM opened for call:", incomingNum);
            }
          }
        } catch (err: any) {
          console.log("Auto CRM failed:", err.message);
        }
      };

      setTimeout(openCrmOnce, 1500);
    }

    // RESET when call hangs up
    if (!isInCall) {
      setHasOpenedCrm(false);
      currentCallIdRef.current = "";
    }
  }, [isAnswered, isInCall]);

  return (
    <>
      {SIP_HTML}

      <WebPhoneToggle
        isInCall={isInCall}
        open={open}
        handleToggle={handleToggle}
      />

      <WebPhoneContainer
        isInCall={isInCall}
        open={open}
        sipStatus={sipStatus}
        isAnswered={isAnswered}
        incomingNumber={incomingNumber}
        callDuration={callDuration}
        isMuted={isMuted}
        isOnHold={isOnHold}
        loading={loading}
        transferPopup={transferPopup}
        ingroups={ingroups}
        selectedGroup={selectedGroup}
        handleAnswer={handleAnswer}
        toggleMute={toggleMute}
        toggleHold={toggleHold}
        handleHangup={handleHangup}
        handleTransferClick={handleTransferClick}
        handleFeedback={handleFeedback}
        closeTransfer={closeTransfer}
        selectGroup={selectGroup}
        handleTransfer={handleTransfer}
        isCtcCall={isCtcCall}
      />
    </>
  );
}
