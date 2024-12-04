import React from "react";

interface TableProps {
  headers: string[];
  data: any[];
  actions?: (item: any) => React.ReactNode;
}

const Table: React.FC<TableProps> = ({ headers, data, actions }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="py-2 px-4 border-b text-left bg-gray-100 text-gray-700"
              >
                {header}
              </th>
            ))}
            {actions && (
              <th className="py-2 px-4 border-b bg-gray-100 text-gray-700">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              {headers.map((header, idx) => (
                <td key={idx} className="py-2 px-4 border-b">
                  {item[header.toLowerCase()]}
                </td>
              ))}
              {actions && (
                <td className="py-2 px-4 border-b">{actions(item)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
