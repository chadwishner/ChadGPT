export default function Header({ onNewChat }) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--bg-tertiary)]">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold">ChadGPT</span>
        <span className="text-xs bg-[var(--accent)] text-white px-2 py-0.5 rounded-full">
          Human
        </span>
      </div>
      <button
        onClick={onNewChat}
        className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--bg-tertiary)]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
        New chat
      </button>
    </header>
  );
}
