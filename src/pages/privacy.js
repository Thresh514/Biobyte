import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Privacy() {
    return(
        <div className="min-h-screen bg-white">
            <Navbar/>
            <div className="max-w-5xl mx-auto px-6 pt-40 pb-32">
                <h1 className="text-4xl font-light mb-12 tracking-wide">Privacy Policy</h1>
                
                <div className="space-y-8 text-gray-600">
                    <div className="mb-8">
                        <p className="text-sm mb-6">Effective Date: January 1, 2024</p>
                        <p className="leading-relaxed">
                            Welcome to Biobyte ("we", "our", or "this site"). We respect your privacy and are committed to protecting your personal data. 
                            This Privacy Policy explains what information we collect, how we use it, and your rights regarding your personal information.
                        </p>
                    </div>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-light text-black mb-4">1. Information We Collect</h2>
                        <p className="mb-2">We only collect the minimum necessary data to provide our services, including:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Email address (for account registration and order notifications)</li>
                            <li>Order history (records of the study materials you purchased)</li>
                            <li>Login activity (such as username and last login time)</li>
                            <li>Payment data (processed securely by third-party providers; we do not store any payment credentials)</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-light text-black mb-4">2. How We Use Your Information</h2>
                        <p className="mb-2">We use your information to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Create and manage your user account</li>
                            <li>Process and deliver your orders</li>
                            <li>Send you order confirmations and support-related communication</li>
                            <li>Improve the functionality and quality of our website and services</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-light text-black mb-4">3. Third-party Services</h2>
                        <p className="leading-relaxed">
                            We may use third-party services such as Stripe or WeChat Pay to process payments. 
                            These services handle your payment information independently and securely. 
                            We do not store any card or payment information on our servers.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-light text-black mb-4">4. Your Rights</h2>
                        <p className="mb-2">You have the right to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Update or delete your account details</li>
                            <li>Request access to the data we hold about you</li>
                            <li>Request permanent deletion of your account and related data</li>
                        </ul>
                        <p className="mt-4">
                            To exercise these rights, please contact us at{" "}
                            <a href="mailto:biomindbot@gmail.com" className="text-blue-600 hover:underline">
                                biomindbot@gmail.com
                            </a>
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-light text-black mb-4">5. Data Security</h2>
                        <p className="leading-relaxed">
                            We take reasonable technical and organizational measures to protect your personal data 
                            from unauthorized access, disclosure, alteration, or destruction.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-light text-black mb-4">6. Changes to This Policy</h2>
                        <p className="leading-relaxed">
                            We may update this Privacy Policy from time to time. The most current version will 
                            always be available on this page, along with the updated effective date.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-light text-black mb-4">7. Contact Us</h2>
                        <p className="leading-relaxed">
                            If you have any questions or concerns regarding this Privacy Policy, please contact us at:{" "}
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