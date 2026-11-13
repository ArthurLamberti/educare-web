import ReactMarkdown, { type Components } from "react-markdown";

/**
 * Renders task instructions. Raw HTML is never rendered (no rehype-raw): it is shown as text, and
 * react-markdown drops unsafe link protocols such as `javascript:`. Usable in Server and Client Components.
 */
const components: Components = {
  h1: ({ children }) => <h3 className="mt-3 text-lg font-semibold">{children}</h3>,
  h2: ({ children }) => <h4 className="mt-3 text-base font-semibold">{children}</h4>,
  h3: ({ children }) => <h5 className="mt-2 font-semibold">{children}</h5>,
  p: ({ children }) => <p className="my-2">{children}</p>,
  ul: ({ children }) => <ul className="my-2 list-disc pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 list-decimal pl-6">{children}</ol>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="text-brand-600 underline">
      {children}
    </a>
  ),
  blockquote: ({ children }) => <blockquote className="my-2 border-l-4 border-ink-300 pl-3 text-ink-600 dark:border-ink-700 dark:text-ink-400">{children}</blockquote>,
  code: ({ children }) => <code className="rounded bg-ink-100 px-1 py-0.5 font-mono text-[0.9em] dark:bg-ink-800">{children}</code>,
  pre: ({ children }) => <pre className="my-2 overflow-x-auto rounded bg-ink-100 p-3 dark:bg-ink-800">{children}</pre>,
  img: ({ alt }) => <span className="text-ink-500">[imagem: {alt}]</span>,
};

export function Markdown({ children }: { children: string }) {
  return (
    <div className="text-sm leading-relaxed break-words">
      <ReactMarkdown components={components}>{children}</ReactMarkdown>
    </div>
  );
}
