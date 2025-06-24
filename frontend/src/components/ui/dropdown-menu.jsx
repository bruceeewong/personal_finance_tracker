import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

const DropdownMenu = ({ children }) => {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="relative">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { open, setOpen });
        }
        return child;
      })}
    </div>
  );
};

const DropdownMenuTrigger = React.forwardRef(({ className, children, asChild = false, open, setOpen, ...props }, ref) => {
  const Component = asChild ? React.Fragment : 'button';
  
  const handleClick = (e) => {
    e.preventDefault();
    setOpen?.(!open);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ref,
      onClick: handleClick,
      className: cn(children.props.className, className)
    });
  }
  
  return (
    <Component
      ref={ref}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Component>
  );
});
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

const DropdownMenuContent = React.forwardRef(({ 
  className, 
  children, 
  open, 
  setOpen, 
  align = 'center', 
  forceMount = false,
  ...props 
}, ref) => {
  const contentRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contentRef.current && !contentRef.current.contains(event.target)) {
        setOpen?.(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, setOpen]);

  if (!open && !forceMount) return null;

  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 transform -translate-x-1/2',
    end: 'right-0',
  };

  return (
    <div
      ref={(node) => {
        contentRef.current = node;
        if (ref) {
          if (typeof ref === 'function') ref(node);
          else ref.current = node;
        }
      }}
      className={cn(
        'absolute top-full mt-1 z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 text-gray-900 shadow-lg',
        alignmentClasses[align],
        className
      )}
      style={{ backgroundColor: 'white' }}
      {...props}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { open, setOpen });
        }
        return child;
      })}
    </div>
  );
});
DropdownMenuContent.displayName = 'DropdownMenuContent';

const DropdownMenuItem = React.forwardRef(({ className, inset, onClick, open, setOpen, ...props }, ref) => {
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
    // Close dropdown after clicking item
    setOpen?.(false);
  };

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors text-gray-900 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900',
        inset && 'pl-8',
        className
      )}
      onClick={handleClick}
      {...props}
    />
  );
});
DropdownMenuItem.displayName = 'DropdownMenuItem';

const DropdownMenuLabel = React.forwardRef(({ className, inset, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'px-2 py-1.5 text-sm font-semibold text-gray-900',
      inset && 'pl-8',
      className
    )}
    {...props}
  />
));
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

const DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-gray-200', className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
};