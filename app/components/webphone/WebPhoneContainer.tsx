import { WebPhoneHeader } from "./WebPhoneHeader";
import { WebPhoneInfo } from "./WebPhoneInfo";
import { WebPhoneButtons } from "./WebPhoneButtons";
import { WebPhoneTransfer } from "./WebPhoneTransfer";

interface Props {
  isInCall: boolean;
  open: boolean;
  sipStatus: string;
  isAnswered: boolean;
  incomingNumber: string;
  callDuration: string;
  isMuted: boolean;
  isOnHold: boolean;
  loading: boolean;
  transferPopup: boolean;
  ingroups: string[];
  selectedGroup: string;
  handleAnswer: () => void;
  toggleMute: () => void;
  toggleHold: () => void;
  handleHangup: () => void;
  handleTransferClick: () => void;
  handleFeedback: () => void;
  closeTransfer: () => void;
  selectGroup: (group: string) => void;
  handleTransfer: () => void;
}

export const WebPhoneContainer = (props: Props) => {
  const { isInCall, open, ...rest } = props;

  if (!isInCall) return null;

  return (
    <>
      <div
        className={`fixed bottom-24 right-6 z-100000 w-87.5 h-115 bg-linear-to-b from-slate-900 to-slate-800 backdrop-blur-xl shadow-3xl border border-emerald-400/50 rounded-2xl overflow-hidden transition-all duration-300 ${
          open
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-8 scale-95 pointer-events-none"
        }`}
      >
        <WebPhoneHeader sipStatus={props.sipStatus} />
        <WebPhoneInfo
          isAnswered={props.isAnswered}
          incomingNumber={props.incomingNumber}
          callDuration={props.callDuration}
        />
        <WebPhoneButtons
          isAnswered={props.isAnswered}
          isMuted={props.isMuted}
          isOnHold={props.isOnHold}
          loading={props.loading}
          handleAnswer={props.handleAnswer}
          toggleMute={props.toggleMute}
          toggleHold={props.toggleHold}
          handleHangup={props.handleHangup}
          handleTransferClick={props.handleTransferClick}
          handleFeedback={props.handleFeedback}
        />
      </div>

      {props.transferPopup && (
        <WebPhoneTransfer
          ingroups={props.ingroups}
          selectedGroup={props.selectedGroup}
          loading={props.loading}
          closeTransfer={props.closeTransfer}
          selectGroup={props.selectGroup}
          handleTransfer={props.handleTransfer}
        />
      )}
    </>
  );
};
