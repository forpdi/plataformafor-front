import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const Dropdown = ({
  children,
  triggerButton,
  triggerButtonWrapperStyle = {},
  isRightPosition = false,
  modalClass = '',
  style = {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const resetButtonStyle = {
    background: 'transparent',
    border: 'none',
    padding: 0,
    margin: 0,
    cursor: 'pointer',
    textAlign: 'inherit',
    font: 'inherit',
    outline: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    ...triggerButtonWrapperStyle,
  };

  return (
    <div
      className="dropdown"
      style={style}
      ref={dropdownRef}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={toggleDropdown}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleDropdown();
          }
        }}
        style={resetButtonStyle}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {triggerButton}
      </div>

      {isOpen && (
        <div
          className={`dropdown__content ${isRightPosition ? 'dropdown__content--right' : ''} ${modalClass}`}
          style={{ display: 'block' }}
        >
          <div
            onClick={() => setIsOpen(false)}
            role="presentation"
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

Dropdown.propTypes = {
  children: PropTypes.node.isRequired,
  modalClass: PropTypes.string,
  triggerButton: PropTypes.node.isRequired,
  triggerButtonWrapperStyle: PropTypes.shape({}),
  isRightPosition: PropTypes.bool,
  style: PropTypes.shape({}),
};

export default Dropdown;
