import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import MovingObject from './components/MovingObject';
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
    // Medium: 2x2 to 7x7
    min = 2;
    max = 7;
  } else {
    // Hard: 5x5 to 10x10 (Capped at 10x10)
    min = 5;
    max = 10;
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
  const [location, setLocation] = useState(null); // 'mountain', 'space', etc.
  const [celebrationEffect, setCelebrationEffect] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);

  // Mini-Game State
  const [activeMiniGame, setActiveMiniGame] = useState(null); // 'gems' | null
  const [isMiniGameChoiceOpen, setIsMiniGameChoiceOpen] = useState(false);
  const [miniGameScore, setMiniGameScore] = useState(0);
  const [miniGameTime, setMiniGameTime] = useState(0);
  const [gems, setGems] = useState([]);
  const [catcherX, setCatcherX] = useState(50); // percentage

  // Unlocked locations state, persisted in localStorage
  const [unlockedLocations, setUnlockedLocations] = useState(() => {
    const saved = localStorage.getItem('unlockedLocations');
    return saved ? JSON.parse(saved) : ['mountain'];
  });

  const locationItemMap = {
    mountain: '/gem.png',
    volcano: '/fire_sphere.png',
    jungle: '/banana.png',
    ocean: '/pearl.png',
    desert: '/gold_coin.png',
    city: '/pizza_slice.png',
    castle: '/golden_crown.png',
    candy: '/lollipop.png',
    sky: '/fluffy_feather.png',
    space: '/glowing_star.png'
  };

  const locations = [
    {
      id: 'mountain',
      name: 'Mountain',
      src: '/mountain.png',
      description: 'The classic climb.',
      color: 'from-emerald-400 to-green-600',
      path: [
        { x: 55, y: 5 },   // Start bottom-center/right
        { x: 35, y: 25 },  // Curve left
        { x: 65, y: 45 },  // Curve right under the peak
        { x: 45, y: 65 },  // Curve back left
        { x: 50, y: 85 }   // Summit
      ]
    },
    {
      id: 'volcano',
      name: 'Volcano',
      src: '/volcano.png',
      description: 'A fiery challenge.',
      color: 'from-orange-500 to-red-600',
      path: [
        { x: 50, y: 5 },   // Base
        { x: 35, y: 15 },  // Left switchback
        { x: 65, y: 30 },  // Right switchback
        { x: 40, y: 50 },  // Left mid-mountain
        { x: 60, y: 70 },  // Right near top
        { x: 50, y: 85 }   // Crater rim
      ]
    },
    {
      id: 'jungle',
      name: 'Jungle',
      src: '/jungle.png',
      description: 'Wild wilderness.',
      color: 'from-green-500 to-teal-600',
      path: [
        { x: 10, y: 5 },
        { x: 30, y: 25 },
        { x: 70, y: 45 },
        { x: 40, y: 65 },
        { x: 60, y: 85 }
      ]
    },
    {
      id: 'ocean',
      name: 'Ocean',
      src: '/ocean.png',
      description: 'Deep blue adventure.',
      color: 'from-blue-400 to-cyan-600',
      path: [
        { x: 80, y: 5 },
        { x: 60, y: 30 },
        { x: 30, y: 50 },
        { x: 50, y: 70 },
        { x: 20, y: 90 }
      ]
    },
    {
      id: 'desert',
      name: 'Desert',
      src: '/desert.png',
      description: 'Hot sands.',
      color: 'from-yellow-400 to-orange-500',
      path: [
        { x: 10, y: 5 },
        { x: 50, y: 25 },
        { x: 20, y: 50 },
        { x: 80, y: 75 },
        { x: 50, y: 90 }
      ]
    },
    {
      id: 'city',
      name: 'City',
      src: '/city.png',
      description: 'Neon future.',
      color: 'from-purple-500 to-pink-600',
      path: [
        { x: 20, y: 5 },
        { x: 20, y: 30 },
        { x: 80, y: 35 },
        { x: 80, y: 60 },
        { x: 50, y: 90 }
      ]
    },
    {
      id: 'castle',
      name: 'Castle',
      src: '/castle.png',
      description: 'Medieval fortress.',
      color: 'from-slate-400 to-gray-600',
      path: [
        { x: 50, y: 5 },
        { x: 30, y: 25 },
        { x: 70, y: 50 },
        { x: 40, y: 75 },
        { x: 50, y: 85 }
      ]
    },
    {
      id: 'candy',
      name: 'Candy',
      src: '/candy.png',
      description: 'Sweet climb.',
      color: 'from-pink-300 to-rose-400',
      path: [
        { x: 10, y: 10 },
        { x: 30, y: 30 },
        { x: 50, y: 50 },
        { x: 70, y: 70 },
        { x: 90, y: 90 }
      ]
    },
    {
      id: 'sky',
      name: 'Sky',
      src: '/sky.png',
      description: 'Floating islands.',
      color: 'from-sky-300 to-blue-400',
      path: [
        { x: 20, y: 10 },
        { x: 80, y: 30 },
        { x: 20, y: 60 },
        { x: 80, y: 80 },
        { x: 50, y: 90 }
      ]
    },
    {
      id: 'space',
      name: 'Space',
      src: '/space.png',
      description: 'Cosmic elevator.',
      color: 'from-indigo-500 to-purple-800',
      path: [
        { x: 50, y: 5 },
        { x: 50, y: 95 }
      ]
    },
  ];

  const currentLocation = locations.find(l => l.id === location);

  const TOTAL_STEPS = 50;

  // Calculate climber position based on progress and current location's path
  const getClimberPosition = (currentStep) => {
    const progress = currentStep / TOTAL_STEPS;

    // Default linear vertical path if no specific path is defined
    const defaultPath = [
      { x: 50, y: 10 },
      { x: 50, y: 90 }
    ];

    const path = currentLocation?.path || defaultPath;

    // If progress is 0, return start. If 1, return end.
    if (progress <= 0) return { left: `${path[0].x}%`, bottom: `${path[0].y}%` };
    if (progress >= 1) return { left: `${path[path.length - 1].x}%`, bottom: `${path[path.length - 1].y}%` };

    // Calculate which segment of the path we are on
    // Total segments = points - 1
    const totalSegments = path.length - 1;
    const segmentLength = 1 / totalSegments;

    const currentSegmentIndex = Math.min(
      Math.floor(progress / segmentLength),
      totalSegments - 1
    );

    const segmentProgress = (progress - (currentSegmentIndex * segmentLength)) / segmentLength;

    const p1 = path[currentSegmentIndex];
    const p2 = path[currentSegmentIndex + 1];

    // Interpolate
    const x = p1.x + (p2.x - p1.x) * segmentProgress;
    const y = p1.y + (p2.y - p1.y) * segmentProgress;

    return { left: `${x}%`, bottom: `${y}%` };
  };

  const handleKeyDown = useCallback((e) => {
    // Only allow movement if character is selected
    const movementKeys = ['Space', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'ArrowDown'];
    if (movementKeys.includes(e.code) && !isModalOpen && !victory && !isClimbing && character) {
      e.preventDefault(); // Prevent scrolling

      const nextStep = step + 1;

      if (nextStep > TOTAL_STEPS) return;

      if (nextStep === TOTAL_STEPS) {
        setStep(nextStep);
        setVictory(true);
        return;
      }

      setStep(nextStep);

      // Check for mini-game choice every 10 steps
      if (nextStep % 10 === 0 && nextStep !== 0) {
        setIsMiniGameChoiceOpen(true);
        return;
      }

      // Check for multiplication checkstop every 5 steps (if not a mini-game step)
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
  }, [step, isModalOpen, victory, isClimbing, character, TOTAL_STEPS]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Periodic eruptions removed to focus on answer celebrations

  // Unlock next level on victory
  useEffect(() => {
    if (victory && location) {
      const currentIndex = locations.findIndex(l => l.id === location);
      if (currentIndex >= 0 && currentIndex < locations.length - 1) {
        const nextLocationId = locations[currentIndex + 1].id;
        if (!unlockedLocations.includes(nextLocationId)) {
          const newUnlocked = [...unlockedLocations, nextLocationId];
          setUnlockedLocations(newUnlocked);
          localStorage.setItem('unlockedLocations', JSON.stringify(newUnlocked));
        }
      }
    }
  }, [victory, location, unlockedLocations]);

  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(userAnswer, 10);
    if (val === problem.answer) {
      setIsModalOpen(false);
      setUserAnswer('');
      setIsError(false);

      setCelebrationEffect('character_rain');
      setTimeout(() => setCelebrationEffect(null), 3000); // 3 second celebration

      setStep(prev => prev + 1);
    } else {
      setIsError(true);
      setIsGameOver(true);
      setCelebrationEffect('failure_anvil');

      // Failure sequence: Camera shake + Anvil drops, wait 5s, then reset game
      // Longer wait to see the "squashed" death state clearly
      setTimeout(() => {
        restartGame();
        setIsGameOver(false);
        setCelebrationEffect(null);
      }, 5000);

      setTimeout(() => setIsError(false), 500);
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

  // Mini-Game Loop: Location-Specific Mechanics
  useEffect(() => {
    if (activeMiniGame !== 'gems') return;

    // Movement/Physics Logic
    const gameTimer = setInterval(() => {
      setMiniGameTime(prev => {
        if (prev <= 0.1) {
          clearInterval(gameTimer);
          setTimeout(() => {
            setActiveMiniGame(null);
            setGems([]);
          }, 2000);
          return 0;
        }
        return prev - 0.1;
      });

      setGems(prev => prev.map(gem => {
        let { x, y, vx, vy, scale } = gem;

        // Ocean: Rise Up
        if (location === 'ocean') {
          y += vy;
        }
        // Space/Sky/City: Drift Across
        else if (['space', 'sky', 'city'].includes(location)) {
          x += vx;
          y += vy;
        }
        // Candy/Castle/Desert: Shrink
        else if (['candy', 'castle', 'desert'].includes(location)) {
          scale -= 0.01;
        }

        return { ...gem, x, y, scale };
      }).filter(gem => {
        // Filter out items that leave the screen or vanish
        if (gem.scale <= 0.1) return false;
        if (gem.y < -20 || gem.y > 120 || gem.x < -20 || gem.x > 120) return false;
        return true;
      }));
    }, 50);

    const spawnInterval = setInterval(() => {
      const spawnRate = 0.7;
      if (Math.random() < spawnRate) {
        let x, y, vx = 0, vy = 0, scale = 1;

        if (location === 'ocean') {
          // Bubbles start at bottom
          x = Math.random() * 80 + 10;
          y = 110;
          vy = -(Math.random() * 0.8 + 0.4);
        } else if (['space', 'sky', 'city'].includes(location)) {
          // Stars drift from left or right
          const fromLeft = Math.random() > 0.5;
          x = fromLeft ? -10 : 110;
          y = Math.random() * 70 + 10;
          vx = fromLeft ? (Math.random() * 0.5 + 0.2) : -(Math.random() * 0.5 + 0.2);
          vy = (Math.random() - 0.5) * 0.2;
        } else {
          // Default: Blitz or Rush
          x = Math.random() * 80 + 10;
          y = Math.random() * 60 + 20;
          if (['candy', 'castle', 'desert'].includes(location)) {
            scale = 1.2;
          }
        }

        const newGem = { id: Math.random(), src: locationItemMap[location] || '/gem.png', x, y, vx, vy, scale };
        setGems(prev => [...prev, newGem]);

        if (['mountain', 'volcano', 'jungle'].includes(location)) {
          setTimeout(() => {
            setGems(prev => prev.filter(g => g.id !== newGem.id));
          }, 1500);
        }
      }
    }, 600);

    return () => {
      clearInterval(gameTimer);
      clearInterval(spawnInterval);
    };
  }, [activeMiniGame, location]);

  const handleGemClick = (gemId) => {
    setMiniGameScore(s => s + 50);
    setGems(prev => prev.filter(g => g.id !== gemId));
  };

  // Mini-Game Controls
  useEffect(() => {
    if (activeMiniGame !== 'gems') return;

    const handleMiniGameKey = (e) => {
      if (e.key === 'ArrowLeft') setCatcherX(prev => Math.max(5, prev - 5));
      if (e.key === 'ArrowRight') setCatcherX(prev => Math.min(95, prev + 5));
    };

    window.addEventListener('keydown', handleMiniGameKey);
    return () => window.removeEventListener('keydown', handleMiniGameKey);
  }, [activeMiniGame]);

  const startGemsGame = () => {
    setActiveMiniGame('gems');
    setIsMiniGameChoiceOpen(false);
    setMiniGameScore(0);
    setMiniGameTime(15); // 15 seconds
    setGems([]);
    setCatcherX(50);
  };

  const characters = [
    { id: 'girl', name: 'Climber', src: '/girl.png' },
    { id: 'mountain_goat', name: 'Goat', src: '/mountain_goat.png', location: 'mountain' },
    { id: 'flame_golem', name: 'Golem', src: '/flame_golem.png', location: 'volcano' },
    { id: 'emerald_monkey', name: 'Monkey', src: '/emerald_monkey.png', location: 'jungle' },
    { id: 'scuba_octopus', name: 'Octo', src: '/scuba_octopus.png', location: 'ocean' },
    { id: 'sand_nomad', name: 'Nomad', src: '/sand_nomad.png', location: 'desert' },
    { id: 'techno_cat', name: 'Cat', src: '/techno_cat.png', location: 'city' },
    { id: 'golden_knight', name: 'Knight', src: '/golden_knight.png', location: 'castle' },
    { id: 'gummy_penguin', name: 'Gummy', src: '/gummy_penguin.png', location: 'candy' },
    { id: 'sky_griffin', name: 'Griffin', src: '/sky_griffin.png', location: 'sky' },
    { id: 'cosmic_astronaut', name: 'Cosmic', src: '/cosmic_astronaut.png', location: 'space' },
  ];

  const availableCharacters = characters.filter(char =>
    !char.allowedLocations || char.allowedLocations.includes(location)
  );

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

        <div className="relative z-10 w-full max-w-7xl p-8 text-center flex flex-col items-center justify-center h-full">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-6xl font-black mb-12 text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]"
          >
            WHERE WILL YOU CLIMB?
          </motion.h1>

          <div className="grid grid-cols-5 gap-6 justify-items-center w-full overflow-y-auto max-h-[80vh] p-4">
            {locations.map((loc, index) => {
              // User requested to remove locking: always unlocked
              const isLocked = false;

              const handleLocationSelect = () => {
                setLocation(loc.id);
                // Allow user to pick their character
                setCharacter(null);
              };

              return (
                <motion.button
                  key={loc.id}
                  disabled={isLocked}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={!isLocked ? { scale: 1.05 } : {}}
                  whileTap={!isLocked ? { scale: 0.95 } : {}}
                  onClick={handleLocationSelect}
                  className={`group relative w-full aspect-[3/4] rounded-2xl overflow-hidden border-2 shadow-xl transition-all ${isLocked ? 'border-gray-700 opacity-60 cursor-not-allowed grayscale' : 'border-white/20 hover:border-white'
                    }`}
                >
                  <img src={loc.src} alt={loc.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className={`absolute inset-0 transition-colors ${isLocked ? 'bg-black/60' : 'bg-black/30 group-hover:bg-black/10'}`}></div>

                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/50 p-3 rounded-full border border-white/20 backdrop-blur-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent text-left">
                    <span className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${loc.color}`}>{loc.name.toUpperCase()}</span>
                    <p className="text-gray-300 mt-1 text-xs">{loc.description}</p>
                    {isLocked && <p className="text-red-400 text-xs font-bold mt-1 uppercase tracking-wider">Locked</p>}
                  </div>
                </motion.button>
              );
            })}
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
            {availableCharacters.map((char, index) => (
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
                <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center p-2 border border-white/20 group-hover:border-cyan-400 group-hover:bg-cyan-500/20 group-hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all duration-300 overflow-hidden">
                  <img src={char.src} alt={char.name} className="w-full h-full object-contain filter drop-shadow-xl" />
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
    <div className="relative w-screen h-screen overflow-hidden font-sans select-none isolation-auto">
      {/* Location Background */}
      <motion.img
        src={currentLocation?.src || '/mountain.png'}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
        animate={location === 'volcano' ? {
          x: celebrationEffect === 'eruption' ? [-5, 5, -5, 5, 0] : [0, -2, 2, -2, 2, 0],
          transition: celebrationEffect === 'eruption'
            ? { duration: 0.2, repeat: Infinity }
            : { duration: 0.5, repeat: Infinity, repeatDelay: 5 }
        } : {}}
      />

      <div className="absolute inset-0 z-0 pointer-events-none" style={{ isolation: 'auto' }}>
        {/* Rope for Climber Girl */}
        {character === 'girl' && (
          <motion.div
            initial={getClimberPosition(step)}
            animate={getClimberPosition(step)}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className="absolute w-1 z-[5]"
            style={{
              top: 0,
              bottom: `calc(${getClimberPosition(step).bottom} + 4rem)`,
              background: 'linear-gradient(to bottom, #8B4513 80%, #CD853F)',
              boxShadow: '0 0 5px rgba(0,0,0,0.5)',
              borderLeft: '1px solid #5D2906',
              borderRight: '1px solid #A0522D',
              marginLeft: '3rem' // Offset to match girl's hand center
            }}
          />
        )}

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
            className={clsx(
              "w-full h-full object-contain",
              isGameOver && "grayscale-[1] brightness-[0.3]"
            )}
            style={isGameOver ? {
              position: 'relative',
              top: '50%',
              transform: 'scaleY(0.12) translateY(300%)',
              opacity: 0.9,
              transition: 'all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            } : {}}
          />
        </motion.div>
      </div>

      {/* UI Overlay */}
      {/* Celebration Overlay Effects */}
      <AnimatePresence>
        {(victory || celebrationEffect) && (
          <>
            {/* Failure Anvil Drop */}
            {celebrationEffect === 'failure_anvil' && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-red-900/20 z-40 pointer-events-none"
                />
                <motion.img
                  src="/anvil.png"
                  initial={{ y: -600, x: "-50%", left: "50%" }}
                  animate={{ y: "45vh" }}
                  exit={{ opacity: 0 }}
                  transition={{
                    y: { type: 'spring', stiffness: 400, damping: 10 },
                    duration: 0.4
                  }}
                  className="absolute w-72 h-72 object-contain z-50 mix-blend-multiply brightness-[1.1] contrast-[1.1]"
                />
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute inset-0 flex flex-col items-center justify-center z-[60] pointer-events-none"
                >
                  <h2 className="text-8xl font-black text-white drop-shadow-[0_10px_20px_rgba(0,0,0,1)] animate-bounce italic">
                    WHACKED!
                  </h2>
                  <p className="text-4xl font-bold text-red-500 bg-black/60 px-8 py-3 rounded-full mt-6 backdrop-blur-sm border-2 border-red-500/30">
                    GET SLAMMED!
                  </p>
                </motion.div>
              </>
            )}

            {/* Universal Character Rain */}
            {(celebrationEffect === 'character_rain' || victory) && (
              <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                {[...Array(15)].map((_, i) => (
                  <motion.img
                    key={i}
                    src={`/${character}.png`}
                    initial={{ y: -200, x: Math.random() * 100 + "%", rotate: 0 }}
                    animate={{
                      y: "120vh",
                      rotate: 360 * (Math.random() > 0.5 ? 1 : -1)
                    }}
                    transition={{ duration: 2 + Math.random(), delay: i * 0.1, ease: "linear" }}
                    className="absolute w-28 h-28 object-contain pointer-events-none"
                  />
                ))}
              </div>
            )}

            {/* Volcano Eruption */}
            {(location === 'volcano' && (celebrationEffect === 'eruption' || victory)) && (
              <motion.img
                src="/volcano_eruption.png"
                initial={{ opacity: 0, scale: 0.5, y: 100 }}
                animate={{ opacity: 1, scale: victory ? 1.2 : 1.1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-full object-contain pointer-events-none z-30 ${!victory ? 'opacity-90' : ''}`}
              />
            )}

            {/* Fireworks (Space, Sky, City) - Multiple bursts */}
            {(['fireworks', 'stars'].includes(celebrationEffect) || (victory && ['space', 'sky', 'city', 'mountain', 'castle', 'candy', 'jungle', 'desert'].includes(location))) && (
              <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                {[...Array(5)].map((_, i) => (
                  <motion.img
                    key={i}
                    src={celebrationEffect === 'stars' ? "/star_burst.png" : "/fireworks.png"}
                    initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                    animate={{
                      scale: [0, 1.5, 1.2],
                      opacity: [0, 1, 0],
                      x: Math.random() * 400 - 200,
                      y: Math.random() * 400 - 200
                    }}
                    transition={{ duration: 1.5, delay: i * 0.2, ease: "easeOut" }}
                    className="absolute top-1/2 left-1/2 w-64 h-64 object-contain"
                  />
                ))}
              </div>
            )}

            {/* Bubble Burst (Ocean) */}
            {(celebrationEffect === 'bubbles' || (victory && location === 'ocean')) && (
              <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                {[...Array(8)].map((_, i) => (
                  <motion.img
                    key={i}
                    src="/bubble_burst.png"
                    initial={{ scale: 0, opacity: 0, y: 100 }}
                    animate={{
                      scale: [0, 1.2, 1.5],
                      opacity: [0, 0.8, 0],
                      y: -500,
                      x: Math.random() * 200 - 100
                    }}
                    transition={{ duration: 2, delay: i * 0.1, ease: "easeOut" }}
                    className="absolute bottom-0 left-1/2 w-48 h-48 object-contain"
                  />
                ))}
              </div>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Moving Objects */}
      {/* Universal Clouds/Atmosphere for outdoor locations */}
      {['mountain', 'volcano', 'jungle', 'desert', 'city', 'castle', 'candy', 'sky'].includes(location) && (
        <>
          <MovingObject src="/cloud1.png" type="cloud" duration={25} top="10%" scale={2} />
          <MovingObject src="/cloud2.png" type="cloud" duration={35} delay={10} top="25%" scale={1.5} reverse />
        </>
      )}

      {/* Birds for high altitude */}
      {['mountain', 'sky', 'castle'].includes(location) && (
        <MovingObject src="/bird.png" type="bird" duration={15} top="15%" scale={0.8} />
      )}

      {/* Ocean Elements */}
      {location === 'ocean' && (
        <>
          <MovingObject src="/fish1.png" type="fish" duration={18} top="40%" scale={1} />
          <MovingObject src="/fish2.png" type="fish" duration={22} delay={5} top="70%" scale={0.8} reverse />
          <MovingObject src="/bubble.png" type="bubble" duration={10} top="80%" scale={0.5} />
        </>
      )}

      {/* Space Elements */}
      {location === 'space' && (
        <>
          <MovingObject src="/asteroid.png" type="asteroid" duration={30} top="20%" scale={1.2} />
          <MovingObject src="/satellite.png" type="satellite" duration={45} top="50%" scale={0.9} reverse />
        </>
      )}

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 p-4 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 z-20">
        <h1 className="text-xl font-bold text-yellow-400">Multiply {currentLocation?.name || 'Mountain'}</h1>
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

      {/* Mini-Game Choice Modal */}
      <AnimatePresence>
        {isMiniGameChoiceOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-10 rounded-[3rem] border-4 border-white/30 shadow-2xl text-center max-w-lg w-full"
            >
              <h2 className="text-5xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 underline decoration-white/20">
                BREAK TIME!
              </h2>
              <p className="text-2xl font-bold mb-10 text-white/90 leading-tight">
                You've climbed so far! Want to take a break and catch some gems?
              </p>
              <div className="flex flex-col gap-4">
                <button
                  onClick={startGemsGame}
                  className="w-full py-6 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-3xl font-black shadow-[0_10px_0_#1d4ed8] hover:shadow-[0_5px_0_#1d4ed8] hover:translate-y-[5px] active:shadow-none active:translate-y-[10px] transition-all"
                >
                  PLAY MINI-GAME!
                </button>
                <button
                  onClick={() => setIsMiniGameChoiceOpen(false)}
                  className="w-full py-4 rounded-xl bg-white/10 text-white/60 text-xl font-bold hover:bg-white/20 transition-all mt-4"
                >
                  No thanks, keep climbing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Gem Catch Mini-Game Overlay */}
      <AnimatePresence>
        {activeMiniGame === 'gems' && (
          <div className="fixed inset-0 z-[200] bg-gray-900 overflow-hidden select-none touch-none">
            {/* Game Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1a1a2e_0%,_#0f0f1a_100%)] opacity-50" />

            {/* Stars */}
            <div className="absolute inset-0 z-0">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-white rounded-full animate-pulse"
                  style={{
                    width: Math.random() * 3,
                    height: Math.random() * 3,
                    left: Math.random() * 100 + "%",
                    top: Math.random() * 100 + "%",
                    animationDelay: Math.random() * 5 + "s"
                  }}
                />
              ))}
            </div>

            {/* Score & Timer */}
            <div className="absolute top-10 inset-x-0 flex justify-between px-16 z-20">
              <div className="bg-black/50 backdrop-blur px-8 py-4 rounded-2xl border-2 border-cyan-500/50">
                <p className="text-cyan-400 text-sm font-bold uppercase tracking-widest mb-1">Score</p>
                <p className="text-4xl font-black text-white font-mono">{miniGameScore}</p>
              </div>
              <div className="bg-black/50 backdrop-blur px-8 py-4 rounded-2xl border-2 border-pink-500/50">
                <p className="text-pink-400 text-sm font-bold uppercase tracking-widest mb-1">Time</p>
                <p className="text-4xl font-black text-white font-mono">{Math.ceil(miniGameTime)}s</p>
              </div>
            </div>

            {/* Gems (Blitz Items) */}
            <div className="absolute inset-0 z-10">
              <AnimatePresence>
                {gems.map(gem => (
                  <motion.img
                    key={gem.id}
                    src={gem.src}
                    initial={{ scale: 0, opacity: 0, rotate: -45 }}
                    animate={{ scale: 1.2, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0, rotate: 45 }}
                    whileHover={{ scale: 1.4 }}
                    whileTap={{ scale: 0.8 }}
                    onClick={() => handleGemClick(gem.id)}
                    className="absolute w-24 h-24 object-contain cursor-pointer drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] active:brightness-150"
                    style={{
                      left: gem.x + "%",
                      top: gem.y + "%",
                      transform: `scale(${gem.scale || 1})`
                    }}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Controls Info */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-cyan-400 font-black uppercase tracking-[0.3em] text-xl bg-black/40 px-8 py-3 rounded-full border border-cyan-500/30 backdrop-blur-sm animate-pulse">
              TAP THE GEMS FAST!
            </div>

            {/* Finish Overlay */}
            {miniGameTime <= 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-[210] flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl"
              >
                <h3 className="text-7xl font-black text-white mb-4">TIME'S UP!</h3>
                <p className="text-3xl font-bold text-cyan-400 mb-8">FINAL SCORE: {miniGameScore}</p>
                <p className="text-white/40 animate-pulse font-bold tracking-widest uppercase">Returning to climb...</p>
              </motion.div>
            )}
          </div>
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
                VICTORY!
              </h1>
              <p className="text-2xl text-gray-200 mb-8">You conquered the {currentLocation?.name}!</p>
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
    </div >
  );
}
