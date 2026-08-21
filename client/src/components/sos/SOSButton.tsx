import { Siren } from "lucide-react";

type Props = {
  onClick: () => void;
};

export default function SOSButton({
  onClick,
}: Props) {
  return (
    <button
      type="button"
      className="sos-button"
      onClick={onClick}
    >
      <Siren size={23} />
      SOS
    </button>
  );
}