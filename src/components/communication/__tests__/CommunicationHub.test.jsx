import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CommunicationHub, { CommunicationFab } from '../CommunicationHub';
import { CommunicationProvider } from '../../../contexts/CommunicationContext';

// Mock the communication context
const mockCommunicationContext = {
  messages: {},
  proposals: {},
  announcements: {},
  notifications: [],
  connectionStatus: 'connected',
  onlineMembers: new Set(['0x1234567890123456789012345678901234567890']),
  sendMessage: vi.fn(),
  createProposal: vi.fn(),
  createAnnouncement: vi.fn(),
  joinChamaRoom: vi.fn(),
  leaveChamaRoom: vi.fn(),
  markNotificationAsRead: vi.fn(),
  clearAllNotifications: vi.fn(),
};

// Mock the real-time connection hook
vi.mock('../../../hooks/useRealTimeConnection', () => ({
  default: () => ({
    isRealTimeEnabled: true,
    getConnectionStatusInfo: () => ({ status: 'connected', message: 'Connected' }),
    forceReconnect: vi.fn(),
  }),
}));

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

describe('CommunicationHub', () => {
  const defaultProps = {
    chamaId: 'test-chama-1',
    chamaName: 'Test Chama',
    members: ['0x1234567890123456789012345678901234567890'],
    isCreator: true,
    open: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders communication hub with all tabs', () => {
    renderWithProviders(<CommunicationHub {...defaultProps} />);
    
    expect(screen.getByText('Test Chama Communication')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /chat/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /proposals/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /announcements/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /coordination/i })).toBeInTheDocument();
  });

  it('displays connection status', () => {
    renderWithProviders(<CommunicationHub {...defaultProps} />);
    
    expect(screen.getByLabelText(/connection status/i)).toBeInTheDocument();
  });

  it('switches between tabs correctly', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CommunicationHub {...defaultProps} />);
    
    const proposalsTab = screen.getByRole('tab', { name: /proposals/i });
    await user.click(proposalsTab);
    
    expect(proposalsTab).toHaveAttribute('aria-selected', 'true');
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CommunicationHub {...defaultProps} />);
    
    const chatTab = screen.getByRole('tab', { name: /chat/i });
    chatTab.focus();
    
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: /proposals/i })).toHaveFocus();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(<CommunicationHub {...defaultProps} onClose={onClose} />);
    
    const closeButton = screen.getByLabelText(/close/i);
    await user.click(closeButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('supports mobile responsive design', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(max-width: 899.95px)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    renderWithProviders(<CommunicationHub {...defaultProps} />);
    
    // Should render mobile-optimized layout
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    renderWithProviders(<CommunicationHub {...defaultProps} />);
    
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby');
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
  });
});

describe('CommunicationFab', () => {
  const defaultProps = {
    chamaId: 'test-chama-1',
    chamaName: 'Test Chama',
    members: ['0x1234567890123456789012345678901234567890'],
    isCreator: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders floating action button', () => {
    renderWithProviders(<CommunicationFab {...defaultProps} />);
    
    expect(screen.getByLabelText(/communication hub/i)).toBeInTheDocument();
  });

  it('shows notification badge when there are unread notifications', () => {
    const contextWithNotifications = {
      ...mockCommunicationContext,
      notifications: [
        { id: '1', chamaId: 'test-chama-1', type: 'message', read: false },
      ],
    };

    render(
      <ThemeProvider theme={theme}>
        <CommunicationProvider value={contextWithNotifications}>
          <CommunicationFab {...defaultProps} />
        </CommunicationProvider>
      </ThemeProvider>
    );
    
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('opens communication hub when clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CommunicationFab {...defaultProps} />);
    
    const fab = screen.getByLabelText(/communication hub/i);
    await user.click(fab);
    
    await waitFor(() => {
      expect(screen.getByText('Test Chama Communication')).toBeInTheDocument();
    });
  });
});
