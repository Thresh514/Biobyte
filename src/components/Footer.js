import React from 'react';

export default function Footer() {
    return (
        <footer className="relative bg-lightest text-darker flex items-center justify-center px-8 md:px-12 mt-24 mb-8">
            <div className="max-w-7xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8 lg:gap-32">
                    {/* 快速导航 */}
                    <div className='tracking-wider'>
                        <h3 className="text-sm md:text-md lg:text-lg mb-2 font-normal">Quick Links</h3>
                        <ul className="space-y-1 text-gray-600 font-light text-xs sm:text-sm md:text-md lg:text-md ">
                            <li><a href="/faq" className="hover:text-black">Frequently Asked Questions</a></li>
                            <li><a href="/terms" className="hover:text-black">Terms of Service</a></li>
                            <li><a href="/privacy" className="hover:text-black">Privacy Policy</a></li>
                        </ul>
                    </div>

                    {/* 联系我们 */}
                    <div className='tracking-wider'>
                        <h3 className="text-sm md:text-md lg:text-lg font-normal mb-2">Contact Us</h3>
                        <ul className="space-y-1 font-light text-gray-600 text-xs sm:text-sm md:text-md lg:text-md">
                            <li><a href="mailto:tonytudaodao@gmail.com" className="hover:text-black">tonytudaodao@gmail.com</a></li>
                            <li><a href="tel:+1(857)205-2207" className="hover:text-black">+1 (857) 205-2207</a></li>
                            <li><a href="https://www.xiaohongshu.com/user/profile/6492ef0c00000000100361ce?xhsshare=CopyLink&appuid=6492ef0c00000000100361ce&apptime=1741060009&share_id=4a31ae389fb4473ebb8a09fe9af8d01f" className="hover:text-black" target="_blank">Rednote</a></li>
                            <li><a href="#" className="hover:text-black" target="_blank" rel="noopener noreferrer">Instagram</a></li>
                        </ul>
                    </div>

                    {/* 版权声明 */}
                    <div className='text-black space-y-1 tracking-wider'>
                        <h3 className="text-sm md:text-md lg:text-lg text-darker mb-2 font-normal">Legal</h3>
                        <p className='text-xs font-light sm:text-sm md:text-md lg:text-md'>© 2025 BioByte. All rights reserved.</p>
                        <p className="text-xs font-light sm:text-sm md:text-md lg:text-md">Disclaimer: The content on this platform is for educational purposes only and is not affiliated with any official exam boards.</p>
                        <p className="text-xs font-light md:text-sm">浙ICP备2025153735号-1</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
