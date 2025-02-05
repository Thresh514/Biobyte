import Link from 'next/link';
import Image from 'next/image';

const SimpleHeader = () => {
    return (
        <header className="flex item-center justify-center bg-white shadow-xl">
            <div className="p-1">
                <Link href="/">
                    <Image src="/whiteicon.svg" alt="logo" width={64} height={64} />
                </Link>
            </div>
        </header>
    );
};

export default SimpleHeader;