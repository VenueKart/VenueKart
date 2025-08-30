import React, { useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export function ComboBox({
  options = [],
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  className,
  disabled = false
}) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchValue.toLowerCase())
  );

  const selectedOption = options.find(option => option === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between h-10 font-normal",
            !selectedOption && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          {selectedOption || placeholder}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <div className="flex items-center border-b px-3">
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="flex h-10 w-full rounded-md border-0 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div className="max-h-[200px] overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No options found.
            </div>
          ) : (
            filteredOptions.map((option) => (
              <div
                key={option}
                className={cn(
                  "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                  value === option && "bg-accent text-accent-foreground"
                )}
                onClick={() => {
                  onValueChange(option);
                  setOpen(false);
                  setSearchValue('');
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === option ? "opacity-100" : "opacity-0"
                  )}
                />
                {option}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
