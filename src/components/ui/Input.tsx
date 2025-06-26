import React from 'react';
import { FieldError } from 'react-hook-form';
import { cn } from '@/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: FieldError;
  label: string;
}

const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700" htmlFor={props.id || props.name}>
        {label}
      </label>
      <input
        {...props}
        className={cn(
          "shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base px-4 py-3 border-gray-300 rounded-md transition-colors",
          { 'border-red-500': error },
          className
        )}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default Input;
