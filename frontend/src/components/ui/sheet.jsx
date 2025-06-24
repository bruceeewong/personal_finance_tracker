import React from 'react';
import { cn } from '../../lib/utils';

const Sheet = ({ children, open, onOpenChange }) => {
  return (
    <div>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { open, onOpenChange });
        }
        return child;
      })}
    </div>
  );
};

const SheetTrigger = React.forwardRef(({ className, children, asChild = false, open, onOpenChange, ...props }, ref) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenChange?.(!open);
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
    <button
      ref={ref}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
});
SheetTrigger.displayName = 'SheetTrigger';

const SheetContent = React.forwardRef(({ 
  side = 'right', 
  className, 
  children, 
  open, 
  onOpenChange, 
  ...props 
}, ref) => {
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && open) {
        onOpenChange?.(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const sideVariants = {
    top: 'inset-x-0 top-0 border-b translate-y-0',
    bottom: 'inset-x-0 bottom-0 border-t translate-y-0', 
    left: 'inset-y-0 left-0 h-full border-r translate-x-0',
    right: 'inset-y-0 right-0 h-full border-l translate-x-0',
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange?.(false)}
      />
      
      {/* Sheet content */}
      <div
        ref={ref}
        className={cn(
          'fixed z-50 bg-white border-r border-gray-200 shadow-xl transition-transform duration-300 ease-in-out',
          sideVariants[side],
          className
        )}
        style={{ backgroundColor: 'white' }}
        {...props}
      >
        {children}
      </div>
    </>
  );
});
SheetContent.displayName = 'SheetContent';

export { Sheet, SheetTrigger, SheetContent };