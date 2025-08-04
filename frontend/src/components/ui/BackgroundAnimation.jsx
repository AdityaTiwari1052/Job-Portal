import React, { useEffect, useRef } from "react";
import "./BackgroundAnimation.css";

const BackgroundAnimation = () => {
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Use requestAnimationFrame for smoother animations
    let animationFrameId;
    const elements = [];
    const container = containerRef.current;
    
    // Create fewer elements for better performance
    const elementCount = Math.min(10, Math.floor(window.innerWidth / 100));
    
    for (let i = 0; i < elementCount; i++) {
      const element = document.createElement('div');
      const size = 20 + Math.random() * 80; // Reduced max size
      const left = (i % 2 === 0 ? Math.random() * 50 : 50 + Math.random() * 50);
      const speed = 0.5 + Math.random() * 0.5; // Slower speed
      const delay = Math.random() * 2;
      
      Object.assign(element.style, {
        position: 'absolute',
        left: `${left}%`,
        bottom: '0%',
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: '8px',
        opacity: '0',
        willChange: 'transform, opacity',
        transition: `transform ${speed}s linear, opacity 1s ease-in-out`,
        pointerEvents: 'none',
      });
      
      container.appendChild(element);
      elements.push({ element, speed, delay, size, left, startTime: null });
    }
    
    const animate = (timestamp) => {
      elements.forEach(item => {
        if (!item.startTime) {
          item.startTime = timestamp + (item.delay * 1000);
          return;
        }
        
        if (timestamp < item.startTime) return;
        
        const elapsed = (timestamp - item.startTime) / 1000; // in seconds
        const progress = (elapsed / item.speed) % 1;
        
        // Use transform for better performance
        item.element.style.transform = `translateY(${-120 * progress}vh) rotate(${360 * progress}deg)`;
        
        // Fade in/out effect
        if (progress < 0.1) {
          item.element.style.opacity = (progress / 0.1) * 0.9;
        } else if (progress > 0.9) {
          item.style.opacity = ((1 - progress) / 0.1) * 0.9;
        } else {
          item.element.style.opacity = '0.9';
        }
        
        // Reset position when animation completes
        if (progress >= 0.99) {
          item.startTime = timestamp;
        }
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      elements.forEach(item => {
        if (item.element && item.element.parentNode === container) {
          container.removeChild(item.element);
        }
      });
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]"
    />
  );
};

export default BackgroundAnimation;
