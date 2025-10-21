import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function AutocompleteInput({
  options = [],
  value,
  onChange,
  placeholder = "Type to search...",
  className,
  maxSuggestions = 8,
  disabled = false,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const containerRef = useRef(null);

  // Filter options based on input value
  useEffect(() => {
    if (!value || value.length === 0) {
      // Show all options when empty (for when user clicks/focuses)
      setFilteredOptions(options.slice(0, maxSuggestions));
      return;
    }

    const filtered = options
      .filter(option =>
        option.toLowerCase().includes(value.toLowerCase()) &&
        option.toLowerCase() !== value.toLowerCase()
      )
      .slice(0, maxSuggestions);

    setFilteredOptions(filtered);
    setHighlightedIndex(-1);
  }, [value, options, maxSuggestions]);

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || filteredOptions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSuggestionClick(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle input focus
  const handleFocus = () => {
    // Always show dropdown on focus
    setIsOpen(true);
    // If empty, show all options
    if (!value || value.length === 0) {
      setFilteredOptions(options.slice(0, maxSuggestions));
    }
  };

  // Handle input blur
  const handleBlur = (e) => {
    // Delay closing to allow click on suggestions
    setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }, 150);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex];
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [highlightedIndex]);

  return (
    <div ref={containerRef} className="relative w-full">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={cn(
          "w-full transition-all duration-200",
          isOpen && "ring-2 ring-venue-indigo/20",
          className
        )}
        disabled={disabled}
        autoComplete="off"
        {...props}
      />
      
      {/* Suggestions dropdown */}
      {isOpen && filteredOptions.length > 0 && (
        <div className={cn(
          "absolute top-full left-0 right-0 z-50 mt-1",
          "bg-white border border-gray-200 rounded-md shadow-lg",
          "max-h-60 overflow-auto",
          "animate-in fade-in-0 zoom-in-95 duration-200"
        )}>
          <ul ref={listRef} className="py-1">
            {filteredOptions.map((option, index) => (
              <li
                key={option}
                className={cn(
                  "px-3 py-2 cursor-pointer text-sm transition-colors select-none",
                  "hover:bg-gray-50 active:bg-gray-100",
                  highlightedIndex === index && "bg-gray-50 text-venue-indigo"
                )}
                onPointerDown={(e) => {
                  // Prevent input blur before selection on mouse/touch
                  e.preventDefault();
                  handleSuggestionClick(option);
                }}
                onClick={() => handleSuggestionClick(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
