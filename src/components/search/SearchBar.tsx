'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'

interface Props {
  defaultValue?: string
  placeholder?: string
  size?: 'sm' | 'lg'
  onSearch?: (q: string) => void
}

export function SearchBar({ 
  defaultValue = '', 
  placeholder = 'Search bikes, parts, gear...',
  size = 'lg',
  onSearch 
}: Props) {
  const router = useRouter()
  const [value, setValue] = useState(defaultValue)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch suggestions with debounce
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const res = await fetch(`/api/listings?suggest=${encodeURIComponent(query)}`)
      if (res.ok) {
        const data = await res.json()
        setSuggestions(data || [])
        setShowSuggestions(true)
        setSelectedIndex(-1)
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Debounce suggestions fetch
    if (newValue.trim()) {
      debounceTimer.current = setTimeout(() => {
        fetchSuggestions(newValue)
      }, 300)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSearch = (query: string) => {
    if (!query.trim()) return

    if (onSearch) {
      onSearch(query)
    } else {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
    setShowSuggestions(false)
    setSuggestions([])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearch(value)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSearch(suggestions[selectedIndex])
          setValue(suggestions[selectedIndex])
        } else {
          handleSearch(value)
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowSuggestions(false)
        break
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setValue(suggestion)
    handleSearch(suggestion)
  }

  const handleClear = () => {
    setValue('')
    setSuggestions([])
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const sizeStyles = size === 'sm' ? {
    containerHeight: 38,
    inputPaddingX: 36,
    borderRadius: '8px',
    fontSize: 13,
    iconSize: 16,
    gap: 8,
  } : {
    containerHeight: 48,
    inputPaddingX: 42,
    borderRadius: '10px',
    fontSize: 15,
    iconSize: 18,
    gap: 12,
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <style>{`
        .search-input:focus {
          border-color: #0D1B2A !important;
          outline: none;
        }
        .suggestion-item {
          padding: 10px 16px;
          height: 40px;
          display: flex;
          align-items: center;
          cursor: pointer;
          font-size: 14px;
          color: #1a1a1a;
          transition: background-color 0.15s;
        }
        .suggestion-item:hover,
        .suggestion-item.selected {
          background-color: #f0f4ff;
        }
      `}</style>

      <div style={{ position: 'relative', width: '100%' }}>
        <Search 
          size={sizeStyles.iconSize} 
          style={{
            position: 'absolute',
            left: sizeStyles.gap,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9a9a9a',
            flexShrink: 0,
          }}
        />
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => value.trim() && showSuggestions && setSuggestions(suggestions.length > 0 ? suggestions : [])}
          placeholder={placeholder}
          style={{
            width: '100%',
            height: sizeStyles.containerHeight,
            paddingLeft: sizeStyles.inputPaddingX,
            paddingRight: value ? sizeStyles.inputPaddingX : sizeStyles.gap,
            borderRadius: sizeStyles.borderRadius,
            background: '#fff',
            border: '1.5px solid #e4e4e7',
            fontSize: sizeStyles.fontSize,
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s',
          }}
        />
        {value && (
          <button
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: sizeStyles.gap,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#9a9a9a',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={sizeStyles.iconSize} />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: '#fff',
          border: '1px solid #e4e4e7',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          marginTop: 8,
          zIndex: 10,
          overflow: 'hidden',
        }}>
          {suggestions.map((suggestion, idx) => (
            <div
              key={idx}
              className={`suggestion-item${selectedIndex === idx ? ' selected' : ''}`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
