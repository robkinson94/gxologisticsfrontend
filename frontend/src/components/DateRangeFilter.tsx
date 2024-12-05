import React, { useState } from "react";

interface FilterProps {
  onFilter: (startDate: string, endDate: string) => void;
}

const DateRangeFilter: React.FC<FilterProps> = ({ onFilter }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleFilter = () => {
    onFilter(startDate, endDate);
  };

  return (
    <div className="flex space-x-4">
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="p-2 border rounded"
      />
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="p-2 border rounded"
      />
      <button
        onClick={handleFilter}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Apply
      </button>
    </div>
  );
};

export default DateRangeFilter;
