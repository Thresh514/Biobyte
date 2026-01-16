import { useEffect } from 'react';

const ContentProtection = ({ children }) => {
    useEffect(() => {
        // Disable right-click context menu
        const handleContextMenu = (e) => {
            e.preventDefault();
            return false;
        };

        // Disable common copy shortcuts
        const handleKeyDown = (e) => {
            // Disable Ctrl+S (save)
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                return false;
            }
            // Disable Ctrl+A (select all)
            if (e.ctrlKey && e.key === 'a') {
                e.preventDefault();
                return false;
            }
            // Disable Ctrl+C (copy)
            if (e.ctrlKey && e.key === 'c') {
                e.preventDefault();
                return false;
            }
            // Disable Ctrl+V (paste)
            if (e.ctrlKey && e.key === 'v') {
                e.preventDefault();
                return false;
            }
            // Disable Ctrl+P (print)
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                return false;
            }
            // Disable F12 (developer tools)
            if (e.key === 'F12') {
                e.preventDefault();
                return false;
            }
            // Disable Ctrl+Shift+I (developer tools)
            if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                e.preventDefault();
                return false;
            }
            // Disable Ctrl+U (view source)
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault();
                return false;
            }
        };

        // Disable text selection
        const handleSelectStart = (e) => {
            e.preventDefault();
            return false;
        };

        // Disable drag and drop
        const handleDragStart = (e) => {
            e.preventDefault();
            return false;
        };

        // Add event listeners
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('selectstart', handleSelectStart);
        document.addEventListener('dragstart', handleDragStart);

        // Add CSS styles to prevent selection
        const style = document.createElement('style');
        style.textContent = `
            .content-protected {
                -webkit-user-select: none !important;
                -moz-user-select: none !important;
                -ms-user-select: none !important;
                user-select: none !important;
                -webkit-touch-callout: none !important;
                -webkit-tap-highlight-color: transparent !important;
            }
            
            .content-protected * {
                -webkit-user-select: none !important;
                -moz-user-select: none !important;
                -ms-user-select: none !important;
                user-select: none !important;
            }

            /* Hide content when printing */
            @media print {
                .content-protected {
                    display: none !important;
                }
            }
        `;
        document.head.appendChild(style);

        // Detect developer tools
        let devtools = {
            open: false,
            orientation: null
        };
        
        const threshold = 160;
        const checkDevTools = () => {
            if (window.outerHeight - window.innerHeight > threshold || 
                window.outerWidth - window.innerWidth > threshold) {
                if (!devtools.open) {
                    devtools.open = true;
                    console.clear();
                    console.log('%c⚠️ Content Protected by Copyright', 'color: red; font-size: 20px; font-weight: bold;');
                    console.log('%cDownloading, copying, or distributing this content is prohibited', 'color: red; font-size: 16px;');
                    console.log('%cFor assistance, contact: biomindbot@gmail.com', 'color: blue; font-size: 14px;');
                }
            } else {
                devtools.open = false;
            }
        };

        // Regular check
        const devToolsInterval = setInterval(checkDevTools, 500);

        // Cleanup function
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('selectstart', handleSelectStart);
            document.removeEventListener('dragstart', handleDragStart);
            document.head.removeChild(style);
            clearInterval(devToolsInterval);
        };
    }, []);

    return (
        <div className="content-protected">
            {children}
            {/* Watermark */}
            <div className="fixed bottom-4 right-4 opacity-20 text-xs text-gray-500 pointer-events-none z-50">
                © BioByte - For online learning only
            </div>
        </div>
    );
};

export default ContentProtection;
