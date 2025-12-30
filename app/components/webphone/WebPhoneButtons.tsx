import { Phone, Mic, MicOff, Pause, Play, PhoneOff } from "lucide-react";

interface Props {
  isAnswered: boolean;
  isMuted: boolean;
  isOnHold: boolean;
  loading: boolean;
  handleAnswer: () => void;
  toggleMute: () => void;
  toggleHold: () => void;
  handleHangup: () => void;
  handleTransferClick: () => void;
  handleFeedback: () => void;
}

export const WebPhoneButtons = ({
  isAnswered,
  isMuted,
  isOnHold,
  loading,
  handleAnswer,
  toggleMute,
  toggleHold,
  handleHangup,
  handleTransferClick,
  handleFeedback,
}: Props) => (
  <div className="p-3 bg-slate-900/90 border-t border-slate-700 h-50 grid grid-cols-3 grid-rows-2 gap-2.5">
    {/* ROW 1: ANSWER, MUTE, HOLD */}
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
      title={!isAnswered ? "Wait for answer..." : isMuted ? "UNMUTE" : "MUTE"}
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
      title={!isAnswered ? "Wait for answer..." : isOnHold ? "RESUME" : "HOLD"}
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

    {/* ROW 2: TRANSFER, FEEDBACK, HANGUP */}
    <button
      onClick={handleTransferClick}
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
);
