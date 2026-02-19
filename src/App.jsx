import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import './index.css';

// Generate a random multiplication problem based on difficulty (current step)
const generateProblem = (currentStep) => {
  let min = 1;
  let max = 12;

  // Progressive Difficulty
  if (currentStep <= 15) {
    // Easy: 1x1 to 5x5
    min = 1;
    max = 5;
  } else if (currentStep <= 30) {
    // Medium: 3x3 to 9x9
    min = 3;
    max = 9;
  } else {
    // Hard: 6x6 to 12x12
    min = 6;
    max = 12;
  }

  const num1 = Math.floor(Math.random() * (max - min + 1)) + min;
  const num2 = Math.floor(Math.random() * (max - min + 1)) + min;
  return { num1, num2, answer: num1 * num2 };
};

export default function App() {
  const [step, setStep] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [problem, setProblem] = useState({ num1: 0, num2: 0, answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [isError, setIsError] = useState(false);
  const [victory, setVictory] = useState(false);

  const [isClimbing, setIsClimbing] = useState(false);
  const [character, setCharacter] = useState(null); // 'climber', 'robot', 'superhero'
  const [location, setLocation] = useState(null); // 'mountain', 'space'

  const TOTAL_STEPS = 50;

  // Calculate climber position based on progress
  // Simple S-curve path approximation
  // Start: Bottom Left (10%, 90%)
  // End: Top Center/Right (60%, 15%)
  const getClimberPosition = (currentStep) => {
    const progress = currentStep / TOTAL_STEPS;

    // Linear interpolation with some sine wave for "winding" effect
    const x = 10 + (progress * 50) + (Math.sin(progress * Math.PI * 3) * 10);
    const bottom = 10 + (progress * 70); // 10% bottom to 80% bottom (which is 20% top)

    return { left: `${x}%`, bottom: `${bottom}%` };
  };

  const handleKeyDown = useCallback((e) => {
    // Only allow movement if character is selected
    if (e.code === 'Space' && !isModalOpen && !victory && !isClimbing && character) {
      e.preventDefault(); // Prevent scrolling

      const nextStep = step + 1;

      if (nextStep > TOTAL_STEPS) return;

      if (nextStep === TOTAL_STEPS) {
        setStep(nextStep);
        setVictory(true);
        return;
      }

      setStep(nextStep);

      // Check for multiplication checkstop every 5 steps
      if (nextStep % 5 === 0 && nextStep !== 0) {
        setIsClimbing(true); // Lock input
        // Delay modal to let animation finish
        setTimeout(() => {
          setProblem(generateProblem(nextStep));
          setIsModalOpen(true);
          setIsClimbing(false);
        }, 600);
      }
    }
  }, [step, isModalOpen, victory, isClimbing, character]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(userAnswer, 10);
    if (val === problem.answer) {
      setIsModalOpen(false);
      setUserAnswer('');
      setIsError(false);
    } else {
      setIsError(true);
      // Punishment: Move back 1 step
      setStep((prev) => Math.max(0, prev - 1));
      setTimeout(() => setIsError(false), 500);
      // Optional: Generate new problem or keep same? Usually keep same to limit frustration or change to prevent memorizing hard one.
      // Let's keep same for now as punishment is moving back.
    }
  };

  const restartGame = () => {
    setStep(0);
    setVictory(false);
    setIsModalOpen(false);
    setUserAnswer('');
    setCharacter(null); // Go back to character selection
    setLocation(null); // Go back to location selection
  };

  const characters = [
    { id: 'climber', name: 'Boy', src: '/climber.png' },
    { id: 'girl', name: 'Girl', src: '/girl.png' },
    { id: 'robot', name: 'Robot', src: '/robot.png' },
    { id: 'superhero', name: 'Hero', src: '/superhero.png' },
    { id: 'ninja', name: 'Ninja', src: '/ninja.png' },
    { id: 'astronaut', name: 'Astro', src: '/astronaut.png' },
    { id: 'pirate', name: 'Pirate', src: '/pirate.png' },
    { id: 'wizard', name: 'Wizard', src: '/wizard.png' },
    { id: 'knight', name: 'Knight', src: '/knight.png' },
    { id: 'alien', name: 'Alien', src: '/alien.png' },
  ];

  if (!location) {
    return (
      <div className="relative w-screen h-screen overflow-hidden bg-gray-900 font-sans text-white select-none flex items-center justify-center">
        {/* Shared Selection Background */}
        <div className="absolute inset-0">
          <img
            src="/select-bg.png"
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        </div>

        <div className="relative z-10 w-full max-w-5xl p-8 text-center flex flex-col items-center justify-center">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-6xl font-black mb-16 text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]"
          >
            WHERE WILL YOU CLIMB?
          </motion.h1>

          <div className="flex gap-12 justify-center w-full">
            {/* Mountain Option */}
            <motion.button
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLocation('mountain')}
              className="group relative w-80 h-96 rounded-3xl overflow-hidden border-4 border-white/20 hover:border-emerald-400 shadow-2xl transition-all"
            >
              <img src="/mountain.png" alt="Mountain" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 to-transparent">
                <span className="text-4xl font-bold text-white group-hover:text-emerald-300 transition-colors">MOUNTAIN</span>
                <p className="text-gray-300 mt-2 text-sm">The classic climb to the summit.</p>
              </div>
            </motion.button>

            {/* Space Option */}
            <motion.button
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLocation('space')}
              className="group relative w-80 h-96 rounded-3xl overflow-hidden border-4 border-white/20 hover:border-purple-400 shadow-2xl transition-all"
            >
              <img src="/space.png" alt="Space" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 to-transparent">
                <span className="text-4xl font-bold text-white group-hover:text-purple-300 transition-colors">SPACE</span>
                <p className="text-gray-300 mt-2 text-sm">Ascend the cosmic elevator.</p>
              </div>
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="relative w-screen h-screen overflow-hidden bg-gray-900 font-sans text-white select-none flex items-center justify-center">
        {/* Character Selection Background */}
        <img
          src="/select-bg.png"
          alt="Character Selection Background"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

        <div className="relative z-10 w-full max-w-6xl p-8 text-center flex flex-col items-center h-full justify-center">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-6xl font-black mb-12 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] tracking-tight"
          >
            CHOOSE YOUR CLIMBER
          </motion.h1>

          <div className="grid grid-cols-5 gap-8 justify-items-center w-full">
            {characters.map((char, index) => (
              <motion.button
                key={char.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.1, translateY: -10 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCharacter(char.id)}
                className="group flex flex-col items-center gap-4 relative w-full"
              >
                <div className="w-32 h-32 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center p-2 border border-white/20 group-hover:border-cyan-400 group-hover:bg-cyan-500/20 group-hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all duration-300">
                  <img src={char.src} alt={char.name} className="w-full h-full object-contain filter drop-shadow-lg" />
                </div>
                <span className="text-xl font-bold text-gray-200 group-hover:text-cyan-300 transition-colors uppercase tracking-wider">{char.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-900 font-sans text-white select-none">
      {/* Background */}
      <img
        src={location === 'space' ? '/space.png' : '/mountain.png'}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Climber */}
      <motion.div
        className="absolute w-24 h-24 z-10"
        initial={getClimberPosition(step)}
        animate={getClimberPosition(step)}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        {/* Using a container for the image to handle flipping/scaling if needed */}
        <img
          src={`/${character}.png`}
          alt="Climber"
          className="w-full h-full object-contain filter drop-shadow-lg"
        />
      </motion.div>

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 p-4 bg-black/40 backdrop-blur-md rounded-xl border border-white/10">
        <h1 className="text-xl font-bold text-yellow-400">Multiply {location === 'space' ? 'Mission' : 'Mountain'}</h1>
        <div className="mt-2 flex items-center gap-2">
          <div className="w-48 h-4 bg-gray-700/50 rounded-full overflow-hidden border border-white/20">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400"
              initial={{ width: 0 }}
              animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
          <span className="text-sm font-mono">{step} / {TOTAL_STEPS} m</span>
        </div>
        <p className="text-xs text-gray-300 mt-2">Press <span className="px-2 py-0.5 bg-white/20 rounded font-bold">SPACE</span> to climb</p>
      </div>

      {/* Multiplication Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
          >
            <motion.div
              animate={isError ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center"
            >
              <h2 className="text-3xl font-bold mb-6 text-white text-shadow">Challenge!</h2>
              <div className="text-5xl font-mono mb-8 font-bold text-cyan-300">
                {problem.num1} × {problem.num2} = ?
              </div>
              <form onSubmit={handleAnswerSubmit} className="flex flex-col gap-4">
                <input
                  autoFocus
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-full bg-black/30 border border-white/30 rounded-xl px-4 py-3 text-2xl text-center text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-white/20"
                  placeholder="Answer..."
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95"
                >
                  Climb On!
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Victory Screen */}
      <AnimatePresence>
        {victory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/80 z-50"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center p-12"
            >
              <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-yellow-300 via-orange-400 to-red-500 mb-4 drop-shadow-sm">
                {location === 'space' ? 'MISSION COMPLETE!' : 'SUMMIT REACHED!'}
              </h1>
              <p className="text-2xl text-gray-200 mb-8">{location === 'space' ? 'You explored the galaxy!' : 'You conquered the mountain!'}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={restartGame}
                className="px-8 py-4 bg-white text-gray-900 font-bold text-xl rounded-full shadow-xl hover:shadow-2xl hover:bg-gray-100 transition-all"
              >
                Play Again
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
