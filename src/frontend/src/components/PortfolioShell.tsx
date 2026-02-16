import { type ReactNode } from 'react';

interface PortfolioShellProps {
  children: ReactNode;
}

export default function PortfolioShell({ children }: PortfolioShellProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image Layer with Dimming */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/bg.png), url(/assets/generated/bg.dim_1920x1080.png)',
          filter: 'brightness(0.4)',
        }}
      />

      {/* Content Layer */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
