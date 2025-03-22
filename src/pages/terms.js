import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Terms() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <div className="max-w-5xl mx-auto px-6 pt-40 pb-32">
                <h1 className="text-4xl font-light mb-12 tracking-wide">Terms of Service</h1>

                <div className="space-y-8 text-gray-600">
                    <div className="mb-8">
                        <p className="text-sm mb-6">Effective Date: January 1, 2024</p>
                        <p className="leading-relaxed">
                            Welcome to Biobyte ("we", "us", or "our"). These Terms of Service ("Terms") govern your access to and use of our website and digital products. 
                            By using Biobyte, you agree to these Terms.
                        </p>
                    </div>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-light text-black mb-4">1. Use of Services</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>You must be at least 13 years old to use our platform.</li>
                            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                            <li>All digital materials purchased from Biobyte are licensed for personal, non-commercial use only.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-light text-black mb-4">2. Restrictions on Use</h2>
                        <p className="mb-2">You may not:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Share, distribute, or forward any purchased materials to others</li>
                            <li>Upload, publish, or resell our materials on any platform or website</li>
                            <li>Use our content for commercial purposes</li>
                            <li>Attempt to bypass our security or download systems</li>
                        </ul>
                        <p className="mt-4">Violating these terms may result in account suspension or legal action.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-light text-black mb-4">3. Intellectual Property</h2>
                        <p className="leading-relaxed">
                            All content on Biobyte, including study materials, designs, and branding, is the exclusive property of Biobyte. 
                            Purchasing a product does not grant ownership or redistribution rights.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-light text-black mb-4">4. Payments and Orders</h2>
                        <p className="leading-relaxed">
                            All purchases are final and non-refundable unless otherwise stated. 
                            Payments are processed securely through third-party providers (e.g., Stripe, WeChat Pay).
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-light text-black mb-4">5. Account Termination</h2>
                        <p className="leading-relaxed">
                            We reserve the right to suspend or terminate accounts that violate these Terms, 
                            or for any behavior we determine to be harmful to the platform or other users.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-light text-black mb-4">6. Disclaimer</h2>
                        <p className="leading-relaxed">
                            All materials are provided "as is" without warranty of any kind. 
                            We do not guarantee that the content will meet your academic goals or be error-free.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-light text-black mb-4">7. Changes to These Terms</h2>
                        <p className="leading-relaxed">
                            We may update these Terms at any time. Continued use of the site after changes 
                            are posted means you accept the updated Terms.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-light text-black mb-4">8. Contact</h2>
                        <p className="leading-relaxed">
                            If you have any questions about these Terms, please contact us at:{" "}
                            <a href="mailto:biomindbot@gmail.com" className="text-blue-600 hover:underline">
                                biomindbot@gmail.com
                            </a>
                        </p>
                    </section>
                </div>
            </div>
            <Footer />
        </div>
    );
}