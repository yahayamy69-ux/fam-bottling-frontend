import React from 'react';
import '../styles/Card.css';

const Card = ({ children, title, className = '' }) => {
  return (
    <div className={`card ${className}`}>
      {title && <h3 className="card-title">{title}</h3>}
      {children}
    </div>
  );
};

export default Card;
