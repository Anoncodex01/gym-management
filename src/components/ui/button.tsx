import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  className = '', 
  children, 
  disabled,
  ...props 
}) => {
  return (
    <button
      className={`px-4 py-2 rounded-md font-medium transition-colors
        ${disabled 
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
          : 'bg-blue-600 text-white hover:bg-blue-700'
        } ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
