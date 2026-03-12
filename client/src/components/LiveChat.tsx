import { useEffect } from 'react';

// Extend Window interface to include Crisp Chat properties
declare global {
  interface Window {
    $crisp?: unknown[];
    CRISP_WEBSITE_ID?: string;
  }
}

/**
 * Live Chat Widget Component
 * Integrates Crisp Chat for real-time customer support
 * Loads the Crisp chat script and initializes it with your website ID
 */
export function LiveChat() {
  useEffect(() => {
    // Initialize Crisp Chat
    // Replace 'YOUR_WEBSITE_ID' with your actual Crisp website ID
    if (typeof window !== 'undefined') {
      (window as any).$crisp = [];
      (window as any).CRISP_WEBSITE_ID = 'YOUR_WEBSITE_ID';

      const script = document.createElement('script');
      script.src = 'https://client.crisp.chat/l.js';
      script.async = true;
      document.body.appendChild(script);

      return () => {
        // Cleanup: Remove script on component unmount if needed
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, []);

  return null; // Crisp widget renders itself
}

export default LiveChat;
