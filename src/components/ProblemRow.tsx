'use client';

import { useState, useEffect } from 'react';

interface Problem {
    id: number;
    title: string;
    difficulty: string;
    category: string | null;
    url: string;
    companies: string[];
    tags?: string[];
    frequency?: number;
}

interface ProblemRowProps {
    problem: Problem;
}

export function ProblemRow({ problem }: ProblemRowProps) {
    const [isCompleted, setIsCompleted] = useState(false);

    // Load completion status from localStorage
    useEffect(() => {
        const completed = localStorage.getItem(`problem-${problem.id}`);
        setIsCompleted(completed === 'true');
    }, [problem.id]);

    // Toggle completion and save to localStorage
    const toggleCompleted = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation
        e.stopPropagation();

        const newStatus = !isCompleted;
        setIsCompleted(newStatus);
        localStorage.setItem(`problem-${problem.id}`, String(newStatus));
    };

    const [isExpanded, setIsExpanded] = useState(false);
    const [note, setNote] = useState('');

    // Load expanded status and note from localStorage
    useEffect(() => {
        const expanded = localStorage.getItem(`problem-info-${problem.id}`);
        setIsExpanded(expanded === 'true');

        const savedNote = localStorage.getItem(`problem-note-${problem.id}`);
        if (savedNote) {
            setNote(savedNote);
        }
    }, [problem.id]);

    const toggleExpanded = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const newExpanded = !isExpanded;
        setIsExpanded(newExpanded);
        localStorage.setItem(`problem-info-${problem.id}`, String(newExpanded));
    };

    const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newNote = e.target.value;
        setNote(newNote);
        localStorage.setItem(`problem-note-${problem.id}`, newNote);
    };

    return (
        <div className="problem-row-wrapper">
            <a
                href={problem.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`paper-row ${isCompleted ? 'completed' : ''}`}
                style={{ textDecoration: 'none' }}
            >
                <div className="row-content">
                    <div className="title-wrapper">
                        {/* Checkbox */}
                        <button
                            onClick={toggleCompleted}
                            className="completion-checkbox"
                            aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                            {isCompleted ? '✓' : ''}
                        </button>

                        <h2 className="row-title">
                            {problem.title}
                        </h2>
                    </div>
                    <div className="row-meta">
                        {problem.category || 'Misc'} &mdash; <span className="company-name">{problem.companies.slice(0, 3).join(', ')}</span>
                    </div>
                </div>

                <div className="row-actions">


                    <div className={`stamp-badge badge-${problem.difficulty.toLowerCase()}`}>
                        {problem.difficulty}
                    </div>

                    {/* Frequency Bar - Fixed position after difficulty badge */}
                    {problem.frequency !== undefined && (
                        <div className="frequency-container">
                            <div className="frequency-bar">
                                <div
                                    className="frequency-fill"
                                    style={{ width: `${Math.round(problem.frequency * 100)}%` }}
                                ></div>
                            </div>
                            <span className="frequency-label">
                                {Math.round(problem.frequency * 100)}%
                            </span>
                        </div>
                    )}

                    <button
                        onClick={toggleExpanded}
                        className={`info-btn ${isExpanded ? 'active' : ''}`}
                        aria-label="Toggle info"
                    >
                        i
                    </button>
                </div>
            </a>

            {isExpanded && (
                <div className="info-panel">
                    <div className="info-content-text">
                        <h3>My Notes</h3>
                        <textarea
                            className="note-textarea"
                            value={note}
                            onChange={handleNoteChange}
                            placeholder={`Write your notes for ${problem.title} here...`}
                            spellCheck={false}
                        />
                        <div className="note-footer">
                            <span>Saved to local storage</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
