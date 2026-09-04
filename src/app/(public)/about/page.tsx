import Link from "next/link";

const focusAreas = ["Tech", "Finance", "Blockchain", "Public Affairs"];

const principles = [
    "Clear reporting over noise.",
    "Useful context over empty hype.",
    "A calm, readable view of fast-moving sectors.",
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            <section className="border-b border-neutral-200">
                <div className="mx-auto max-w-3xl px-4 py-14 md:py-16">
                    <p className="kicker">About Chainew</p>
                    <h1 className="font-display mt-4 max-w-3xl text-4xl font-black leading-tight text-neutral-900 md:text-5xl">
                        Clear reporting on technology, markets, and policy.
                    </h1>
                    <p className="mt-6 max-w-2xl text-base leading-8 text-neutral-700 md:text-lg">
                        Chainew is a simple newsroom built around one idea: explain what matters without making readers work for it. We cover major shifts in Tech, finance, blockchain, and public affairs with a focus on clarity, relevance, and context.
                    </p>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600 md:text-base">
                        Some coverage is powered by NeuraFeed, our news intelligence feed from Neuraspheres. More info: <a href="https://feed.neuraspheres.com/" target="_blank" rel="noreferrer" className="font-semibold text-neutral-900 underline underline-offset-4">feed.neuraspheres.com</a>.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                            href="/latest"
                            className="inline-flex items-center justify-center border border-neutral-900 bg-neutral-900 px-5 py-3 text-sm font-semibold text-white hover:bg-black"
                        >
                            Read latest stories
                        </Link>
                        <Link
                            href="/contact"
                            className="inline-flex items-center justify-center border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-900 hover:border-neutral-900"
                        >
                            Contact us
                        </Link>
                    </div>
                </div>
            </section>

            <section className="mx-auto grid max-w-3xl gap-10 px-4 py-14 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                    <h2 className="font-display text-2xl font-bold text-neutral-900">What we focus on</h2>
                    <p className="mt-4 max-w-2xl text-base leading-8 text-neutral-700">
                        We track the areas where business, software, and public decision-making overlap. The goal is not more volume. The goal is better signal.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                        {focusAreas.map((area) => (
                            <span
                                key={area}
                                className="text-sm font-semibold uppercase tracking-[0.12em] text-neutral-700"
                            >
                                {area}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="border-t-2 border-neutral-900 pt-5">
                    <h2 className="font-display text-2xl font-bold text-neutral-900">How we work</h2>
                    <div className="mt-5 space-y-4">
                        {principles.map((principle) => (
                            <div key={principle} className="border-b border-neutral-200 pb-4 last:border-b-0 last:pb-0">
                                <p className="text-sm leading-7 text-neutral-700 md:text-base">{principle}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="border-t border-neutral-200">
                <div className="mx-auto max-w-3xl px-4 py-14">
                    <h2 className="font-display text-2xl font-bold text-neutral-900">Why this exists</h2>
                    <div className="mt-5 space-y-5 text-base leading-8 text-neutral-700">
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
