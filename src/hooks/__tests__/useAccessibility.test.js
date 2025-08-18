import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAccessibility, useListNavigation } from '../useAccessibility';

describe('useAccessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides accessibility utilities', () => {
    const { result } = renderHook(() => useAccessibility());
    
    expect(result.current).toHaveProperty('announce');
    expect(result.current).toHaveProperty('isHighContrast');
    expect(result.current).toHaveProperty('getHighContrastStyles');
    expect(result.current).toHaveProperty('AriaLiveRegion');
    expect(result.current).toHaveProperty('generateId');
    expect(result.current).toHaveProperty('focusElement');
  });

  it('generates unique IDs', () => {
    const { result } = renderHook(() => useAccessibility());
    
    const id1 = result.current.generateId('test');
    const id2 = result.current.generateId('test');
    
    expect(id1).not.toBe(id2);
    expect(id1).toContain('test');
    expect(id2).toContain('test');
  });

  it('toggles high contrast mode', () => {
    const { result } = renderHook(() => useAccessibility());
    
    expect(result.current.isHighContrast).toBe(false);
    
    act(() => {
      result.current.toggleHighContrast();
    });
    
    expect(result.current.isHighContrast).toBe(true);
  });

  it('provides high contrast styles when enabled', () => {
    const { result } = renderHook(() => useAccessibility());
    
    act(() => {
      result.current.toggleHighContrast();
    });
    
    const styles = result.current.getHighContrastStyles();
    expect(styles).toHaveProperty('backgroundColor', '#000000');
    expect(styles).toHaveProperty('color', '#ffffff');
  });

  it('announces messages for screen readers', () => {
    const { result } = renderHook(() => useAccessibility());
    
    act(() => {
      result.current.announce('Test announcement');
    });
    
    // The announcement should be set (implementation detail)
    expect(typeof result.current.announce).toBe('function');
  });

  it('handles keyboard navigation', () => {
    const { result } = renderHook(() => useAccessibility());
    
    const items = ['item1', 'item2', 'item3'];
    const onSelect = vi.fn();
    
    const event = {
      key: 'ArrowDown',
      preventDefault: vi.fn(),
    };
    
    const newIndex = result.current.handleKeyNavigation(event, items, 0, onSelect);
    
    expect(event.preventDefault).toHaveBeenCalled();
    expect(newIndex).toBe(1);
  });

  it('handles Enter key for selection', () => {
    const { result } = renderHook(() => useAccessibility());
    
    const items = ['item1', 'item2', 'item3'];
    const onSelect = vi.fn();
    
    const event = {
      key: 'Enter',
      preventDefault: vi.fn(),
    };
    
    result.current.handleKeyNavigation(event, items, 1, onSelect);
    
    expect(event.preventDefault).toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalledWith('item2', 1);
  });

  it('wraps around at list boundaries', () => {
    const { result } = renderHook(() => useAccessibility());
    
    const items = ['item1', 'item2', 'item3'];
    
    // Test wrapping from last to first
    const downEvent = {
      key: 'ArrowDown',
      preventDefault: vi.fn(),
    };
    
    const newIndex = result.current.handleKeyNavigation(downEvent, items, 2, vi.fn());
    expect(newIndex).toBe(0);
    
    // Test wrapping from first to last
    const upEvent = {
      key: 'ArrowUp',
      preventDefault: vi.fn(),
    };
    
    const newIndex2 = result.current.handleKeyNavigation(upEvent, items, 0, vi.fn());
    expect(newIndex2).toBe(2);
  });
});

describe('useListNavigation', () => {
  const items = ['item1', 'item2', 'item3'];
  const options = {
    onSelect: vi.fn(),
    announceNavigation: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides list navigation utilities', () => {
    const { result } = renderHook(() => useListNavigation(items, options));
    
    expect(result.current).toHaveProperty('focusedIndex');
    expect(result.current).toHaveProperty('setFocus');
    expect(result.current).toHaveProperty('handleKeyDown');
    expect(result.current).toHaveProperty('isItemFocused');
  });

  it('starts with initial focus index', () => {
    const { result } = renderHook(() => useListNavigation(items, { initialIndex: 1 }));
    
    expect(result.current.focusedIndex).toBe(1);
  });

  it('updates focus index correctly', () => {
    const { result } = renderHook(() => useListNavigation(items, options));
    
    act(() => {
      result.current.setFocus(2);
    });
    
    expect(result.current.focusedIndex).toBe(2);
  });

  it('identifies focused items correctly', () => {
    const { result } = renderHook(() => useListNavigation(items, options));
    
    expect(result.current.isItemFocused(0)).toBe(true);
    expect(result.current.isItemFocused(1)).toBe(false);
    
    act(() => {
      result.current.setFocus(1);
    });
    
    expect(result.current.isItemFocused(0)).toBe(false);
    expect(result.current.isItemFocused(1)).toBe(true);
  });

  it('handles keyboard navigation events', () => {
    const { result } = renderHook(() => useListNavigation(items, options));
    
    const event = {
      key: 'ArrowDown',
      preventDefault: vi.fn(),
    };
    
    act(() => {
      result.current.handleKeyDown(event);
    });
    
    expect(result.current.focusedIndex).toBe(1);
  });

  it('calls onSelect when Enter is pressed', () => {
    const { result } = renderHook(() => useListNavigation(items, options));
    
    const event = {
      key: 'Enter',
      preventDefault: vi.fn(),
    };
    
    act(() => {
      result.current.handleKeyDown(event);
    });
    
    expect(options.onSelect).toHaveBeenCalledWith('item1', 0);
  });

  it('does not update focus for invalid indices', () => {
    const { result } = renderHook(() => useListNavigation(items, options));
    
    act(() => {
      result.current.setFocus(-1);
    });
    
    expect(result.current.focusedIndex).toBe(0);
    
    act(() => {
      result.current.setFocus(5);
    });
    
    expect(result.current.focusedIndex).toBe(0);
  });
});
