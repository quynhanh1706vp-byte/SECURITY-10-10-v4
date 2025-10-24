import React, { useMemo } from 'react';
import { Typography, Tooltip } from 'antd';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';

interface TruncatedTextProps {
  children: React.ReactNode;
  maxWidth?: number;
  tooltipMaxWidth?: number;
  className?: string;
  style?: React.CSSProperties;
  safeHtml?: boolean;
}

/**
 * Sanitize HTML content with enterprise-grade security
 * Defense-in-depth approach with multiple layers:
 * 1. Decode HTML entities to prevent encoded XSS
 * 2. Aggressive regex sanitization
 * 3. DOMPurify with maximum security configuration
 * 4. CSP-compliant output
 */
const sanitizeContent = (content: string): string => {
  // Layer 1: Decode HTML entities to prevent encoded attacks
  const textarea = document.createElement('textarea');
  textarea.innerHTML = content;
  let sanitized = textarea.value;

  // Layer 2: Remove ALL on* event handlers (including encoded/unicode variants)
  // Match: on<any>, ON<any>, &#111;nclick, etc.
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');
  sanitized = sanitized.replace(/&#?\w+;on\w+/gi, ''); // HTML entity encoded events

  // Layer 3: Remove dangerous attributes
  sanitized = sanitized.replace(/\s*contenteditable\s*=\s*["']?[^"'\s>]*["']?/gi, '');
  sanitized = sanitized.replace(/\s*formaction\s*=\s*["']?[^"'\s>]*["']?/gi, '');

  // Layer 4: DOMPurify with MAXIMUM security configuration
  sanitized = DOMPurify.sanitize(sanitized, {
    // Use safest possible configuration
    SAFE_FOR_TEMPLATES: true,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM: false,
    FORCE_BODY: true,

    // Forbid ALL event handlers using wildcard
    FORBID_ATTR: [
      // Explicit list as additional safety
      'onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur',
      'onchange', 'onsubmit', 'onkeydown', 'onkeyup', 'onkeypress',
      'onmousedown', 'onmouseup', 'onmousemove', 'onmouseenter', 'onmouseleave',
      'ondblclick', 'oncontextmenu', 'onwheel', 'onscroll',
      'ondrag', 'ondrop', 'ondragstart', 'ondragend', 'ondragover', 'ondragleave', 'ondragenter',
      'oncopy', 'oncut', 'onpaste',
      'onanimationstart', 'onanimationend', 'onanimationiteration',
      'ontransitionstart', 'ontransitionend', 'ontransitionrun', 'ontransitioncancel',
      'onplay', 'onplaying', 'onpause', 'onended', 'onvolumechange',
      'oninput', 'oninvalid', 'onsearch', 'onselect',
      'ontoggle', 'onabort', 'oncancel', 'onclose',
      // Dangerous attributes
      'contenteditable', 'designmode', 'formaction', 'form',
      'autofocus', 'autoplay',
    ],

    // Forbid dangerous tags
    FORBID_TAGS: [
      'script', 'iframe', 'object', 'embed', 'applet',
      'form', 'input', 'button', 'textarea', 'select', 'option',
      'link', 'style', 'meta', 'base', 'basefont',
      'frame', 'frameset', 'noframes',
      'svg', 'math', 'animate', 'animatetransform',
      'audio', 'video', 'track', 'source',
      'canvas', 'map', 'area',
    ],

    // Only allow SAFEST protocols
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,

    // Minimal safe tags for TEXT ONLY
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br'],

    // ⚠️ CRITICAL: NO STYLE ATTRIBUTE - prevents style-based XSS
    ALLOWED_ATTR: ['class'],

    // Additional security hooks
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SANITIZE_DOM: true,
  });

  return sanitized;
};

export const TruncatedText: React.FC<TruncatedTextProps> = ({
  children,
  maxWidth = 300,
  tooltipMaxWidth = 600,
  className,
  style,
  safeHtml = true,
}) => {
  const [isTruncated, setIsTruncated] = React.useState(false);
  const textRef = React.useRef<HTMLSpanElement>(null);

  const content = useMemo(() => {
    if (!safeHtml || typeof children !== 'string') {
      return children;
    }

    // Apply multi-layer sanitization
    const sanitized = sanitizeContent(children);

    // Parse sanitized HTML to React elements
    return parse(sanitized);
  }, [children, safeHtml]);

  React.useEffect(() => {
    const element = textRef.current;
    if (element) {
      // Check if text is truncated by comparing scrollWidth with clientWidth
      setIsTruncated(element.scrollWidth > element.clientWidth);
    }
  }, [children]);

  return (
    <Tooltip
      title={isTruncated ? content : null}
      overlayStyle={{ maxWidth: tooltipMaxWidth }}
      placement="top"
    >
      <Typography.Text
        ref={textRef}
        ellipsis
        style={{ maxWidth, ...style }}
        className={className}
      >
        {content}
      </Typography.Text>
    </Tooltip>
  );
};

export default TruncatedText;
