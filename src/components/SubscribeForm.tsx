"use client";

export default function SubscribeForm() {
  return (
    <div id="subscribe" className="px-5 pt-[34px] pb-[44px] md:pt-[42px] md:pb-[52px]">
      <span className="type-label text-[var(--color-text-secondary)] block pb-1">
        Subscribe
      </span>
      <p className="type-body text-[var(--color-text-secondary)] mb-4 mt-1">
        Stay informed on bold ideas for Canada.
      </p>
      <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="First Name"
            className="border border-[var(--color-border-light)] bg-transparent px-3 py-2.5 type-body placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-dark)] transition-colors"
          />
          <input
            type="text"
            placeholder="Last Name"
            className="border border-[var(--color-border-light)] bg-transparent px-3 py-2.5 type-body placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-dark)] transition-colors"
          />
        </div>
        <input
          type="email"
          placeholder="Email"
          className="border border-[var(--color-border-light)] bg-transparent px-3 py-2.5 type-body placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-dark)] transition-colors"
        />
        <input
          type="text"
          placeholder="Postal Code"
          className="border border-[var(--color-border-light)] bg-transparent px-3 py-2.5 type-body placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-dark)] transition-colors"
        />
        <button
          type="submit"
          className="bg-[var(--color-dark)] text-[var(--color-bg)] type-label px-5 py-3 hover:bg-[var(--color-accent)] transition-colors self-start"
        >
          Subscribe
        </button>
      </form>
    </div>
  );
}
