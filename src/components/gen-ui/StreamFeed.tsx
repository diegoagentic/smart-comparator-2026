import { useRef, useEffect, useState } from 'react';
import { useGenUI, type StreamMessage, TRIGGERS } from '../../context/GenUIContext';
import ArtifactContainer from './artifacts/ArtifactContainer';
import ThinkingIndicator from './ThinkingIndicator';
import { UserIcon } from '@heroicons/react/24/solid';
import { SparklesIcon, XMarkIcon, ArrowRightIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const MessageBubble = ({ message }: { message: StreamMessage }) => {
    const { navigate } = useGenUI();
    const isUser = message.type === 'user';

    const renderContent = (content: string) => {
        // Regex for [Access Text](url)
        const parts = content.split(/(\[[^\]]+\]\([^)]+\))/g);

        return parts.map((part, index) => {
            const linkMatch = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
            if (linkMatch) {
                const [_, text, url] = linkMatch;
                const isInternal = url.startsWith('/');
                return (
                    <a
                        key={index}
                        href={url}
                        onClick={(e) => {
                            if (isInternal) {
                                e.preventDefault();
                                // Parse URL to separate path and search
                                const [path] = url.split('?');
                                // Push state so URL updates (important for Transactions.tsx useEffect)
                                window.history.pushState(null, '', url);
                                // Trigger navigation (mounts/updates component)
                                // Remove leading / for page name matching in App.tsx
                                navigate(path.substring(1));
                            }
                        }}
                        target={isInternal ? undefined : '_blank'}
                        rel={isInternal ? undefined : 'noopener noreferrer'}
                        className={`font-semibold hover:underline px-1 rounded ${isUser ? 'text-zinc-900 bg-white/20' : 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                            }`}
                    >
                        {text}
                    </a>
                );
            }

            // Handle Bold **text**
            const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
            return boldParts.map((subPart, subIndex) => {
                const boldMatch = subPart.match(/\*\*([^*]+)\*\*/);
                if (boldMatch) {
                    return <strong key={`${index}-${subIndex}`} className="font-semibold">{boldMatch[1]}</strong>;
                }
                return <span key={`${index}-${subIndex}`}>{subPart}</span>;
            });
        });
    };

    return (
        <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-4`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUser ? 'bg-zinc-200 dark:bg-zinc-800 text-muted-foreground' : 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white'
                }`}>
                {isUser ? <UserIcon className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
            </div>

            <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${isUser
                    ? 'bg-primary text-zinc-900 rounded-tr-none'
                    : 'bg-white/50 dark:bg-zinc-800/50 border border-border text-foreground rounded-tl-none'
                    }`}>
                    {renderContent(message.content)}
                </div>

                {message.artifact && (
                    <div className="mt-2 w-full">
                        <ArtifactContainer artifact={message.artifact} />
                    </div>
                )}

                <span className="text-[10px] text-muted-foreground mt-1 px-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    );
};

export default function StreamFeed() {
    const { messages, isGenerating, isStreamOpen, showTriggers, setShowTriggers, sendMessage, clearStream } = useGenUI();
    const bottomRef = useRef<HTMLDivElement>(null);
    const [highlightedTrigger, setHighlightedTrigger] = useState<string | null>(null);

    useEffect(() => {
        const handleHighlight = (e: CustomEvent) => {
            if (e.detail === 'quote-flow') {
                setHighlightedTrigger('t5');
                setTimeout(() => setHighlightedTrigger(null), 4000);
            }
        };
        window.addEventListener('demo-highlight', handleHighlight as EventListener);
        return () => window.removeEventListener('demo-highlight', handleHighlight as EventListener);
    }, []);

    useEffect(() => {
        if (isStreamOpen && !showTriggers) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isGenerating, isStreamOpen, showTriggers]);

    if (!isStreamOpen) return null;

    const handleTriggerClick = (prompt: string) => {
        setShowTriggers(false);
        sendMessage(prompt);
    };

    return (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-[95vw] max-w-6xl max-h-[70vh] bg-white/95 dark:bg-zinc-800/95 backdrop-blur-xl border border-border rounded-3xl shadow-2xl z-40 px-2 py-2 flex flex-col origin-bottom animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header / Title Bar */}
            <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {showTriggers ? 'Select a Scenario' : 'Generative Stream'}
                </span>
                <div className="flex items-center gap-2">
                    {/* New Conversation button — clears stream and restarts */}
                    {!showTriggers && messages.length > 1 && (
                        <button
                            onClick={clearStream}
                            title="New conversation"
                            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-red-500 dark:hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10"
                        >
                            <ArrowPathIcon className="w-3.5 h-3.5" />
                            New
                        </button>
                    )}
                    {showTriggers ? (
                        <button onClick={() => setShowTriggers(false)} className="text-muted-foreground hover:text-foreground">
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    ) : (
                        <button onClick={() => setShowTriggers(true)} className="text-[10px] text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-1">
                            History &amp; Actions
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-micro">
                {showTriggers ? (
                    <div className="space-y-2">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-4">
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                Select a scenario below to simulate the generative workflow.
                            </p>
                        </div>
                        {TRIGGERS.map((trigger) => (
                            <button
                                key={trigger.id}
                                onClick={() => handleTriggerClick(trigger.prompt)}
                                className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group border ${highlightedTrigger === trigger.id
                                    ? "bg-green-100 dark:bg-green-900/30 border-green-500 animate-[pulse_1.5s_ease-in-out_infinite] relative z-50 shadow-lg glow"
                                    : "border-transparent hover:bg-muted hover:border-zinc-200 dark:hover:border-zinc-700"
                                    }`}
                            >
                                <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className={`w-2 h-2 rounded-full ${trigger.category === 'correction' ? 'bg-red-400' :
                                            trigger.category === 'sourcing' ? 'bg-amber-400' :
                                                trigger.category === 'layout' ? 'bg-indigo-400' :
                                                    trigger.category === 'support' ? 'bg-blue-400' : 'bg-green-400'
                                            }`} />
                                        <span className="font-semibold text-sm text-foreground">{trigger.label}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground pl-4">{trigger.prompt}</p>
                                </div>
                                <ArrowRightIcon className="w-4 h-4 text-zinc-300 group-hover:text-primary transition-colors" />
                            </button>
                        ))}
                    </div>
                ) : (
                    <>
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground opacity-50">
                                <SparklesIcon className="w-8 h-8 mb-2" />
                                <p className="text-sm">Start a conversation...</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <MessageBubble key={msg.id} message={msg} />
                            ))
                        )}
                        {isGenerating && <ThinkingIndicator />}
                        <div ref={bottomRef} />
                    </>
                )}
            </div>
        </div>
    );
}
