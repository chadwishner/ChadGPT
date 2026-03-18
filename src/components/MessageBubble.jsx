export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <article className="w-full pt-3" dir="auto">
        <div className="max-w-[40rem] lg:max-w-[48rem] mx-auto">
          <div className="flex flex-col items-end gap-2">
            {message.attachmentUrl && (
              <div className="max-w-[70%]">
                <Attachment url={message.attachmentUrl} type={message.attachmentType} />
              </div>
            )}
            {message.content && !message.attachmentUrl && (
              <div className="user-bubble bg-[var(--user-bubble)] px-4 py-2.5 leading-6 max-w-[70%]">
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="w-full pb-10" dir="auto">
      <div className="max-w-[40rem] lg:max-w-[48rem] mx-auto">
        <div className="flex flex-col gap-4">
          <div className="min-h-8 flex flex-col items-start gap-2 break-words whitespace-normal">
            {message.attachmentUrl && (
              <Attachment url={message.attachmentUrl} type={message.attachmentType} />
            )}
            {message.content && (
              <div className="w-full">
                <div className="prose prose-invert w-full break-words">
                  <p>{message.content}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function Attachment({ url, type }) {
  if (type === "image") {
    return (
      <img
        src={url}
        alt="Uploaded image"
        className="rounded-2xl max-h-80 object-contain"
        loading="lazy"
      />
    );
  }

  if (type === "pdf") {
    const filename = url.split("/").pop();
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[var(--bg-tertiary)] hover:bg-[var(--surface-hover)] transition-colors no-underline"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red-400 shrink-0">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <div className="min-w-0">
          <div className="text-sm text-[var(--text-primary)] truncate">{filename}</div>
          <div className="text-xs text-[var(--text-secondary)]">PDF</div>
        </div>
      </a>
    );
  }

  return null;
}
