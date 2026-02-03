'use client';

import { useEffect, useState } from 'react';
import { ProblemRow } from '@/components/ProblemRow';

type Problem = {
  id: number;
  title: string;
  difficulty: string;
  category: string | null;
  url: string;
  companies: string[];
  tags: string[];
  frequency?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ITEMS_PER_PAGE = 30;

export default function Home() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>([]);
  const [allCompanies, setAllCompanies] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<{ name: string; count: number }[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tagSearchQuery, setTagSearchQuery] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch problems
  useEffect(() => {
    setIsLoading(true);
    fetch('/api/problems')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setProblems(data);
          setFilteredProblems(data);

          const companies = new Set<string>();
          const tagCounts = new Map<string, number>();

          data.forEach((problem: Problem) => {
            if (problem.companies && Array.isArray(problem.companies)) {
              problem.companies.forEach(company => companies.add(company));
            }
            if (problem.tags && Array.isArray(problem.tags)) {
              problem.tags.forEach(tag => {
                tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
              });
            }
          });
          setAllCompanies(Array.from(companies).sort());

          const sortedTags = Array.from(tagCounts.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count); // Sort by count descending
          setAllTags(sortedTags);
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching problems:', error);
        setProblems([]);
        setFilteredProblems([]);
        setIsLoading(false);
      });
  }, []);

  // Filter problems when company or difficulty selection changes
  useEffect(() => {
    let filtered = problems;

    // Filter by company
    if (selectedCompany) {
      filtered = filtered.filter(p => p.companies.includes(selectedCompany));
    }

    // Filter by difficulty
    if (selectedDifficulty) {
      filtered = filtered.filter(p => p.difficulty === selectedDifficulty);
    }

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(p => p.tags && p.tags.includes(selectedTag));
    }

    setFilteredProblems(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [selectedCompany, selectedDifficulty, selectedTag, problems]);

  // Filter companies by search
  const filteredCompanies = allCompanies.filter(company =>
    company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTags = allTags.filter(tag =>
    tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredProblems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProblems = filteredProblems.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  // Better Pagination for benim agalar B)
  const getPaginationNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 2; // Pages to show around current page

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate range around current page
      let start = Math.max(2, currentPage - delta);
      let end = Math.min(totalPages - 1, currentPage + delta);

      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push('...');
      }

      // Add pages around current page
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  if (isLoading) {
    return (
      <main className="container">
        <div style={{ textAlign: 'center', padding: '4rem', fontFamily: 'var(--font-hand)', fontSize: '2rem' }}>
          Loading problems...
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      {/* Newspaper Header */}
      <header className="newspaper-header">
        <h1 className="main-title">The Coding Daily</h1>
        <div className="sub-header">Est. Vol. 1 - Morning Edition</div>

        <div className="separator-bar">
          <div className="est-badge-container">
            <span className="est-badge">EST. 2026</span>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="filter-section">
        {/* Difficulty Filter */}
        <div className="difficulty-filter">
          <button
            className={`difficulty-btn ${selectedDifficulty === '' ? 'active' : ''}`}
            onClick={() => setSelectedDifficulty('')}
          >
            All
          </button>
          <button
            className={`difficulty-btn easy ${selectedDifficulty === 'Easy' ? 'active' : ''}`}
            onClick={() => setSelectedDifficulty('Easy')}
          >
            Easy
          </button>
          <button
            className={`difficulty-btn medium ${selectedDifficulty === 'Medium' ? 'active' : ''}`}
            onClick={() => setSelectedDifficulty('Medium')}
          >
            Medium
          </button>
          <button
            className={`difficulty-btn hard ${selectedDifficulty === 'Hard' ? 'active' : ''}`}
            onClick={() => setSelectedDifficulty('Hard')}
          >
            Hard
          </button>
        </div>

        {/* Filters Row (Company & Tags) */}
        <div className="filters-row">
          {/* Company Filter */}
          <div className="filter-dropdown">
            <button
              className="filter-button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="filter-icon"></span>
              {selectedCompany || 'All Companies'}
              <div style={{ marginLeft: 'auto' }}>
                <span className="dropdown-arrow">{isDropdownOpen ? '▲' : '▼'}</span>
              </div>
            </button>

            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="company-search-input"
                  />
                </div>

                <div className="company-list">
                  <div
                    className="company-item"
                    onClick={() => {
                      setSelectedCompany('');
                      setIsDropdownOpen(false);
                      setSearchQuery('');
                    }}
                  >
                    All Companies
                  </div>
                  {filteredCompanies.map(company => (
                    <div
                      key={company}
                      className="company-item"
                      onClick={() => {
                        setSelectedCompany(company);
                        setIsDropdownOpen(false);
                        setSearchQuery('');
                      }}
                    >
                      {company}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tag Filter */}
          <div className="filter-dropdown">
            <button
              className="filter-button"
              onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
            >
              <span className="filter-icon"></span>
              {selectedTag || 'All Topics'}
              <div style={{ marginLeft: 'auto' }}>
                <span className="dropdown-arrow">{isTagDropdownOpen ? '▲' : '▼'}</span>
              </div>
            </button>

            {isTagDropdownOpen && (
              <div className="dropdown-menu">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search topic..."
                    value={tagSearchQuery}
                    onChange={(e) => setTagSearchQuery(e.target.value)}
                    className="company-search-input"
                  />
                </div>

                <div className="company-list">
                  <div
                    className="company-item"
                    onClick={() => {
                      setSelectedTag('');
                      setIsTagDropdownOpen(false);
                      setTagSearchQuery('');
                    }}
                  >
                    All Topics
                  </div>
                  {filteredTags.map(tag => (
                    <div
                      key={tag.name}
                      className="company-item"
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      onClick={() => {
                        setSelectedTag(tag.name);
                        setIsTagDropdownOpen(false);
                        setTagSearchQuery('');
                      }}
                    >
                      <span>{tag.name}</span>
                      <span className="tag-count">{tag.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filter Info */}
        {
          (selectedCompany || selectedDifficulty || selectedTag) && (
            <div className="filter-info">
              Showing {filteredProblems.length} problems
              {selectedDifficulty && <> • <strong>{selectedDifficulty}</strong></>}
              {selectedCompany && <> • <strong>{selectedCompany}</strong></>}
              {selectedTag && <> • <strong>{selectedTag}</strong></>}
              <button
                className="clear-filter"
                onClick={() => {
                  setSelectedCompany('');
                  setSelectedDifficulty('');
                  setSelectedTag('');
                }}
              >
                ✕ Clear All
              </button>
            </div>
          )
        }
      </div>

      {/* Problem List */}
      <div className="problem-list">
        <div className="separator-simple"></div>

        {
          currentProblems.map((problem) => (
            <ProblemRow key={problem.id} problem={problem} />
          ))
        }

        {
          filteredProblems.length === 0 && !isLoading && (
            <div className="no-results">
              <p>No problems found.</p>
            </div>
          )
        }

        {
          filteredProblems.length > 0 && (
            <div className="separator-simple" style={{ marginTop: '0' }}></div>
          )
        }
      </div >

      {/* Pagination Gardasim this is better*/}
      {
        totalPages > 1 && (
          <div className="pagination">
            <div className="pagination-buttons">
              <button
                className="pagination-btn pagination-arrow"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                title="Previous page"
              >
                ‹
              </button>
              
              {getPaginationNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                    ⋯
                  </span>
                ) : (
                  <button
                    key={page}
                    className={`pagination-btn pagination-number ${currentPage === page ? 'active' : ''}`}
                    onClick={() => goToPage(page as number)}
                  >
                    {page}
                  </button>
                )
              ))}
              
              <button
                className="pagination-btn pagination-arrow"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                title="Next page"
              >
                ›
              </button>
            </div>
          </div>
        )
      }

      <footer style={{ marginTop: '4rem', textAlign: 'center', opacity: 0.6, fontStyle: 'italic', fontFamily: 'var(--font-hand)', fontSize: '1.2rem' }}>
        <p>&copy; 2026 The Coding Daily. All rights reserved.</p>
      </footer>
    </main >
  );
}
