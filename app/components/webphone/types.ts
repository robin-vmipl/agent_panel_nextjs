export interface WebPhoneProps {
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
  
  handleToggle: () => void;
  handleAnswer: () => void;
  toggleMute: () => void;
  toggleHold: () => void;
  handleHangup: () => void;
  handleFeedback: () => void;
  handleTransferClick: () => void;
  closeTransfer: () => void;
  selectGroup: (group: string) => void;
  handleTransfer: () => void;
}
