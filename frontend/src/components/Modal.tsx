import React, { useState } from "react";

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  title,
  isOpen,
  onClose,
  onSave,
  children,
}) => {
  const [formData] = useState({});

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div>{children}</div>
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
