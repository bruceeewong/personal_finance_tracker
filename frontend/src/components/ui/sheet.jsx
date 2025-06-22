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

const SheetTrigger = React.forwardRef(({ className, children, asChild = false, ...props }, ref) => {
  const Component = asChild ? React.Fragment : 'button';
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ref,
      className: cn(children.props.className, className)
    });
  }
  
  return (
    <Component
      ref={ref}
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
});
SheetTrigger.displayName = 'SheetTrigger';

const SheetContent = React.forwardRef(({ side = 'right', className, children, open, onOpenChange, ...props }, ref) => {
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
    top: 'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
    bottom: 'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
    left: 'inset-y-0 left-0 h-full border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
    right: 'inset-y-0 right-0 h-full border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={() => onOpenChange?.(false)}
      />
      
      {/* Sheet content */}
      <div
        ref={ref}
        className={cn(
          'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
          sideVariants[side],
          className
        )}
        {...props}
      >
        {children}
      </div>
    </>
  );
});
SheetContent.displayName = 'SheetContent';

export { Sheet, SheetTrigger, SheetContent };