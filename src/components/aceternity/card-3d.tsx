"use client";
import { createContext, useContext, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Aceternity UI "3D Card Effect" – tilts toward the pointer, children float at different depths. */
const MouseEnterContext = createContext<boolean>(false);

export function CardContainer({ children, className, containerClassName }: { children: React.ReactNode; className?: string; containerClassName?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isMouseEntered, setIsMouseEntered] = useState(false);
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || document.documentElement.classList.contains("calm")) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 25;
    const y = (e.clientY - top - height / 2) / 25;
    ref.current.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
  };
  return (
    <MouseEnterContext.Provider value={isMouseEntered}>
      <div className={cn("flex items-center justify-center", containerClassName)} style={{ perspective: "1000px" }}>
        <div
          ref={ref}
          onMouseEnter={() => setIsMouseEntered(true)}
          onMouseMove={onMove}
          onMouseLeave={() => {
            setIsMouseEntered(false);
            if (ref.current) ref.current.style.transform = "rotateY(0deg) rotateX(0deg)";
          }}
          className={cn("relative flex items-center justify-center transition-all duration-200 ease-linear", className)}
          style={{ transformStyle: "preserve-3d" }}
        >
          {children}
        </div>
      </div>
    </MouseEnterContext.Provider>
  );
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("[transform-style:preserve-3d] [&>*]:[transform-style:preserve-3d]", className)}>{children}</div>;
}

export function CardItem({ children, className, translateZ = 0 }: { children: React.ReactNode; className?: string; translateZ?: number }) {
  const entered = useContext(MouseEnterContext);
  return (
    <div className={cn("w-fit transition duration-200 ease-linear", className)} style={{ transform: entered ? `translateZ(${translateZ}px)` : "translateZ(0px)" }}>
      {children}
    </div>
  );
}
