'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Custom hook for fetching data with loading and error states
 * @param {string} url - The URL to fetch data from
 * @param {object} options - Fetch options
 * @returns {object} Object containing data, loading state, error state, and a refetch function
 */
export function useFetch(url, options = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(url, options)
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err.message || 'An error occurred while fetching data')
    } finally {
      setLoading(false)
    }
  }, [url, options])
  
  useEffect(() => {
    fetchData()
  }, [fetchData])
  
  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])
  
  return { data, loading, error, refetch }
}

/**
 * Custom hook for managing a controlled form
 * @param {object} initialValues - The initial form values
 * @param {function} onSubmit - Function to call on form submission
 * @param {function} validate - Optional validation function
 * @returns {object} Form state and handlers
 */
export function useForm(initialValues, onSubmit, validate) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])
  
  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }, [])
  
  // Handle input blur (for validation)
  const handleBlur = useCallback((e) => {
    const { name } = e.target
    
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }))
  }, [])
  
  // Handle form submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      
      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      )
      setTouched(allTouched)
      
      // Validate if validation function provided
      if (validate) {
        const validationErrors = validate(values)
        setErrors(validationErrors)
        
        // Don't submit if there are errors
        if (Object.keys(validationErrors).length > 0) {
          return
        }
      }
      
      setIsSubmitting(true)
      
      try {
        await onSubmit(values)
        resetForm()
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          form: error.message || 'Submission failed',
        }))
      } finally {
        setIsSubmitting(false)
      }
    },
    [values, validate, onSubmit, resetForm]
  )
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues,
    setErrors,
  }
}

/**
 * Custom hook for debouncing a value
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} The debounced value
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])
  
  return debouncedValue
}

/**
 * Custom hook for handling infinite scrolling
 * @param {function} fetchMore - Function to fetch more data
 * @param {object} options - Options object
 * @returns {object} Object containing loading state and ref to attach to the sentinel element
 */
export function useInfiniteScroll(fetchMore, options = {}) {
  const { threshold = 0.5, enabled = true } = options
  const [loading, setLoading] = useState(false)
  const observer = useRef(null)
  const sentinelRef = useCallback(
    (node) => {
      if (loading || !enabled) return
      
      if (observer.current) {
        observer.current.disconnect()
      }
      
      observer.current = new IntersectionObserver(
        async ([entry]) => {
          if (entry.isIntersecting) {
            setLoading(true)
            
            try {
              await fetchMore()
            } finally {
              setLoading(false)
            }
          }
        },
        { threshold }
      )
      
      if (node) {
        observer.current.observe(node)
      }
    },
    [fetchMore, loading, threshold, enabled]
  )
  
  return { loading, sentinelRef }
}

/**
 * Custom hook for handling local storage
 * @param {string} key - The local storage key
 * @param {any} initialValue - Initial value if key doesn't exist
 * @returns {array} Array containing current value and setter function
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })
  
  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value
          
        setStoredValue(valueToStore)
        
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        console.error(error)
      }
    },
    [key, storedValue]
  )
  
  return [storedValue, setValue]
}

/**
 * Custom hook for detecting clicks outside an element
 * @param {function} handler - Function to call when clicked outside
 * @returns {object} Ref to attach to the element
 */
export function useClickOutside(handler) {
  const ref = useRef(null)
  
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return
      }
      handler(event)
    }
    
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [handler])
  
  return ref
}

/**
 * Custom hook for detecting when element is in viewport
 * @param {object} options - IntersectionObserver options
 * @returns {array} Array containing ref and boolean indicating if element is visible
 */
export function useInView(options = {}) {
  const [isInView, setIsInView] = useState(false)
  const ref = useRef(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting)
    }, options)
    
    if (ref.current) {
      observer.observe(ref.current)
    }
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [options])
  
  return [ref, isInView]
}

/**
 * Custom hook for media queries
 * @param {string} query - Media query string
 * @returns {boolean} Boolean indicating if media query matches
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false)
  
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const media = window.matchMedia(query)
    setMatches(media.matches)
    
    const listener = (e) => {
      setMatches(e.matches)
    }
    
    // Modern browsers
    media.addEventListener('change', listener)
    
    return () => {
      media.removeEventListener('change', listener)
    }
  }, [query])
  
  return matches
} 