import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Transition } from 'framer-motion';
import { Zap } from 'lucide-react';
import { HiBadgeCheck } from 'react-icons/hi';
import { IoCloseSharp } from 'react-icons/io5';
import { FaInbox } from 'react-icons/fa6';
import { RiBubbleChartFill } from 'react-icons/ri';
import { BsFileTextFill, BsSendFill, BsTagFill } from 'react-icons/bs';
import { TbClockHour12Filled } from 'react-icons/tb';
import { DotmSquare3 } from './dotm-square-3';

function AnimatedText({
  text,
  className,
  delayStep = 0.014,
}: {
  text: string;
  className?: string;
  delayStep?: number;
}) {
  const chars = text.split('');

  return (
    <span className={className} style={{ display: 'inline-flex' }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={text}
          style={{ display: 'inline-flex', willChange: 'transform' }}
        >
          {chars.map((char, i) => (
            <motion.span
              key={i}
              initial={{
                y: 10,
                opacity: 0,
                scale: 0.5,
                filter: 'blur(2px)',
              }}
              animate={{
                y: 0,
                opacity: 1,
                scale: 1,
                filter: 'blur(0px)',
              }}
              exit={{
                y: -10,
                opacity: 0,
                scale: 0.5,
                filter: 'blur(2px)',
              }}
              transition={{
                type: 'spring',
                stiffness: 240,
                damping: 16,
                mass: 1.2,
                delay: i * delayStep,
              }}
              style={{
                display: 'inline-block',
                whiteSpace: char === ' ' ? 'pre' : undefined,
              }}
            >
              {char}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

const spring: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 22,
  mass: 0.8,
};

const DEFAULT_STEPS = [
  { id: 1, label: 'Importing Survey Data', icon: FaInbox },
  { id: 2, label: 'Refining Responses', icon: RiBubbleChartFill },
  { id: 3, label: 'Labelling Responses', icon: BsTagFill },
  { id: 4, label: 'Analyzing Sentiment', icon: TbClockHour12Filled },
  { id: 5, label: 'Creating Reports', icon: BsFileTextFill },
  { id: 6, label: 'Sharing Survey Report', icon: BsSendFill },
];

type StepItem = {
  id: number;
  label: string;
  icon: React.ComponentType<any>;
};

type RunActionButtonProps = {
  steps?: StepItem[];
  status?: 'idle' | 'running' | 'done';
  onClick?: (e: React.MouseEvent) => void;
  onReset?: () => void;
  text?: string;
};

export function RunActionButton({
  steps = DEFAULT_STEPS,
  status: controlledStatus,
  onClick,
  onReset,
  text = "Join Early Access"
}: RunActionButtonProps) {
  const [localStatus, setLocalStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [currentStep, setCurrentStep] = useState(0);

  const status = controlledStatus !== undefined ? controlledStatus : localStatus;

  const startAction = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
    } else {
      setLocalStatus('running');
      setCurrentStep(0);
    }
  };

  const reset = () => {
    if (onReset) {
      onReset();
    } else {
      setLocalStatus('idle');
      setCurrentStep(0);
    }
  };

  useEffect(() => {
    if (status !== 'running') return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        if (controlledStatus === undefined) {
          setLocalStatus('done');
        }
        return prev;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [status, steps.length, controlledStatus]);

  const widths = {
    idle: 220,
    running: 380,
    done: 220,
  };

  return (
    <div className="flex items-center justify-center w-full">
      <motion.div
        initial={{ width: 220 }}
        animate={{ width: widths[status] }}
        transition={spring}
        className={`relative flex h-[64px] items-center justify-between overflow-hidden rounded-full ${
          status === 'running'
            ? 'border-2 border-dashed border-[#D6D6DD] dark:border-white/20'
            : 'border-2 border-transparent'
        }`}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {status === 'idle' && (
            <motion.button
              key="idle"
              type="submit"
              onClick={startAction}
              initial={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
              transition={spring}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 whitespace-nowrap dark:bg-zinc-800 border border-white/10 hover:border-white/20 shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-shadow duration-300 cursor-pointer"
            >
              <Zap className="h-5 w-5 text-purple-500 fill-purple-500" />
              <AnimatedText
                text={text}
                className="text-[16px] font-semibold text-[#26262B] dark:text-zinc-100"
              />
            </motion.button>
          )}

          {status === 'running' && (
            <motion.div
              key="running"
              initial={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
              transition={spring}
              className="flex flex-1 items-center justify-between gap-3 px-4 whitespace-nowrap bg-black/40 backdrop-blur-md h-full rounded-full"
            >
              <div className="flex items-center gap-3">
                <DotmSquare3 size={28} dotSize={3.5} color="#a855f7" className="flex-shrink-0" />
                <div className="flex items-center gap-2">
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, scale: 0, filter: 'blur(4px)' }}
                      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, scale: 0, filter: 'blur(4px)' }}
                      transition={spring}
                      className="flex-shrink-0"
                    >
                      {React.createElement(steps[currentStep].icon, {
                        className: 'w-5 h-5 text-purple-500',
                      })}
                    </motion.div>
                  </AnimatePresence>
                  <AnimatedText
                    text={steps[currentStep].label}
                    className="text-[14px] font-medium text-[#28272A] dark:text-zinc-300"
                  />
                </div>
              </div>

              <motion.button
                type="button"
                onClick={reset}
                initial={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
                transition={{ ...spring, delay: 0.15 }}
                className="ml-1 rounded-full bg-zinc-800 hover:bg-zinc-700 p-1.5 cursor-pointer border border-white/10"
              >
                <IoCloseSharp className="h-4 w-4 text-zinc-400" />
              </motion.button>
            </motion.div>
          )}

          {status === 'done' && (
            <motion.button
              key="done"
              type="button"
              onClick={reset}
              initial={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
              transition={spring}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#1b4332] border border-[#2d6a4f]/30 px-5 py-3 whitespace-nowrap cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.15)]"
            >
              <HiBadgeCheck className="h-6 w-6 text-[#22c55e]" />
              <AnimatedText
                text="Access Confirmed"
                className="text-[16px] font-bold text-[#22c55e]"
              />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
