import React from 'react';

export function MetricCard({ title, value, icon: Icon, color = 'blue' }) {
  // Map color classes
  const colorMap = {
    blue: { bg: '#eff6ff', text: '#2563eb' },
    green: { bg: '#f0fdf4', text: '#16a34a' },
    purple: { bg: '#faf5ff', text: '#7c3aed' },
    amber: { bg: '#fffbeb', text: '#d97706' },
  };

  const style = colorMap[color] || colorMap.blue;

  return (
    <div className="card">
      <div>
        <h3>{title}</h3>
        <h1>{value}</h1>
      </div>
      <div 
        className="card-icon-container" 
        style={{ 
          backgroundColor: style.bg, 
          color: style.text, 
          borderRadius: '12px', 
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Icon size={24} />
      </div>
    </div>
  );
}

export default function Cards({ metrics = [] }) {
  return (
    <section className="cards">
      {metrics.map((metric, idx) => (
        <MetricCard 
          key={idx}
          title={metric.title}
          value={metric.value}
          icon={metric.icon}
          color={metric.color}
        />
      ))}
    </section>
  );
}
