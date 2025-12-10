"use client";

import { useState } from "react";
import { Send, MessageSquare } from "lucide-react";

const GitHubIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" role="img" aria-label="GitHub">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
);

const LinkedInIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" role="img" aria-label="LinkedIn">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);

const InstagramIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" role="img" aria-label="Instagram">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
);

const XIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" role="img" aria-label="X (Twitter)">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const socialLinks = [
    {
        name: "GitHub",
        icon: GitHubIcon,
        url: "https://github.com/aljasonch",
        color: "bg-[#333] hover:bg-[#24292e]",
    },
    {
        name: "LinkedIn",
        icon: LinkedInIcon,
        url: "https://linkedin.com/in/aljasonch",
        color: "bg-[#0077B5] hover:bg-[#006399]",
    },
    {
        name: "Instagram",
        icon: InstagramIcon,
        url: "https://instagram.com/aljasonch",
        color: "bg-gradient-to-br from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90",
    },
    {
        name: "X (Twitter)",
        icon: XIcon,
        url: "https://x.com/aljasonch",
        color: "bg-[#000] hover:bg-[#1a1a1a]",
    },
];

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setFormData({ name: "", email: "", subject: "", message: "" });
        }, 3000);
    };

    return (
        <div className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
            <section className="bg-primary py-20">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <MessageSquare className="mx-auto mb-4 text-muted" size={48} />
                    <h1 className="text-4xl md:text-5xl font-black text-inverse mb-4 animate-fadeInUp" style={{ animationFillMode: 'forwards' }}>
                        Get in Touch
                    </h1>
                    <p className="text-muted text-lg animate-fadeInUp stagger-1" style={{ animationFillMode: 'forwards' }}>
                        Have a story tip, feedback, or just want to say hello? We&apos;d love to hear from you.
                    </p>
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-4 py-16">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-primary mb-6">Connect With Us</h2>

                        <div className="space-y-4">
                            {socialLinks.map((social, index) => (
                                <a
                                    key={social.name}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-4 p-4 rounded-xl text-white transition-all duration-200 hover-lift animate-fadeInUp ${social.color}`}
                                    style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
                                >
                                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                                        <social.icon />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{social.name}</h3>
                                        <p className="text-white/70 text-sm">Follow us</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <div className="bg-card border border-default rounded-xl p-8 animate-fadeInUp" style={{ animationFillMode: 'forwards' }}>
                            <h2 className="text-2xl font-bold text-primary mb-6">Send us a Message</h2>

                            {submitted ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Send className="text-green-600" size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-primary mb-2">Message Sent!</h3>
                                    <p className="text-secondary">Thank you for reaching out. We&apos;ll get back to you soon.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-primary mb-2">Name</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-4 py-3 bg-card border border-default rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all text-primary"
                                                placeholder="Your name"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-primary mb-2">Email</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full px-4 py-3 bg-card border border-default rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all text-primary"
                                                placeholder="your@email.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-primary mb-2">Subject</label>
                                        <input
                                            type="text"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full px-4 py-3 bg-card border border-default rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all text-primary"
                                            placeholder="What's this about?"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-primary mb-2">Message</label>
                                        <textarea
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            rows={5}
                                            className="w-full px-4 py-3 bg-card border border-default rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all resize-none text-primary"
                                            placeholder="Your message..."
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                                    >
                                        <Send size={18} />
                                        Send Message
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
