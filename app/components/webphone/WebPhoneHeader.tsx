import { Wifi, Phone } from "lucide-react";

interface Props {
  sipStatus: string;
}

export const WebPhoneHeader = ({ sipStatus }: Props) => (
  <div className="p-3 bg-slate-800/90 border-b border-emerald-500/50 flex items-center justify-between h-14">
    <div className="w-9 h-9 bg-blue-950 rounded-lg flex items-center justify-center">
      <Phone className="w-4.5 h-4.5 text-white" />
    </div>
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
  </div>
);
