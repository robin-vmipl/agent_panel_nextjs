import { Phone } from "lucide-react";

interface Props {
  isInCall: boolean;
  open: boolean;
  handleToggle: () => void;
}

export const WebPhoneToggle = ({ isInCall, open, handleToggle }: Props) => (
  <button
    onClick={handleToggle}
    className={`fixed bottom-6 right-6 z-99999 rounded-full shadow-2xl border-4 border-white/30 text-white flex items-center justify-center transition-all duration-200 cursor-pointer ${
      isInCall
        ? "w-16 h-16 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/50 hover:shadow-emerald-500/70 hover:scale-110 active:scale-95"
        : "w-12 h-12 bg-slate-600/80 hover:bg-slate-500/90 hover:scale-105 active:scale-95"
    }`}
    title={isInCall ? (open ? "Hide WebPhone" : "Show WebPhone") : "WebPhone"}
  >
    <Phone className={`drop-shadow-lg ${isInCall ? "w-8 h-8" : "w-6 h-6"}`} />
  </button>
);
