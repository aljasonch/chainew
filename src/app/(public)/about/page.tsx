import { Users, Target, Award, Globe, Cpu, Code, Shield, Zap } from "lucide-react";

const stats = [
    { icon: Users, value: "50K+", label: "Tech Readers" },
    { icon: Target, value: "500+", label: "Tech Articles" },
    { icon: Award, value: "50+", label: "Expert Writers" },
    { icon: Globe, value: "100+", label: "Countries" },
];

const team = [
    {
        name: "Alfonsus Jason Christian",
        role: "Founder & Editor-in-Chief",
        bio: "",
    },
];

const coverage = [
    { icon: Cpu, name: "AI & Machine Learning", desc: "LLMs, deep learning, generative AI" },
    { icon: Code, name: "Software Development", desc: "Languages, frameworks, best practices" },
    { icon: Shield, name: "Cybersecurity", desc: "Threats, vulnerabilities, defense" },
    { icon: Zap, name: "Startups & Innovation", desc: "Funding, products, disruption" },
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
                        Your trusted source for cutting-edge tech news, developer insights, and industry analysis since 2024.
                    </p>
                </div>
            </section>

            <section className="max-w-4xl mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-primary mb-4">Our Mission</h2>
                    <p className="text-secondary text-lg leading-relaxed">
                        At Chainew, we believe technology shapes the future. Our mission is to deliver accurate,
                        insightful, and timely tech coverage that helps developers, engineers, and tech enthusiasts
                        stay ahead of the curve. From AI breakthroughs to security vulnerabilities, from startup
                        success stories to the latest programming frameworks – we cover it all.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                    {stats.map((stat, index) => (
                        <div
                            key={stat.label}
                            className="bg-card border border-default rounded-xl p-6 text-center hover-lift animate-fadeInUp"
                            style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
                        >
                            <stat.icon className="mx-auto mb-3 text-accent" size={32} />
                            <p className="text-3xl font-bold text-primary">{stat.value}</p>
                            <p className="text-sm text-secondary mt-1">{stat.label}</p>
                        </div>
                    ))}
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
                        { title: "Technical Accuracy", desc: "Every article is reviewed by domain experts to ensure technical correctness." },
                        { title: "Developer First", desc: "We write for developers, by developers. No clickbait, just quality content." },
                        { title: "Cutting Edge", desc: "We cover emerging tech before it becomes mainstream, keeping you ahead." },
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
                    <div className="grid md:grid-cols-2 gap-6">
                        {team.map((member, index) => (
                            <div
                                key={member.name}
                                className="bg-card border border-default rounded-xl p-6 hover-lift animate-fadeInUp"
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
