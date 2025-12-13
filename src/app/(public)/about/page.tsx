import { Cpu, DollarSign, Coins, Building2 } from "lucide-react";

const team = [
    {
        name: "Jason Christian",
        role: "Founder & Editor-in-Chief",
        bio: "Passionate about technology and its intersection with finance, policy, and innovation. Dedicated to delivering insightful analysis on emerging trends.",
    },
];

const coverage = [
    { icon: Cpu, name: "AI & Machine Learning", desc: "Latest developments in artificial intelligence, LLMs, and automation" },
    { icon: DollarSign, name: "Finance", desc: "Market trends, fintech innovations, and economic analysis" },
    { icon: Coins, name: "Blockchain", desc: "Cryptocurrency, DeFi, and decentralized technologies" },
    { icon: Building2, name: "Public Affairs", desc: "Policy, regulation, and governance in the tech sector" },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
            <section className="bg-primary py-20">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-black text-inverse mb-6 animate-fadeInUp" style={{ animationFillMode: 'forwards' }}>
                        About <span className="text-accent">Chainew</span>
                    </h1>
                    <p className="text-xl text-muted animate-fadeInUp stagger-1" style={{ animationFillMode: 'forwards' }}>
                        Your trusted source for technology, finance, and policy insights since 2025.
                    </p>
                </div>
            </section>

            <section className="max-w-4xl mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-primary mb-4">Our Mission</h2>
                    <p className="text-secondary text-lg leading-relaxed">
                        Chainew bridges the gap between technology and society. We deliver thoughtful analysis
                        on artificial intelligence, blockchain innovation, financial markets, and public policy.
                        Our goal is to help readers understand not just what&apos;s happening in tech, but why it
                        matters for the world around us.
                    </p>
                </div>
            </section>

            <section className="bg-muted py-16">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-primary mb-8 text-center">What We Cover</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {coverage.map((item, index) => (
                            <div
                                key={item.name}
                                className="bg-card rounded-xl p-6 flex items-start gap-4 animate-fadeInUp"
                                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
                            >
                                <div className="p-3 rounded-lg bg-primary shrink-0">
                                    <item.icon className="text-inverse" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-primary">{item.name}</h3>
                                    <p className="text-secondary text-sm">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="max-w-4xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-primary mb-8 text-center">Our Values</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { title: "Accuracy First", desc: "We prioritize factual reporting and thorough research in every piece we publish." },
                        { title: "Clear Analysis", desc: "Complex topics explained in accessible language without sacrificing depth." },
                        { title: "Forward Thinking", desc: "We explore emerging trends and their implications for business and society." },
                    ].map((value, index) => (
                        <div
                            key={value.title}
                            className="bg-card border border-default rounded-xl p-6 hover-lift animate-fadeInUp"
                            style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
                        >
                            <h3 className="text-xl font-bold text-primary mb-2">{value.title}</h3>
                            <p className="text-secondary">{value.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-muted py-16">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-primary mb-8 text-center">Our Team</h2>
                    <div className="flex justify-center">
                        {team.map((member, index) => (
                            <div
                                key={member.name}
                                className="bg-card border border-default rounded-xl p-6 hover-lift animate-fadeInUp max-w-md"
                                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
                            >
                                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-inverse text-xl font-bold mb-4">
                                    {member.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <h3 className="text-lg font-bold text-primary">{member.name}</h3>
                                <p className="text-accent text-sm mb-2">{member.role}</p>
                                <p className="text-secondary text-sm">{member.bio}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
