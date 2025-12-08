"use client";

import { useState } from "react";
import { Mail, MapPin, Phone, Send, MessageSquare } from "lucide-react";

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
            <section className="bg-accent py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <MessageSquare className="mx-auto mb-4 text-inverse" size={48} />
                    <h1 className="text-4xl md:text-5xl font-black text-inverse mb-4 animate-fadeInUp" style={{ animationFillMode: 'forwards' }}>
                        Get in Touch
                    </h1>
                    <p className="text-inverse/80 text-lg animate-fadeInUp stagger-1" style={{ animationFillMode: 'forwards' }}>
                        Have a story tip, feedback, or just want to say hello? We&apos;d love to hear from you.
                    </p>
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-4 py-16">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-primary mb-6">Contact Information</h2>

                        <div className="flex items-start gap-4 animate-fadeInUp" style={{ animationFillMode: 'forwards' }}>
                            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center shrink-0">
                                <Mail className="text-inverse" size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-primary">Email</h3>
                                <p className="text-secondary">hello@chainew.com</p>
                                <p className="text-secondary">press@chainew.com</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 animate-fadeInUp stagger-1" style={{ animationFillMode: 'forwards' }}>
                            <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center shrink-0">
                                <MapPin className="text-inverse" size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-primary">Office</h3>
                                <p className="text-secondary">123 News Street</p>
                                <p className="text-secondary">Jakarta, Indonesia 12345</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 animate-fadeInUp stagger-2" style={{ animationFillMode: 'forwards' }}>
                            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center shrink-0">
                                <Phone className="text-inverse" size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-primary">Phone</h3>
                                <p className="text-secondary">+62 21 1234 5678</p>
                                <p className="text-secondary text-sm">Mon-Fri 9AM-6PM WIB</p>
                            </div>
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
                                                className="w-full px-4 py-3 border border-default rounded-lg focus:border-primary focus:outline-none transition-colors"
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
                                                className="w-full px-4 py-3 border border-default rounded-lg focus:border-primary focus:outline-none transition-colors"
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
                                            className="w-full px-4 py-3 border border-default rounded-lg focus:border-primary focus:outline-none transition-colors"
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
                                            className="w-full px-4 py-3 border border-default rounded-lg focus:border-primary focus:outline-none transition-colors resize-none"
                                            placeholder="Your message..."
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn-primary w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
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
