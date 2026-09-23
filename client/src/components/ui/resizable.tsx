import * as React from "react";
import { GripVerticalIcon } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "@/lib/utils";

// react-resizable-panels v4 renamed components and props:
//   PanelGroup -> Group, PanelResizeHandle -> Separator (Panel unchanged)
//   direction -> orientation; Panel defaultSize numbers are now PIXELS
//   (strings are percent). This wrapper preserves the previous shadcn-style
//   API (direction prop; numeric defaultSize = percent) so existing
//   consumers (ComponentShowcase) keep working unchanged.
const { Group, Panel, Separator } = ResizablePrimitive;

type ResizablePanelGroupProps = React.ComponentProps<typeof Group> & {
  /** v3-style direction prop, mapped onto v4's `orientation`. */
  direction?: "horizontal" | "vertical";
};

function ResizablePanelGroup({
  className,
  direction,
  ...props
}: ResizablePanelGroupProps) {
  return (
    <Group
      data-slot="resizable-panel-group"
      orientation={direction}
      className={cn(
        "flex h-full w-full data-[panel-group-orientation=vertical]:flex-col",
        className
      )}
      {...props}
    />
  );
}

type ResizablePanelProps = Omit<
  React.ComponentProps<typeof Panel>,
  "defaultSize"
> & {
  /** v3-style percent when given a number; strings pass through as-is. */
  defaultSize?: number | string;
};

function ResizablePanel({ defaultSize, ...props }: ResizablePanelProps) {
  return (
    <Panel
      data-slot="resizable-panel"
      defaultSize={typeof defaultSize === "number" ? `${defaultSize}` : defaultSize}
      {...props}
    />
  );
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof Separator> & {
  withHandle?: boolean;
}) {
  return (
    <Separator
      data-slot="resizable-handle"
      className={cn(
        "bg-border focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[panel-group-orientation=vertical]:h-px data-[panel-group-orientation=vertical]:w-full data-[panel-group-orientation=vertical]:after:left-0 data-[panel-group-orientation=vertical]:after:h-1 data-[panel-group-orientation=vertical]:after:w-full data-[panel-group-orientation=vertical]:after:translate-x-0 data-[panel-group-orientation=vertical]:after:-translate-y-1/2 [&[data-panel-group-orientation=vertical]>div]:rotate-90",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border">
          <GripVerticalIcon className="size-2.5" />
        </div>
      )}
    </Separator>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
