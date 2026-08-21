type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SOSModal({
  open,
  onClose,
}: Props) {
  if (!open) {
    return null;
  }

  return (
    <div className="sos-overlay">
      <div className="sos-modal">
        <h2>Emergency SOS</h2>

        <p>
          If you are in immediate danger,
          contact emergency services.
        </p>

        <div className="sos-actions">
          <a href="tel:100">
            Police
          </a>

          <a href="tel:102">
            Ambulance
          </a>
        </div>

        <button
          type="button"
          className="close-button"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}