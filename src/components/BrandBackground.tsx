import React from "react";

const BrandBackground: React.FC = () => {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl opacity-30" style={{ background: "hsl(var(--brand))" }} />
      <div className="absolute top-1/3 -right-20 h-96 w-96 rounded-full blur-3xl opacity-25" style={{ background: "hsl(268 83% 62%)" }} />
      <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full blur-3xl opacity-20" style={{ background: "hsl(200 92% 55%)" }} />
    </div>
  );
};

export default BrandBackground;
