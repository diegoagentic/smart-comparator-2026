import { useState, useEffect, type KeyboardEvent } from 'react';
import { PaperAirplaneIcon, SparklesIcon, ChevronUpIcon, ClockIcon } from '@heroicons/react/24/solid';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useGenUI } from '../../context/GenUIContext';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function CommandCenter() {
    const [input, setInput] = useState('');
    const [isHighlighted, setIsHighlighted] = useState(false);
    const { sendMessage, isGenerating, isStreamOpen, toggleStream, setStreamOpen, setShowTriggers, showTriggers, openStreamFresh } = useGenUI();

    useEffect(() => {
        const handleHighlight = (e: CustomEvent) => {
            if (e.detail === 'gen-ui-scenarios' || e.detail === 'quote-flow') {
                setIsHighlighted(true);
                openStreamFresh();   // open with clean state
                setShowTriggers(true);
                setTimeout(() => setIsHighlighted(false), 4000);
            }
        };
        window.addEventListener('demo-highlight', handleHighlight as EventListener);
        return () => window.removeEventListener('demo-highlight', handleHighlight as EventListener);
    }, [openStreamFresh, setShowTriggers]);

    const handleSend = () => {
        if (!input.trim() || isGenerating) return;
        sendMessage(input);
        setInput('');
        setShowTriggers(false); // Hide triggers when sending a custom message
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4">
            <div className={cn(
                "relative group transition-all duration-700 ease-in-out rounded-2xl",
                isHighlighted && "ring-4 ring-purple-500 ring-offset-4 ring-offset-background shadow-[0_0_30px_rgba(168,85,247,0.6)] animate-pulse"
            )}>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center bg-card rounded-2xl shadow-xl border border-border p-2 gap-1">
                    <button
                        onClick={toggleStream}
                        className={`p-2 rounded-xl text-muted-foreground hover:text-zinc-900 hover:bg-brand-300 dark:hover:bg-brand-600/50 dark:hover:text-white transition-all ${isStreamOpen ? 'bg-brand-300 dark:bg-brand-600/50 text-foreground' : ''}`}
                        title={isStreamOpen ? "Hide Stream" : "Show Stream"}
                    >
                        <ChevronUpIcon className={`w-5 h-5 transition-transform duration-300 ${isStreamOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <button
                        onClick={() => {
                            openStreamFresh();
                            setShowTriggers(true);
                        }}
                        className={`p-2 rounded-xl text-muted-foreground hover:text-zinc-900 hover:bg-brand-300 dark:hover:bg-brand-600/50 dark:hover:text-white transition-all ${showTriggers ? 'bg-brand-300 dark:bg-brand-600/50 text-foreground' : ''}`}
                        title="History & Triggers"
                    >
                        <ClockIcon className="w-5 h-5" />
                    </button>

                    <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>

                    <div className="pl-1 text-indigo-500">
                        <SparklesIcon className="w-6 h-6 animate-pulse" />
                    </div>
                    <input
                        type="text"
                        className="flex-1 bg-transparent border-none focus:ring-0 text-foreground placeholder-zinc-400 text-lg py-3 outline-none"
                        placeholder="Describe what you need..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isGenerating}
                        autoFocus
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isGenerating}
                        className={`p-3 rounded-xl transition-all ${input.trim() && !isGenerating
                            ? 'bg-primary text-zinc-900 hover:scale-105 shadow-md'
                            : 'bg-muted text-muted-foreground cursor-not-allowed'
                            }`}
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
