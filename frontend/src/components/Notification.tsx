import React from "react";

interface NotificationProps {
  message: string;
  type: "success" | "error"; // Controls styling of the notification
  show: boolean; // Determines visibility
  onClose: () => void; // Callback to close the notification
}

const Notification: React.FC<NotificationProps> = ({
  message,
  type,
  show,
  onClose,
}) => {
  return (
    <div
      className={`fixed bottom-5 right-5 transition-transform duration-300 ${
        show ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      } p-4 rounded-lg shadow-lg ${
        type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
      }`}
      role="alert"
    >
      <div className="flex items-center">
        <p className="flex-1">{message}</p>
        <button
          onClick={onClose}
          className="ml-4 text-white font-bold"
          aria-label="Close notification"
        >
          ✖
        </button>
      </div>
    </div>
  );
};

export default Notification;
