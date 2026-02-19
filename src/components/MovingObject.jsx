import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function MovingObject({ src, type, duration = 20, delay = 0, top, scale = 1, reverse = false }) {
    // Randomize start vertical position slightly if top is not provided
    const randomTop = top || `${Math.random() * 60 + 5}%`;

    const variants = {
        animate: {
            x: reverse ? ['120vw', '-20vw'] : ['-20vw', '120vw'],
            transition: {
                duration: duration,
                repeat: Infinity,
                ease: "linear",
                delay: delay,
            }
        }
    };

    return (
        <motion.img
            src={src}
            alt={type}
            variants={variants}
            animate="animate"
            className="absolute pointer-events-none mix-blend-multiply"
            style={{
                top: randomTop,
                width: `${50 * scale}px`,
                height: 'auto',
                zIndex: 5
            }}
        />
    );
}
