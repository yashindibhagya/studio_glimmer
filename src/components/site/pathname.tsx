"use client";

import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

function Watcher({ onChange }: { onChange: (pathname: string) => void }) {
  const pathname = usePathname();
  const cb = useRef(onChange);
  useEffect(() => {
    cb.current = onChange;
  });
  useEffect(() => {
    cb.current(pathname);
  }, [pathname]);
  return null;
}

/** Runs `onChange` after every navigation. Suspense keeps prerendering static. */
export function OnNavigate({ onChange }: { onChange: (pathname: string) => void }) {
  return (
    <Suspense fallback={null}>
      <Watcher onChange={onChange} />
    </Suspense>
  );
}

function WithPath({ render }: { render: (pathname: string) => React.ReactNode }) {
  return <>{render(usePathname())}</>;
}

/** Renders with the current pathname; falls back to rendering with "" while prerendering. */
export function PathnameRender({ render }: { render: (pathname: string) => React.ReactNode }) {
  return (
    <Suspense fallback={render("")}>
      <WithPath render={render} />
    </Suspense>
  );
}
