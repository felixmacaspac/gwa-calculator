import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Define types for sharing functionality
export interface Grade {
  course: string;
  grade: number | string;
  units: number | string;
}

export interface ShareData {
  grades: Grade[];
  gwa: number;
  deansListText: string;
}

/**
 * Encodes grade data for URL sharing
 * @param data The grade data to encode
 * @returns URL-safe encoded string
 */
export function encodeShareData(data: ShareData): string {
  try {
    const jsonString = JSON.stringify(data);
    return encodeURIComponent(btoa(jsonString));
  } catch (error) {
    console.error("Error encoding share data:", error);
    return "";
  }
}

/**
 * Decodes grade data from URL parameter
 * @param encoded The encoded string from URL
 * @returns Decoded ShareData object or null if invalid
 */
export function decodeShareData(encoded: string): ShareData | null {
  try {
    const jsonString = atob(decodeURIComponent(encoded));
    return JSON.parse(jsonString) as ShareData;
  } catch (error) {
    console.error("Error decoding share data:", error);
    return null;
  }
}

/**
 * Generates a shareable URL with encoded grade data
 * @param data The grade data to share
 * @returns Full URL string for sharing
 */
export function generateShareableUrl(data: ShareData): string {
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}` 
    : 'https://gwa-calculator.vercel.app/';
  
  const encodedData = encodeShareData(data);
  return `${baseUrl}?shared=${encodedData}`;
}

/**
 * Generates formatted text for sharing
 * @param data The grade data to format
 * @returns Formatted share text
 */
export function generateShareText(data: ShareData): string {
  const { gwa, deansListText, grades } = data;
  
  // Create a header
  let shareText = `📊 My GWA: ${gwa}\n`;
  
  // Add Dean's List status if applicable
  if (deansListText) {
    // Extract just the first sentence for brevity
    const mainStatus = deansListText.split('!')[0];
    shareText += `${mainStatus}!\n\n`;
  }
  
  // Add courses and grades
  shareText += "📝 My Courses:\n";
  grades.forEach((grade) => {
    shareText += `- ${grade.course}: ${grade.grade} (${grade.units} units)\n`;
  });
  
  // Add link back to calculator
  shareText += "\nCalculate your own GWA: https://gwa-calculator.vercel.app/";
  
  return shareText;
}

/**
 * Copies text to clipboard
 * @param text The text to copy
 * @returns Promise resolving to success boolean
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // Fallback for browsers without clipboard API
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch (error) {
    console.error('Failed to copy text:', error);
    return false;
  }
}

/**
 * Shares content using Web Share API if available
 * @param title The title of the shared content
 * @param text The text to share
 * @param url Optional URL to include
 * @returns Promise resolving to success boolean
 */
export async function shareContent(
  title: string,
  text: string,
  url?: string
): Promise<boolean> {
  try {
    if (navigator.share) {
      await navigator.share({
        title,
        text,
        url
      });
      return true;
    }
    
    // If Web Share API is not available, fall back to clipboard
    return await copyToClipboard(text);
  } catch (error) {
    console.error('Error sharing content:', error);
    return false;
  }
}
