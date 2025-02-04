import React from 'react';

export default function Footer() {
    return (
        <footer className="relative bg-lightest text-darker p-8">
            <div className="pl-36 pr-36 px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {/* 快速导航 */}
                    <div>
                        <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-darkest">
                            <li><a href="#faq" className="hover:text-white">Frequently Asked Questions</a></li>
                            <li><a href="#contact" className="hover:text-white">Contact Us</a></li>
                            <li><a href="#privacy-policy" className="hover:text-white">Privacy Policy</a></li>
                        </ul>
                    </div>

                    {/* 联系我们 */}
                    <div>
                        <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-2 text-darkest">
                            <li><a href="mailto:tonytudaodao@gmail.com" className="hover:text-white">tonytudaodao@gmail.com</a></li>
                            <li><a href="tel:+1(857)205-2207" className="hover:text-white">+1 (857) 205-2207</a></li>
                            <li><a href="https://www.instagram.com/example" className="hover:text-white" target="_blank" rel="noopener noreferrer">Instagram</a></li>
                            <li><a href="https://www.facebook.com/example" className="hover:text-white" target="_blank" rel="noopener noreferrer">Facebook</a></li>
                        </ul>
                    </div>

                    {/* 版权声明 */}
                    <div className='text-darkest'>
                        <h3 className="text-xl text-darker font-semibold mb-4">Legal</h3>
                        <p>© 2025 Biomind Logic. All rights reserved.</p>
                        <p className="mt-2">Disclaimer: The content on this platform is for educational purposes only and is not affiliated with any official exam boards.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
