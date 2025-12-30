interface Props {
  isAnswered: boolean;
  incomingNumber: string;
  callDuration: string;
}

export const WebPhoneInfo = ({
  isAnswered,
  incomingNumber,
  callDuration,
}: Props) => (
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
);
