import React from 'react';

type TakaProps = {
  size?: number;        // px size, defaults to 20
  className?: string;   // extra utility classes
  title?: string;       // accessibility label
};

const Taka: React.FC<TakaProps> = ({ size = 20, className = '', title = 'Bangladeshi Taka' }) => {
  return (
    <span
      role="img"
      aria-label={title}
      className={`inline-block align-middle font-semibold ${className}`}
      style={{ fontSize: size, lineHeight: 1 }}
    >
      ৳
    </span>
  );
};

export default Taka;
