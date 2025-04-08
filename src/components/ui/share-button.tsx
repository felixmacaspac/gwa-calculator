"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShareIcon, ClipboardIcon, CheckIcon, XIcon } from "lucide-react";
import {
  ShareData,
  copyToClipboard,
  generateShareText,
  generateShareableUrl,
  shareContent,
} from "@/lib/utils";

type ShareStatus = "idle" | "loading" | "success" | "error";

interface ShareButtonProps {
  data: ShareData;
  className?: string;
}

export function ShareButton({ data, className = "" }: ShareButtonProps) {
  const [status, setStatus] = useState<ShareStatus>("idle");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleShare = async () => {
    try {
      setStatus("loading");
      const text = generateShareText(data);
      const url = generateShareableUrl(data);
      
      const success = await shareContent(
        "My GWA Calculation Results",
        text,
        url
      );
      
      setStatus(success ? "success" : "error");
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    } catch (error) {
      console.error("Share failed:", error);
      setStatus("error");
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      setStatus("loading");
      const text = generateShareText(data);
      
      const success = await copyToClipboard(text);
      
      setStatus(success ? "success" : "error");
      setIsMenuOpen(false);
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    } catch (error) {
      console.error("Clipboard copy failed:", error);
      setStatus("error");
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    }
  };

  const handleCopyLink = async () => {
    try {
      setStatus("loading");
      const url = generateShareableUrl(data);
      
      const success = await copyToClipboard(url);
      
      setStatus(success ? "success" : "error");
      setIsMenuOpen(false);
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    } catch (error) {
      console.error("Link copy failed:", error);
      setStatus("error");
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Determine if Web Share API is available
  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className={`relative ${className}`}>
      {/* Main Share Button */}
      <motion.button
        className={`
          px-4 py-3 rounded-xl text-white font-bold uppercase
          flex items-center justify-center gap-2
          transition-colors duration-300
          ${status === 'idle' ? 'bg-main-blue hover:bg-blue-700' : ''}
          ${status === 'loading' ? 'bg-gray-500' : ''}
          ${status === 'success' ? 'bg-green-500' : ''}
          ${status === 'error' ? 'bg-red-500' : ''}
          disabled:bg-gray-300 disabled:cursor-not-allowed
          w-full sm:w-auto
        `}
        onClick={hasNativeShare ? handleShare : toggleMenu}
        disabled={status === 'loading'}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Share your GWA results"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        {status === 'idle' && (
          <>
            <ShareIcon className="w-5 h-5" />
            <span>Share Results</span>
          </>
        )}
        
        {status === 'loading' && (
          <div className="flex items-center">
            <motion.div
              className="w-5 h-5 rounded-full border-2 border-white border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span className="ml-2">Sharing...</span>
          </div>
        )}
        
        {status === 'success' && (
          <>
            <CheckIcon className="w-5 h-5" />
            <span>Shared Successfully!</span>
          </>
        )}
        
        {status === 'error' && (
          <>
            <XIcon className="w-5 h-5" />
            <span>Failed to Share</span>
          </>
        )}
      </motion.button>

      {/* Share Options Menu */}
      <AnimatePresence>
        {isMenuOpen && !hasNativeShare && (
          <motion.div
            className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-lg z-10 overflow-hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.button
              className="w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-gray-100 transition-colors"
              onClick={handleCopyToClipboard}
              whileHover={{ backgroundColor: "#f3f4f6" }}
            >
              <ClipboardIcon className="w-5 h-5" />
              <span>Copy results to clipboard</span>
            </motion.button>
            
            <motion.button
              className="w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-gray-100 transition-colors"
              onClick={handleCopyLink}
              whileHover={{ backgroundColor: "#f3f4f6" }}
            >
              <ClipboardIcon className="w-5 h-5" />
              <span>Copy share link</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

