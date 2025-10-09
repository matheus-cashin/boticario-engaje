
import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // Função para converter markdown básico em HTML
  const parseMarkdown = (text: string): string => {
    return text
      // Headers
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      
      // Italic
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      
      // Lists
      .replace(/^\* (.*$)/gm, '<li class="ml-4">• $1</li>')
      .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>')
      
      // Line breaks
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>')
      
      // Code blocks
      .replace(/```(.*?)```/gs, '<pre class="bg-gray-100 p-2 rounded text-sm font-mono">$1</pre>')
      
      // Inline code
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-sm font-mono">$1</code>');
  };

  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ 
        __html: parseMarkdown(content) 
      }} 
    />
  );
}
