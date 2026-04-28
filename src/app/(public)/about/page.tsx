import Link from "next/link";

const focusAreas = ["Tech", "Finance", "Blockchain", "Public Affairs"];

const principles = [
    "Clear reporting over noise.",
    "Useful context over empty hype.",
    "A calm, readable view of fast-moving sectors.",
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)]">
            <section className="border-b border-default">
                <div className="mx-auto max-w-4xl px-4 py-14 md:px-6 md:py-18">
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">About Chainew</p>
                    <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-primary md:text-5xl">
                        Clear reporting on technology, markets, and policy.
                    </h1>
                    <p className="mt-6 max-w-2xl text-base leading-8 text-secondary md:text-lg">
                        Chainew is a simple newsroom built around one idea: explain what matters without making readers work for it. We cover major shifts in Tech, finance, blockchain, and public affairs with a focus on clarity, relevance, and context.
                    </p>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-secondary md:text-base">
                        Some coverage is powered by NeuraFeed, our news intelligence feed from Neuraspheres. More info: <a href="https://feed.neuraspheres.com/" target="_blank" rel="noreferrer" className="font-semibold text-primary underline decoration-default underline-offset-4 hover:text-secondary">feed.neuraspheres.com</a>.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                            href="/latest"
                            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-secondary"
                        >
                            Read latest stories
                        </Link>
                        <Link
                            href="/contact"
                            className="inline-flex items-center justify-center rounded-full border border-default px-5 py-3 text-sm font-semibold text-primary transition-colors hover:border-hover hover:bg-muted/50"
                        >
                            Contact us
                        </Link>
                    </div>
                </div>
            </section>

            <section className="mx-auto grid max-w-4xl gap-10 px-4 py-14 md:px-6 md:py-18 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                    <h2 className="text-2xl font-black text-primary md:text-3xl">What we focus on</h2>
                    <p className="mt-4 max-w-2xl text-base leading-8 text-secondary">
                        We track the areas where business, software, and public decision-making overlap. The goal is not more volume. The goal is better signal.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                        {focusAreas.map((area) => (
                            <span
                                key={area}
                                className="rounded-full border border-default bg-card px-4 py-2 text-sm font-semibold text-primary"
                            >
                                {area}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="rounded-3xl border border-default bg-card p-6">
                    <h2 className="text-2xl font-black text-primary">How we work</h2>
                    <div className="mt-5 space-y-4">
                        {principles.map((principle) => (
                            <div key={principle} className="border-b border-default pb-4 last:border-b-0 last:pb-0">
                                <p className="text-sm leading-7 text-secondary md:text-base">{principle}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="border-t border-default bg-card">
                <div className="mx-auto max-w-4xl px-4 py-14 md:px-6 md:py-18">
                    <h2 className="text-2xl font-black text-primary md:text-3xl">Why this exists</h2>
                    <div className="mt-5 space-y-5 text-base leading-8 text-secondary">
                        <p>
                            Too much coverage is fast but forgettable. Chainew aims to be readable, direct, and useful for people who want to understand what changed and why it matters.
                        </p>
                        <p>
                            That means concise writing, stronger editorial judgment, and a quieter design that keeps attention on the reporting.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
