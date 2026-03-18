export default function Header({ onNewChat }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-3 py-2 bg-[var(--bg-primary)]">
      <div className="flex flex-1 items-center">
        <span className="flex items-center min-h-9 px-2.5 text-lg font-semibold tracking-[-0.015em] whitespace-nowrap">
          ChadGPT
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--surface-hover)]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New chat
        </button>
      </div>
    </header>
  );
}
