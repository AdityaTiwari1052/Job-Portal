import * as React from 'react';
import { cva } from 'class-variance-authority';

const separatorVariants = cva('shrink-0 bg-border', {
  variants: {
    orientation: {
      horizontal: 'h-[1px] w-full',
      vertical: 'h-full w-[1px]',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

const Separator = React.forwardRef(({ 
  className, 
  orientation = 'horizontal', 
  decorative = true, 
  ...props 
}, ref) => (
  <div
    ref={ref}
    role={decorative ? 'none' : 'separator'}
    aria-orientation={orientation}
    className={separatorVariants({ orientation, className })}
    {...props}
  />
));

Separator.displayName = 'Separator';

export { Separator };

export default Separator;
