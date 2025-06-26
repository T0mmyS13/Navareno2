import React from 'react';
import { FieldError } from 'react-hook-form';
import { cn } from '@/utils/cn';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: FieldError;
  label: string;
  options: { value: string | number; label: string }[];
}

const Select: React.FC<SelectProps> = ({ label, error, options, className, ...props }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700" htmlFor={props.id || props.name}>
        {label}
      </label>
      <div className="relative">
        <select
          {...props}
          className={cn(
            "shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base px-4 py-3 border-gray-300 rounded-md appearance-none bg-white pr-10 transition-colors",
            { 'border-red-500': error },
            className
          )}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default Select;
