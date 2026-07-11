function Placeholder({ title }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="rounded-xl border border-border bg-white px-8 py-6 text-center shadow-[var(--shadow-elevation-md)]">
        <h1 className="font-heading text-xl font-semibold text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-foreground/60">Próximamente en una fase posterior del build.</p>
      </div>
    </div>
  )
}

export default Placeholder
