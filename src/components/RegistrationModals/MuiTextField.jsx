import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export function MuiTextField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  onFocus,
  required = false,
  placeholder = '',
  autoComplete,
  error = '',
  hint = '',
  className = '',
  id,
  multiline = false,
  rows = 4,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const hasValue = value !== undefined && value !== null && String(value).length > 0;
  const isFloating = isFocused || hasValue;
  const inputId = id || `mui-${name}`;

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <div
      className={`mui-form-field ${isFloating ? 'is-floating' : ''} ${
        isFocused ? 'is-focused' : ''
      } ${error ? 'has-error' : ''} ${multiline ? 'is-multiline' : ''} ${className}`}
    >
      <div className="mui-input-container">
        {multiline ? (
          <textarea
            id={inputId}
            name={name}
            value={value ?? ''}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={isFocused ? placeholder : ''}
            required={required}
            rows={rows}
            className="mui-outlined-input mui-textarea"
            {...props}
          />
        ) : (
          <input
            type={isPassword ? (showPassword ? 'text' : 'password') : type}
            id={inputId}
            name={name}
            value={value ?? ''}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={isFocused ? placeholder : ''}
            required={required}
            autoComplete={autoComplete}
            className={`mui-outlined-input ${isPassword ? 'has-password-toggle' : ''}`}
            {...props}
          />
        )}
        <label htmlFor={inputId} className="mui-floating-label">
          <span>{label}</span>
          {required && <span className="mui-asterisk">*</span>}
        </label>
        {isPassword && (
          <button
            type="button"
            className="mui-password-toggle"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
          </button>
        )}
      </div>
      {hint && !error && <span className="mui-form-hint">{hint}</span>}
      {error && <span className="mui-form-error">{error}</span>}
    </div>
  );
}

export function MuiSelectField({
  label,
  name,
  value,
  onChange,
  onBlur,
  onFocus,
  required = false,
  options = [],
  children,
  className = '',
  id,
  hint = '',
  error = '',
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const inputId = id || `mui-${name}`;

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <div
      className={`mui-form-field is-floating ${isFocused ? 'is-focused' : ''} ${
        error ? 'has-error' : ''
      } ${className}`}
    >
      <div className="mui-input-container">
        <select
          id={inputId}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required={required}
          className="mui-outlined-input mui-select"
          {...props}
        >
          {children ||
            options.map((opt) => {
              const val = typeof opt === 'object' ? opt.value : opt;
              const lbl = typeof opt === 'object' ? opt.label : opt;
              return (
                <option key={val} value={val}>
                  {lbl}
                </option>
              );
            })}
        </select>
        <label htmlFor={inputId} className="mui-floating-label">
          <span>{label}</span>
          {required && <span className="mui-asterisk">*</span>}
        </label>
      </div>
      {hint && !error && <span className="mui-form-hint">{hint}</span>}
      {error && <span className="mui-form-error">{error}</span>}
    </div>
  );
}

export default MuiTextField;
