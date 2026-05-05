/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Copy, Check, Scissors, Trash2, Info, ChevronDown, ChevronUp, ListChecks, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Section 2: Text-Splitting Utility Function
 */
const splitTextIntoChunks = (text: string, limit: number): string[] => {
  if (!text || limit <= 0) return [];
  if (text.length <= limit) return [text];

  const chunks: string[] = [];
  let remainingText = text.trim();

  while (remainingText.length > 0) {
    if (remainingText.length <= limit) {
      chunks.push(remainingText);
      break;
    }

    let slice = remainingText.substring(0, limit);
    
    const lastPunctuation = Math.max(
      slice.lastIndexOf('.'),
      slice.lastIndexOf('!'),
      slice.lastIndexOf('?')
    );

    let splitIndex = -1;

    if (lastPunctuation !== -1 && lastPunctuation > limit * 0.5) {
      splitIndex = lastPunctuation + 1;
    } else {
      const lastSpace = slice.lastIndexOf(' ');
      if (lastSpace !== -1) {
        splitIndex = lastSpace + 1;
      } else {
        splitIndex = limit;
      }
    }

    chunks.push(remainingText.substring(0, splitIndex).trim());
    remainingText = remainingText.substring(splitIndex).trim();
  }

  return chunks;
};

export default function App() {
  // Section 1: React State Structure
  const [inputText, setInputText] = useState('');
  const [charLimit, setCharLimit] = useState(5000);
  const [chunks, setChunks] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isDetailedViewOpen, setIsDetailedViewOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const [isCopiedAll, setIsCopiedAll] = useState(false);
  const [removeNewlines, setRemoveNewlines] = useState(true);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleSplit = useCallback(() => {
    const result = splitTextIntoChunks(inputText, charLimit);
    setChunks(result);
    setIsDetailedViewOpen(false);
  }, [inputText, charLimit]);

  const handleClear = () => {
    setInputText('');
    setChunks([]);
    setIsDetailedViewOpen(false);
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const copyAllChunks = async () => {
    try {
      const allText = chunks.join('\n\n');
      await navigator.clipboard.writeText(allText);
      setIsCopiedAll(true);
      setTimeout(() => setIsCopiedAll(false), 2000);
    } catch (err) {
      console.error('Failed to copy all chunks: ', err);
    }
  };

  const handleReplace = () => {
    if (!findText) return;
    const newText = inputText.split(findText).join(replaceText);
    setInputText(newText);
  };


  const totalChars = inputText.length;
  const estimatedChunks = Math.ceil(totalChars / charLimit);

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center space-y-4 relative">
          <div className="absolute top-0 right-0 flex items-center space-x-2 bg-card/50 p-2 rounded-lg border border-border backdrop-blur-sm">
            <Sun className="h-4 w-4 text-muted-foreground" />
            <Switch 
              id="theme-toggle" 
              checked={isDarkMode} 
              onCheckedChange={setIsDarkMode} 
            />
            <Moon className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="text-center space-y-2 pt-8 sm:pt-0">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold tracking-tight sm:text-5xl"
            >
              Chunkify
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground"
            >
              Intelligent text splitting for manageable content.
            </motion.p>
          </div>
        </div>

        {/* Input Section */}
        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Scissors className="w-5 h-5 text-primary" />
              Input Text
            </CardTitle>
            <CardDescription>
              Paste your long text below and set the character limit per chunk.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Paste your long text here..."
                className="min-h-[300px] resize-y focus:ring-primary"
                value={inputText}
                onChange={(e) => {
                  let val = e.target.value;
                  if (removeNewlines) {
                    val = val.replace(/[\r\n]+/g, ' ');
                  }
                  setInputText(val);
                }}
                id="main-input"
              />
              <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span>Characters: {totalChars.toLocaleString()}</span>
                <span>Est. Chunks: {estimatedChunks}</span>
              </div>
            </div>

            {/* Find & Replace and Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border border-border">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Find & Replace</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Find..." 
                    value={findText} 
                    onChange={e => setFindText(e.target.value)} 
                    className="h-8 text-sm bg-background" 
                  />
                  <Input 
                    placeholder="Replace with..." 
                    value={replaceText} 
                    onChange={e => setReplaceText(e.target.value)} 
                    className="h-8 text-sm bg-background" 
                  />
                  <Button size="sm" onClick={handleReplace} variant="secondary" className="h-8 whitespace-nowrap">
                    Replace All
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Formatting Options</Label>
                <div className="flex items-center space-x-2 pt-1 h-8">
                  <Switch 
                    id="remove-newlines" 
                    checked={removeNewlines} 
                    onCheckedChange={(checked) => {
                      setRemoveNewlines(checked);
                      if (checked) {
                        setInputText(prev => prev.replace(/[\r\n]+/g, ' '));
                      }
                    }} 
                  />
                  <Label htmlFor="remove-newlines" className="text-sm cursor-pointer font-normal">
                    Auto-remove line breaks
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-end pt-2">
              <div className="flex-1 space-y-2 w-full">
                <Label htmlFor="limit" className="text-sm font-medium">
                  Character Limit per Chunk
                </Label>
                <Input
                  type="number"
                  id="limit"
                  value={charLimit}
                  onChange={(e) => setCharLimit(Number(e.target.value))}
                  min={10}
                  className="border-input"
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  onClick={handleClear}
                  className="flex-1 sm:flex-none"
                  id="clear-button"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
                <Button 
                  onClick={handleSplit}
                  disabled={!inputText.trim()}
                  className="flex-1 sm:flex-none shadow-sm"
                  id="split-button"
                >
                  Split Text
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <AnimatePresence>
          {chunks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              {/* Quick Copy Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-emerald-500" />
                    Quick Copy Previews
                  </h2>
                  <div className="flex items-center gap-2 text-xs">
                    <Button 
                      size="sm" 
                      variant={isCopiedAll ? "default" : "outline"}
                      className={`h-8 transition-all duration-200 ${isCopiedAll ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600" : ""}`}
                      onClick={copyAllChunks}
                    >
                      {isCopiedAll ? (
                        <>
                          <Check className="w-4 h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Copied All</span>
                          <span className="sm:hidden">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Copy All</span>
                          <span className="sm:hidden">All</span>
                        </>
                      )}
                    </Button>
                    <div className="hidden sm:flex items-center gap-1 text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      <Info className="w-3 h-3" />
                      Compact list for fast copying
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  {chunks.map((chunk, index) => (
                    <motion.div
                      key={`quick-${index}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg group hover:border-emerald-500/50 transition-colors shadow-sm"
                    >
                      <div className="flex-none w-8 h-8 flex items-center justify-center bg-muted rounded text-xs font-bold text-muted-foreground">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-card-foreground truncate italic">
                          "{chunk.substring(0, 80)}..."
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant={copiedIndex === index ? "default" : "outline"}
                        className={`flex-none h-8 px-3 transition-all duration-200 ${
                          copiedIndex === index 
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600" 
                            : ""
                        }`}
                        onClick={() => copyToClipboard(chunk, index)}
                        id={`quick-copy-${index}`}
                      >
                        {copiedIndex === index ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Detailed View Toggle */}
              <div className="pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-between py-6 px-4 hover:bg-muted rounded-xl"
                  onClick={() => setIsDetailedViewOpen(!isDetailedViewOpen)}
                  id="toggle-detailed-view"
                >
                  <span className="font-semibold flex items-center gap-2">
                    <Scissors className="w-4 h-4" />
                    Full Chunk Details
                  </span>
                  {isDetailedViewOpen ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </Button>

                <AnimatePresence>
                  {isDetailedViewOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid gap-6 pt-6">
                        {chunks.map((chunk, index) => (
                          <motion.div
                            key={`detailed-${index}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Card className="overflow-hidden group hover:border-primary/50 transition-colors shadow-sm">
                              <div className="bg-muted/50 border-b border-border px-4 py-2 flex justify-between items-center">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                  Chunk {index + 1}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {chunk.length} chars
                                </span>
                              </div>
                              <CardContent className="p-4 space-y-3">
                                <Textarea
                                  readOnly
                                  value={chunk}
                                  className="min-h-[120px] bg-transparent border-none focus-visible:ring-0 resize-none text-card-foreground text-sm leading-relaxed"
                                />
                                <div className="flex justify-end">
                                  <Button
                                    size="sm"
                                    variant={copiedIndex === index ? "default" : "outline"}
                                    className={`w-full sm:w-auto transition-all duration-200 ${
                                      copiedIndex === index 
                                        ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600" 
                                        : ""
                                    }`}
                                    onClick={() => copyToClipboard(chunk, index)}
                                    id={`copy-button-${index}`}
                                  >
                                    {copiedIndex === index ? (
                                      <>
                                        <Check className="w-4 h-4 mr-2" />
                                        Copied!
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-4 h-4 mr-2" />
                                        Copy Chunk
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {chunks.length === 0 && inputText && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Click "Split Text" to see the results here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
