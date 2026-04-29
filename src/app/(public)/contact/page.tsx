import Link from "next/link";

const contactWays = [
    {
        title: "Editorial",
        description: "For story ideas, corrections, partnerships, or general questions.",
        value: "Coming soon",
        // href: "mailto:hello@chainew.com",
    },
    {
        title: "NeuraFeed",
        description: "For questions about the feed powering selected coverage.",
        value: "feed.neuraspheres.com",
        href: "https://feed.neuraspheres.com/",
    },
];

const socialLinks = [
    { name: "GitHub", href: "https://github.com/aljasonch" },
    { name: "LinkedIn", href: "https://linkedin.com/in/aljasonch" },
    { name: "Instagram", href: "https://instagram.com/aljasonch" },
    { name: "X", href: "https://x.com/aljasonch" },
];

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-[color:var(--color-bg-primary)]">
            <section className="border-b border-default">
                <div className="mx-auto max-w-4xl px-4 py-14 md:px-6 md:py-18">
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">Contact</p>
                    <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-primary md:text-5xl">
                        Reach the newsroom directly.
                    </h1>
                    <p className="mt-6 max-w-2xl text-base leading-8 text-secondary md:text-lg">
                        If you have a story tip, a correction, a partnership request, or a general question, send it through directly. We keep the contact page simple for the same reason we keep the reporting simple.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <a
                            href="mailto:hello@chainew.com"
                            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-secondary"
                        >
                            Email Chainew
                        </a>
                        <Link
                            href="/about"
                            className="inline-flex items-center justify-center rounded-full border border-default px-5 py-3 text-sm font-semibold text-primary transition-colors hover:border-hover hover:bg-muted/50"
                        >
                            About Chainew
                        </Link>
                    </div>
                </div>
            </section>

            <section className="mx-auto grid max-w-4xl gap-10 px-4 py-14 md:px-6 md:py-18 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                    <h2 className="text-2xl font-black text-primary md:text-3xl">Where to reach us</h2>
                    <div className="mt-6 space-y-4">
                        {contactWays.map((item) => (
                            <div key={item.title} className="rounded-3xl border border-default bg-card p-6">
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">{item.title}</p>
                                <p className="mt-3 text-sm leading-7 text-secondary md:text-base">{item.description}</p>
                                <a
                                    href={item.href}
                                    target={item.href.startsWith("http") ? "_blank" : undefined}
                                    rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                                    className="mt-4 inline-flex font-semibold text-primary underline decoration-default underline-offset-4 hover:text-secondary"
                                >
                                    {item.value}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-3xl border border-default bg-card p-6">
                    <h2 className="text-2xl font-black text-primary">Elsewhere</h2>
                    <p className="mt-4 text-sm leading-7 text-secondary md:text-base">
                        Follow updates or reach out through the public profiles below.
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        {socialLinks.map((social) => (
                            <a
                                key={social.name}
                                href={social.href}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-2xl border border-default px-4 py-4 text-sm font-semibold text-primary transition-colors hover:border-hover hover:bg-muted/50"
                            >
                                {social.name}
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            <section className="border-t border-default bg-card">
                <div className="mx-auto max-w-4xl px-4 py-14 md:px-6 md:py-18">
                    <h2 className="text-2xl font-black text-primary md:text-3xl">What to send</h2>
                    <div className="mt-5 space-y-5 text-base leading-8 text-secondary">
                        <p>
                            The most useful messages are specific. Include the link, source, person, or event you want us to look at, and explain why it matters.
                        </p>
                        <p>
                            If your note is about NeuraFeed, include the article topic or feed detail so it can be routed quickly.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
