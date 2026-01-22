import toast from "react-hot-toast";

interface Props {
  ingroups: string[];
  selectedGroup: string;
  loading: boolean;
  closeTransfer: () => void;
  selectGroup: (group: string) => void;
  handleTransfer: () => void;
}

export const WebPhoneTransfer = ({
  ingroups,
  selectedGroup,
  loading,
  closeTransfer,
  selectGroup,
  handleTransfer,
}: Props) => (
  <div className="fixed inset-0 z-100001 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
    <div className="transfer-modal-container w-full max-w-sm rounded-2xl shadow-2xl backdrop-blur-xl max-h-[70vh] overflow-hidden">
      <div className="transfer-modal-header p-5">
        <div className="flex items-center justify-between">
          <h3 className="transfer-modal-header-text text-lg font-bold flex items-center gap-2">
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
            onClick={closeTransfer}
            className="transfer-modal-close-btn w-9 h-9 rounded-lg flex items-center justify-center transition-all group cursor-pointer"
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

      <div className="p-5 max-h-72 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="transfer-modal-spinner w-8 h-8 border-2 rounded-full animate-spin" />
          </div>
        ) : ingroups.length === 0 ? (
          <div className="transfer-modal-empty text-center py-10">
            <p className="font-medium">No Groups Available</p>
          </div>
        ) : (
          <div className="space-y-2">
            {ingroups.map((group) => (
              <label
                key={group}
                className="transfer-group-item flex items-center p-3 border rounded-lg transition-all cursor-pointer group"
              >
                <input
                  type="radio"
                  name="transferGroup"
                  value={group}
                  checked={selectedGroup === group}
                  onChange={(e) => selectGroup(e.target.value)}
                  className="transfer-radio-input w-4 h-4 text-blue-600 focus:ring-blue-500 mr-3"
                />
                <span className="transfer-group-item-text font-semibold text-sm">
                  {group}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="transfer-modal-footer p-5 flex gap-3">
        <button
          onClick={closeTransfer}
          className="transfer-cancel-btn flex-1 h-11 px-4 py-2 rounded-lg border transition-all font-medium cursor-pointer"
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
              : "bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-blue-500/50 hover:shadow-blue-600/60 hover:scale-[1.02] cursor-pointer"
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
);
