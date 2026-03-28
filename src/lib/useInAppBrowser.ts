"use client";

import { useState, useEffect } from "react";

export function useInAppBrowser() {
  const [isInApp, setIsInApp] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || "";
    const inAppPatterns = [
      /FBAN|FBAV/i,           // Facebook
      /Instagram/i,           // Instagram
      /musical_ly|BytedanceWebview|TikTok/i, // TikTok
      /Twitter/i,             // Twitter / X
      /Snapchat/i,            // Snapchat
      /LinkedIn/i,            // LinkedIn
      /Pinterest/i,           // Pinterest
      /Line\//i,              // Line
      /KAKAOTALK/i,           // KakaoTalk
      /\bwv\b/i,              // Android WebView generic
    ];
    setIsInApp(inAppPatterns.some((p) => p.test(ua)));
  }, []);

  return isInApp;
}
