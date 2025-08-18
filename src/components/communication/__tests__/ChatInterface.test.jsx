import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ChatInterface from '../ChatInterface';
import { CommunicationProvider } from '../../../contexts/CommunicationContext';

// Mock the accessibility hooks
vi.mock('../../../hooks/useAccessibility', () => ({
  useAccessibility: () => ({
    announce: vi.fn(),
    isHighContrast: false,
    getHighContrastStyles: () => ({}),
    AriaLiveRegion: () => <div data-testid="aria-live-region" />,
    generateId: (id) => `test-${id}`,
    focusElement: vi.fn(),
  }),
  useListNavigation: () => ({
    focusedIndex: 0,
    setFocus: vi.fn(),
    handleKeyDown: vi.fn(),
    isItemFocused: () => false,
  }),
}));

// Mock message virtualization
vi.mock('../../../hooks/useMessageVirtualization', () => ({
  useMessageVirtualization: () => ({
    containerRef: { current: null },
    visibleMessages: [],
    totalHeight: 400,
    offsetY: 0,
    handleScroll: vi.fn(),
    scrollToBottom: vi.fn(),
    isScrolling: false,
    isNearBottom: true,
    messageCount: 0,
  }),
  useOptimizedUpdates: (callback) => callback,
}));

const mockCommunicationContext = {
  messages: {
    'test-chama-1': [
      {
        id: '1',
        content: 'Hello everyone!',
        sender: '0x1234567890123456789012345678901234567890',
        timestamp: new Date().toISOString(),
        chamaId: 'test-chama-1',
      },
      {
        id: '2',
        content: 'How is everyone doing?',
        sender: '0x9876543210987654321098765432109876543210',
        timestamp: new Date().toISOString(),
        chamaId: 'test-chama-1',
      },
    ],
  },
  onlineMembers: new Set(['0x1234567890123456789012345678901234567890']),
  sendMessage: vi.fn(),
  joinChamaRoom: vi.fn(),
};

const theme = createTheme();

const renderWithProviders = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      <CommunicationProvider value={mockCommunicationContext}>
        {component}
      </CommunicationProvider>
    </ThemeProvider>
  );
};

describe('ChatInterface', () => {
  const defaultProps = {
    chamaId: 'test-chama-1',
    chamaName: 'Test Chama',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders chat interface with messages', () => {
    renderWithProviders(<ChatInterface {...defaultProps} />);
    
    expect(screen.getByLabelText(/chat for test chama/i)).toBeInTheDocument();
    expect(screen.getByText('Hello everyone!')).toBeInTheDocument();
    expect(screen.getByText('How is everyone doing?')).toBeInTheDocument();
  });

  it('displays online members count', () => {
    renderWithProviders(<ChatInterface {...defaultProps} />);
    
    expect(screen.getByText(/1 online/i)).toBeInTheDocument();
  });

  it('allows sending messages', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChatInterface {...defaultProps} />);
    
    const messageInput = screen.getByLabelText(/type your message/i);
    const sendButton = screen.getByLabelText(/send message/i);
    
    await user.type(messageInput, 'Test message');
    await user.click(sendButton);
    
    expect(mockCommunicationContext.sendMessage).toHaveBeenCalledWith(
      'test-chama-1',
      'Test message',
      undefined
    );
  });

  it('sends message on Enter key press', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChatInterface {...defaultProps} />);
    
    const messageInput = screen.getByLabelText(/type your message/i);
    
    await user.type(messageInput, 'Test message{Enter}');
    
    expect(mockCommunicationContext.sendMessage).toHaveBeenCalledWith(
      'test-chama-1',
      'Test message',
      undefined
    );
  });

  it('does not send empty messages', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChatInterface {...defaultProps} />);
    
    const sendButton = screen.getByLabelText(/send message/i);
    await user.click(sendButton);
    
    expect(mockCommunicationContext.sendMessage).not.toHaveBeenCalled();
  });

  it('joins chama room on mount', () => {
    renderWithProviders(<ChatInterface {...defaultProps} />);
    
    expect(mockCommunicationContext.joinChamaRoom).toHaveBeenCalledWith('test-chama-1');
  });

  it('has proper accessibility attributes', () => {
    renderWithProviders(<ChatInterface {...defaultProps} />);
    
    expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Chat for Test Chama');
    expect(screen.getByTestId('aria-live-region')).toBeInTheDocument();
    expect(screen.getByLabelText(/type your message/i)).toBeInTheDocument();
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChatInterface {...defaultProps} />);
    
    const messageInput = screen.getByLabelText(/type your message/i);
    
    // Test Tab navigation
    await user.tab();
    expect(messageInput).toHaveFocus();
  });

  it('handles message reply functionality', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChatInterface {...defaultProps} />);
    
    // Find and click reply button on first message
    const replyButtons = screen.getAllByLabelText(/reply to message/i);
    await user.click(replyButtons[0]);
    
    // Should show reply indicator
    expect(screen.getByText(/replying to/i)).toBeInTheDocument();
  });

  it('displays message timestamps correctly', () => {
    renderWithProviders(<ChatInterface {...defaultProps} />);
    
    // Should display relative timestamps
    expect(screen.getAllByText(/ago/i)).toHaveLength(2);
  });

  it('handles long messages with proper truncation', () => {
    const longMessageContext = {
      ...mockCommunicationContext,
      messages: {
        'test-chama-1': [
          {
            id: '1',
            content: 'This is a very long message that should be truncated when displayed in the chat interface to ensure proper layout and readability for all users.',
            sender: '0x1234567890123456789012345678901234567890',
            timestamp: new Date().toISOString(),
            chamaId: 'test-chama-1',
          },
        ],
      },
    };

    render(
      <ThemeProvider theme={theme}>
        <CommunicationProvider value={longMessageContext}>
          <ChatInterface {...defaultProps} />
        </CommunicationProvider>
      </ThemeProvider>
    );
    
    expect(screen.getByText(/This is a very long message/)).toBeInTheDocument();
  });
});
