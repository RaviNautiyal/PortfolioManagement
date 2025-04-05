'use client'

import { useState, createContext, useContext, useEffect, useRef } from 'react'

// Create context for tab state
const TabsContext = createContext(null)

/**
 * Tabs component for tab navigation
 */
function Tabs({
  children,
  defaultTab = 0,
  onChange,
  className = '',
  variant = 'underline',
  fullWidth = false,
  align = 'left',
  ...props
}) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  
  // Get array of tab labels/content from children
  const tabsArray = Array.isArray(children) ? children : [children]
  
  // Handle tab change
  const handleTabChange = (index) => {
    setActiveTab(index)
    
    if (onChange) {
      onChange(index)
    }
  }
  
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }
  
  const variantClasses = {
    underline: 'border-b border-gray-200',
    pills: 'p-1 bg-gray-100 rounded-lg',
    enclosed: 'border-b border-gray-200',
  }
  
  return (
    <TabsContext.Provider
      value={{
        activeTab,
        handleTabChange,
        variant,
        tabsArray,
        fullWidth,
      }}
    >
      <div className={className} {...props}>
        <div className={`flex ${alignClasses[align]} ${variantClasses[variant]}`}>
          {tabsArray.map((tab, index) => {
            if (!tab || typeof tab !== 'object') return null
            
            return React.cloneElement(tab, {
              key: index,
              index,
              label: tab.props.label,
              icon: tab.props.icon,
              disabled: tab.props.disabled,
            })
          })}
        </div>
        
        <div className="mt-4">
          {tabsArray[activeTab] && tabsArray[activeTab].props.children}
        </div>
      </div>
    </TabsContext.Provider>
  )
}

/**
 * Tab component for individual tabs
 */
function Tab({
  label,
  icon,
  index,
  disabled = false,
  className = '',
  ...props
}) {
  const { activeTab, handleTabChange, variant, fullWidth } = useContext(TabsContext)
  const isActive = activeTab === index
  
  // Define styles based on variant
  const getVariantStyles = () => {
    if (variant === 'underline') {
      return isActive
        ? 'border-b-2 border-primary-500 text-primary-500'
        : 'border-b-2 border-transparent hover:border-gray-300 text-gray-500 hover:text-gray-700'
    }
    
    if (variant === 'pills') {
      return isActive
        ? 'bg-white shadow-sm text-primary-500'
        : 'text-gray-500 hover:text-gray-700'
    }
    
    if (variant === 'enclosed') {
      return isActive
        ? 'border-l border-t border-r border-b-0 border-gray-200 text-primary-500 rounded-t-md -mb-px bg-white'
        : 'border border-transparent text-gray-500 hover:text-gray-700'
    }
    
    return ''
  }
  
  const baseStyles = [
    'py-3 px-4 font-medium text-sm focus:outline-none transition-colors duration-200',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    getVariantStyles(),
    fullWidth ? 'flex-1 text-center' : '',
    className,
  ].join(' ')
  
  return (
    <button
      className={baseStyles}
      onClick={() => !disabled && handleTabChange(index)}
      disabled={disabled}
      aria-selected={isActive}
      role="tab"
      {...props}
    >
      <div className="flex items-center justify-center">
        {icon && <span className="mr-2">{icon}</span>}
        {label}
      </div>
    </button>
  )
}

/**
 * TabPanel component for tab content
 */
function TabPanel({ children, label, icon, ...props }) {
  return <div {...props}>{children}</div>
}

Tabs.Tab = TabPanel
export { Tabs, Tab, TabPanel }
export default Tabs 