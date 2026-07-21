import React from 'react';

export default function DataTable({ headers = [], data = [], renderRow }) {
  return (
    <div className="table-container" style={{ overflowX: 'auto', width: '100%' }}>
      <table>
        <thead>
          <tr>
            {headers.map((header, idx) => (
              <th key={idx}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} style={{ textAlign: 'center', padding: '32px', color: '#777' }}>
                <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <span>No data available</span>
                </div>
              </td>
            </tr>
          ) : (
            data.map((item, idx) => renderRow ? renderRow(item, idx) : (
              <tr key={idx}>
                {Object.keys(item).map((key, i) => (
                  <td key={i}>{String(item[key])}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
