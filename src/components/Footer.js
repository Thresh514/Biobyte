import React from 'react';

export default function Footer() {
    return (
        <footer className="relative bg-lightest text-darker flex items-center justify-center px-8 md:px-12 mt-24 mb-8">
            <div className="max-w-7xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8 lg:gap-32">
                    {/* 快速导航 */}
                    <div>
                        <h3 className="text-lg sm:text-xl font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-gray-600 text-sm sm:text-base md:text-md lg:text-lg ">
                            <li><a href="#faq" className="hover:text-black">Frequently Asked Questions</a></li>
                            <li><a href="#contact" className="hover:text-black">Contact Us</a></li>
                            <li><a href="#privacy-policy" className="hover:text-black">Privacy Policy</a></li>
                        </ul>
                    </div>

                    {/* 联系我们 */}
                    <div>
                        <h3 className="text-lg sm:text-xl font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-2 text-gray-600 text-sm sm:text-base md:text-md lg:text-lg">
                            <li><a href="mailto:tonytudaodao@gmail.com" className="hover:text-black">tonytudaodao@gmail.com</a></li>
                            <li><a href="tel:+1(857)205-2207" className="hover:text-black">+1 (857) 205-2207</a></li>
                            <li><a href="https://www.instagram.com/example" className="hover:text-black" target="_blank" rel="noopener noreferrer">Instagram</a></li>
                            <li><a href="https://www.facebook.com/example" className="hover:text-black" target="_blank" rel="noopener noreferrer">Facebook</a></li>
                        </ul>
                    </div>

                    {/* 版权声明 */}
                    <div className='text-darkest'>
                        <h3 className="text-md md:text-lg lg:text-xl text-darker font-semibold mb-4">Legal</h3>
                        <p className='text-sm sm:text-base md:text-md lg:text-lg'>© 2025 Biomind Logic. All rights reserved.</p>
                        <p className="text-sm sm:text-base md:text-md lg:text-lg">Disclaimer: The content on this platform is for educational purposes only and is not affiliated with any official exam boards.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
