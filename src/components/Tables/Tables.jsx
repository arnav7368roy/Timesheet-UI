import React from 'react';

export default function DataTable({ headers, columns, data = [], renderRow, loading }) {
  if (loading) {
    return (
      <div style={{ padding: '60px', display: 'flex', justifyContent: 'center' }}>
        <div className="loader"></div>
      </div>
    );
  }

  // Determine headers list
  const headerList = headers || (columns ? columns.map(c => c.header) : []);

  return (
    <div className="table-container" style={{ overflowX: 'auto', width: '100%' }}>
      <table>
        <thead>
          <tr>
            {headerList.map((head, idx) => (
              <th key={idx}>{head}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={headerList.length || 1} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <span>No data records available</span>
                </div>
              </td>
            </tr>
          ) : (
            data.map((item, idx) => {
              if (renderRow) return renderRow(item, idx);
              if (columns) {
                return (
                  <tr key={idx}>
                    {columns.map((col, i) => (
                      <td key={i}>
                        {col.render ? col.render(item) : String(item[col.accessor] ?? '')}
                      </td>
                    ))}
                  </tr>
                );
              }
              return (
                <tr key={idx}>
                  {Object.keys(item).map((key, i) => (
                    <td key={i}>{String(item[key])}</td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
