import { SparklesIcon } from '@heroicons/react/24/solid';

export default function ThinkingIndicator() {
    return (
        <div className="flex gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white flex items-center justify-center shrink-0">
                <SparklesIcon className="w-5 h-5 animate-pulse" />
            </div>
            <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
            </div>
        </div>
    );
}
