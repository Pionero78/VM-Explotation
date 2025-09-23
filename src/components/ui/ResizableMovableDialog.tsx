import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;
const DialogPortal = DialogPrimitive.Portal;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface ResizableMovableDialogProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  minWidth?: number;
  minHeight?: number;
}

const ResizableMovableDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ResizableMovableDialogProps
>(({ className, children, minWidth = 400, minHeight = 300, ...props }, ref) => {
  const isMobile = useIsMobile();
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({ width: props.style?.width || 640, height: props.style?.height || 480 });
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    // Center the dialog on initial render
    if (dialogRef.current) {
      const { innerWidth, innerHeight } = window;
      setPosition({
        x: Math.max(0, (innerWidth - Number(size.width)) / 2),
        y: Math.max(0, (innerHeight - Number(size.height)) / 2),
      });
    }
  }, [size.width, size.height]);

  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>, action: string) => {
      e.preventDefault();
      const startPos = { x: e.clientX, y: e.clientY };
      const startSize = size;
      const startPosition = position;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - startPos.x;
        const dy = moveEvent.clientY - startPos.y;
        const { innerWidth, innerHeight } = window;

        let newWidth = startSize.width as number;
        let newHeight = startSize.height as number;
        let newX = startPosition.x;
        let newY = startPosition.y;

        // Movement
        if (action === 'move') {
          newX = startPosition.x + dx;
          newY = startPosition.y + dy;
        }

        // Resizing
        if (action.includes('r')) newWidth = startSize.width as number + dx;
        if (action.includes('l')) {
          newWidth = startSize.width as number - dx;
          newX = startPosition.x + dx;
        }
        if (action.includes('b')) newHeight = startSize.height as number + dy;
        if (action.includes('t')) {
          newHeight = startSize.height as number - dy;
          newY = startPosition.y + dy;
        }

        // Apply constraints
        if (newWidth < minWidth) {
          if (action.includes('l')) newX = startPosition.x + (startSize.width as number - minWidth);
          newWidth = minWidth;
        }
        if (newHeight < minHeight) {
          if (action.includes('t')) newY = startPosition.y + (startSize.height as number - minHeight);
          newHeight = minHeight;
        }

        // Viewport boundary constraints
        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        if (newX + newWidth > innerWidth) newWidth = innerWidth - newX;
        if (newY + newHeight > innerHeight) newHeight = innerHeight - newY;


        setSize({ width: newWidth, height: newHeight });
        setPosition({ x: newX, y: newY });
      };

      const handleMouseUp = () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [minHeight, minWidth, position, size]
  );

  const handleClasses = "absolute bg-transparent";
  const handleSize = "8px";

  if (isMobile) {
    return (
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          ref={ref}
          className={cn("fixed inset-0 z-50 h-screen w-screen border-none bg-background p-0", className)}
          {...props}
        >
          <div className="h-full w-full">{children}</div>
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  }

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={dialogRef}
        style={{
          width: size.width,
          height: size.height,
          left: position.x,
          top: position.y,
          transform: 'none'
        }}
        className={cn(
          "fixed z-50 grid gap-4 overflow-hidden border bg-background p-0 shadow-lg",
          className
        )}
        {...props}
      >
        {/* Resize Handles */}
        <div onMouseDown={(e) => handleMouseDown(e, 't')} className={cn(handleClasses, 'cursor-ns-resize h-2 top-0 left-0 right-0')} style={{ top: `-${handleSize}`, height: handleSize }} />
        <div onMouseDown={(e) => handleMouseDown(e, 'b')} className={cn(handleClasses, 'cursor-ns-resize h-2 bottom-0 left-0 right-0')} style={{ bottom: `-${handleSize}`, height: handleSize }} />
        <div onMouseDown={(e) => handleMouseDown(e, 'l')} className={cn(handleClasses, 'cursor-ew-resize w-2 top-0 bottom-0 left-0')} style={{ left: `-${handleSize}`, width: handleSize }} />
        <div onMouseDown={(e) => handleMouseDown(e, 'r')} className={cn(handleClasses, 'cursor-ew-resize w-2 top-0 bottom-0 right-0')} style={{ right: `-${handleSize}`, width: handleSize }} />
        <div onMouseDown={(e) => handleMouseDown(e, 'tl')} className={cn(handleClasses, 'cursor-nwse-resize w-4 h-4 top-0 left-0')} style={{ top: `-${handleSize}`, left: `-${handleSize}` }} />
        <div onMouseDown={(e) => handleMouseDown(e, 'tr')} className={cn(handleClasses, 'cursor-nesw-resize w-4 h-4 top-0 right-0')} style={{ top: `-${handleSize}`, right: `-${handleSize}` }} />
        <div onMouseDown={(e) => handleMouseDown(e, 'bl')} className={cn(handleClasses, 'cursor-nesw-resize w-4 h-4 bottom-0 left-0')} style={{ bottom: `-${handleSize}`, left: `-${handleSize}` }} />
        <div onMouseDown={(e) => handleMouseDown(e, 'br')} className={cn(handleClasses, 'cursor-nwse-resize w-4 h-4 bottom-0 right-0')} style={{ bottom: `-${handleSize}`, right: `-${handleSize}` }} />

        <div className="flex h-full flex-col">
            {React.Children.map(children, child => {
                if (React.isValidElement(child) && child.type === DialogHeader) {
                    return React.cloneElement(child as React.ReactElement<{ className?: string }>, {
                        onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => handleMouseDown(e, 'move'),
                        className: cn(child.props.className, 'cursor-move'),
                    });
                }
                return child;
            })}
        </div>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
ResizableMovableDialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-1.5 p-6 pb-2", className)}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";


const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-auto flex flex-col-reverse gap-2 p-6 sm:flex-row sm:justify-end", className)}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("p-6 pt-0 text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogClose,
  DialogOverlay,
  ResizableMovableDialogContent as DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
