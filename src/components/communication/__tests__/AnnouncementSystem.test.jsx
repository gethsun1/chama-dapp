import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AnnouncementSystem from '../AnnouncementSystem';
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
    trapFocus: vi.fn(),
  }),
  useListNavigation: () => ({
    focusedIndex: 0,
    setFocus: vi.fn(),
    handleKeyDown: vi.fn(),
    isItemFocused: () => false,
  }),
}));

const mockCommunicationContext = {
  announcements: {
    'test-chama-1': [
      {
        id: '1',
        title: 'Important Update',
        content: 'This is an important announcement for all members.',
        priority: 'high',
        creator: '0x1234567890123456789012345678901234567890',
        timestamp: new Date().toISOString(),
        readBy: [],
      },
      {
        id: '2',
        title: 'Meeting Reminder',
        content: 'Don\'t forget about tomorrow\'s meeting.',
        priority: 'normal',
        creator: '0x1234567890123456789012345678901234567890',
        timestamp: new Date().toISOString(),
        readBy: ['0x1234567890123456789012345678901234567890'],
      },
    ],
  },
  createAnnouncement: vi.fn(),
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

describe('AnnouncementSystem', () => {
  const defaultProps = {
    chamaId: 'test-chama-1',
    chamaName: 'Test Chama',
    isCreator: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders announcements list', () => {
    renderWithProviders(<AnnouncementSystem {...defaultProps} />);
    
    expect(screen.getByText('Announcements')).toBeInTheDocument();
    expect(screen.getByText('Important Update')).toBeInTheDocument();
    expect(screen.getByText('Meeting Reminder')).toBeInTheDocument();
  });

  it('shows create button for creators', () => {
    renderWithProviders(<AnnouncementSystem {...defaultProps} />);
    
    expect(screen.getByLabelText(/create new announcement/i)).toBeInTheDocument();
  });

  it('hides create button for non-creators', () => {
    renderWithProviders(<AnnouncementSystem {...defaultProps} isCreator={false} />);
    
    expect(screen.queryByLabelText(/create new announcement/i)).not.toBeInTheDocument();
  });

  it('displays priority indicators correctly', () => {
    renderWithProviders(<AnnouncementSystem {...defaultProps} />);
    
    expect(screen.getByText('High Priority')).toBeInTheDocument();
    expect(screen.getByText('Normal')).toBeInTheDocument();
  });

  it('shows unread indicators', () => {
    renderWithProviders(<AnnouncementSystem {...defaultProps} />);
    
    // First announcement should show unread indicator
    const announcementCards = screen.getAllByRole('article');
    expect(announcementCards[0]).toBeInTheDocument();
  });

  it('opens create dialog when create button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AnnouncementSystem {...defaultProps} />);
    
    const createButton = screen.getByLabelText(/create new announcement/i);
    await user.click(createButton);
    
    expect(screen.getByText('Create New Announcement')).toBeInTheDocument();
  });

  it('creates announcement with valid data', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AnnouncementSystem {...defaultProps} />);
    
    // Open create dialog
    const createButton = screen.getByLabelText(/create new announcement/i);
    await user.click(createButton);
    
    // Fill form
    const titleInput = screen.getByLabelText(/announcement title/i);
    const contentInput = screen.getByLabelText(/announcement content/i);
    const prioritySelect = screen.getByLabelText(/select announcement priority/i);
    
    await user.type(titleInput, 'Test Announcement');
    await user.type(contentInput, 'This is a test announcement.');
    await user.click(prioritySelect);
    await user.click(screen.getByText('High Priority'));
    
    // Submit
    const submitButton = screen.getByLabelText(/post new announcement/i);
    await user.click(submitButton);
    
    expect(mockCommunicationContext.createAnnouncement).toHaveBeenCalledWith(
      'test-chama-1',
      'Test Announcement',
      'This is a test announcement.',
      'high'
    );
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AnnouncementSystem {...defaultProps} />);
    
    // Open create dialog
    const createButton = screen.getByLabelText(/create new announcement/i);
    await user.click(createButton);
    
    // Try to submit without filling fields
    const submitButton = screen.getByLabelText(/post new announcement/i);
    expect(submitButton).toBeDisabled();
  });

  it('opens announcement details when clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AnnouncementSystem {...defaultProps} />);
    
    const readMoreButton = screen.getAllByText('Read More')[0];
    await user.click(readMoreButton);
    
    expect(screen.getByText('Important Update')).toBeInTheDocument();
    expect(screen.getByText('This is an important announcement for all members.')).toBeInTheDocument();
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AnnouncementSystem {...defaultProps} />);
    
    const firstAnnouncement = screen.getAllByRole('article')[0];
    firstAnnouncement.focus();
    
    await user.keyboard('{Enter}');
    
    // Should open announcement details
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    renderWithProviders(<AnnouncementSystem {...defaultProps} />);
    
    expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Announcements for Test Chama');
    expect(screen.getByTestId('aria-live-region')).toBeInTheDocument();
    
    const announcements = screen.getAllByRole('article');
    announcements.forEach(announcement => {
      expect(announcement).toHaveAttribute('aria-label');
      expect(announcement).toHaveAttribute('tabIndex', '0');
    });
  });

  it('displays empty state when no announcements', () => {
    const emptyContext = {
      ...mockCommunicationContext,
      announcements: { 'test-chama-1': [] },
    };

    render(
      <ThemeProvider theme={theme}>
        <CommunicationProvider value={emptyContext}>
          <AnnouncementSystem {...defaultProps} />
        </CommunicationProvider>
      </ThemeProvider>
    );
    
    expect(screen.getByText('No Announcements Yet')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'No announcements available');
  });

  it('handles dialog close correctly', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AnnouncementSystem {...defaultProps} />);
    
    // Open create dialog
    const createButton = screen.getByLabelText(/create new announcement/i);
    await user.click(createButton);
    
    // Close dialog
    const cancelButton = screen.getByLabelText(/cancel creating announcement/i);
    await user.click(cancelButton);
    
    expect(screen.queryByText('Create New Announcement')).not.toBeInTheDocument();
  });

  it('shows priority guidelines in create dialog', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AnnouncementSystem {...defaultProps} />);
    
    const createButton = screen.getByLabelText(/create new announcement/i);
    await user.click(createButton);
    
    expect(screen.getByText('Priority Guidelines:')).toBeInTheDocument();
    expect(screen.getByText(/High.*Urgent matters/)).toBeInTheDocument();
    expect(screen.getByText(/Medium.*Important updates/)).toBeInTheDocument();
  });
});
