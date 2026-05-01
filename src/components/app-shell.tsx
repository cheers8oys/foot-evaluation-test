import type { ReactNode } from "react";

type AppShellProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

export function AppShell({ title, description, children }: AppShellProps) {
  return (
    <main className="app-shell">
      <div className="app-shell__frame">
        <header className="app-shell__header">
          <p className="app-shell__eyebrow">Siztank</p>
          <h1 className="app-shell__title">{title}</h1>
          {description ? <p className="app-shell__description">{description}</p> : null}
        </header>
        {children ? <section className="app-shell__content">{children}</section> : null}
      </div>
    </main>
  );
}
