import React from 'react';
import { FieldError } from 'react-hook-form';
import { cn } from '@/utils/cn';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: FieldError;
  label: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, error, className, ...props }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700" htmlFor={props.id || props.name}>
        {label}
      </label>
      <textarea
        {...props}
        className={cn(
          "shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md resize-y min-h-[100px]",
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

export default Textarea;
