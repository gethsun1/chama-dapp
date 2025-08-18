
# 🏦 Chama Dapp v2.0

[![chamabg.png](https://i.postimg.cc/bvcF7W8v/chamabg.png)](https://postimg.cc/yDjP9fDq)

[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.1-blue)](https://vitejs.dev/)
[![Material UI](https://img.shields.io/badge/Material%20UI-v6.4.5-blue)](https://mui.com/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.26-blue)](https://soliditylang.org/)
[![Ethers.js](https://img.shields.io/badge/Ethers.js-6.13.5-blue)](https://ethers.org/)
[![Reown AppKit](https://img.shields.io/badge/Reown%20AppKit-1.6.9-blue)](https://reown.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **A modern, decentralized savings platform that revolutionizes traditional group savings (Chamas) with blockchain technology, featuring a completely redesigned UI/UX for enhanced user experience.**

---

## 🌟 Overview

Chama Dapp is a cutting-edge decentralized savings platform that transforms traditional group savings—commonly known as **Chamas**—by bringing transparency, security, and automated governance on-chain. Built on the **Rotating Savings and Credit Association (ROSCA)** model, our platform enables members to contribute regularly to a shared pool and take turns receiving lump sum payouts.

### 🚀 What's New in v2.0

- **Complete UI/UX Redesign**: Professional blue color scheme with modern Material Design principles
- **Enhanced Mobile Experience**: Improved responsive navigation with slide-out drawer and better touch interactions
- **Advanced Loading States**: Comprehensive skeleton screens and loading indicators for better perceived performance
- **Accessibility First**: WCAG compliant components with proper ARIA labels and keyboard navigation
- **Performance Optimized**: React.memo optimizations and memoized calculations for faster rendering
- **Smart Wallet Integration**: Enhanced wallet connection guards with network validation
- **Real-time Status Indicators**: Visual status system for chamas, transactions, and network states
- **🆕 Real-Time Communication Hub**: Comprehensive member communication system with chat, proposals, announcements, and coordination tools

Our Dapp leverages blockchain technology deployed on the **Scroll Sepolia Testnet** (enhanced with Scroll Zero-Knowledge Proofs for scalability and privacy) to automate these processes, ensuring trustless, efficient, and democratic financial management.


## 🔷 Starknet (Phase 0) Multichain Progress

We have started a Starknet-native track to bring Chama Dapp to Cairo 2 and Starknet Sepolia, while keeping the existing EVM (Scroll) flow intact.

What’s in this repo now:
- Cairo 2 contracts under `starknet/`:
  - `ChamaCore`, `ChamaFactory`, and a simple `ChamaVault` prototype
  - Build toolchain: Scarb + Starknet Foundry (snforge)
  - RPC config: `starknet/snfoundry.toml` (RPC v0.8)
- Declarations on Starknet Sepolia (Accepted on L2):
  - ChamaCore class hash: `0x0798c17a478bf9786e6d42e87b406a3fe13566d50fd3bcbd6d9bfdd29fa6a98a`
  - ChamaFactory class hash: `0x064345390d13dfa59a9be1606f4cd96d1095b6795a33570f55d577a34fa5d8aa`
  - ChamaVault class hash: `0x01f42b0f0a1ea41f90d35a3a134633797aeaf173cd13a45466c42e60ec9092b5`
- Deployment on Starknet Sepolia:
  - ChamaFactory deployed at: `0x054a4299170e89bdd10e63aa1558ded3f9237fd4ff01795fec0f0f4ee54ad8c3`
  - Explorer: https://sepolia.starkscan.co/contract/0x054a4299170e89bdd10e63aa1558ded3f9237fd4ff01795fec0f0f4ee54ad8c3

Frontend updates for Starknet:
- Added a minimal network toggle (EVM vs Starknet) in the Navigation Bar
- Added a Starknet Read‑Only panel on “Join Chama” to query `Factory.get_chama(id)` and `get_vault(id)` via starknet.js
- Added “Starknet Coming Soon” notices on Create/Join pages (writes will come after UDC wiring)
- Config file: `src/contracts/StarknetFactoryConfig.js` (RPC URL, factory address, class hashes)

Starknet developer quickstart:
- Build contracts
  - `cd starknet && scarb build`
- Account (local only; do NOT share your SRP/private key)
  - `sncast account create --name chama-dev --add-profile default`
  - Fund the printed address with Sepolia ETH/STRK; then: `sncast account deploy --name chama-dev`
- Declare (examples; replace names if needed)
  - `sncast -p default -a chama-dev declare -c ChamaCore --package chama_starknet`
  - `sncast -p default -a chama-dev declare -c ChamaFactory --package chama_starknet`
  - `sncast -p default -a chama-dev declare -c ChamaVault --package chama_starknet`
- Deploy Factory (admin, core_class_hash, vault_class_hash)
  - `sncast -p default -a chama-dev deploy --class-hash 0x64345390d13dfa59a9be1606f4cd96d1095b6795a33570f55d577a34fa5d8aa --constructor-calldata <admin_addr> 0x798c17a478bf9786e6d42e87b406a3fe13566d50fd3bcbd6d9bfdd29fa6a98a 0x1f42b0f0a1ea41f90d35a3a134633797aeaf173cd13a45466c42e60ec9092b5`
- Create a Chama via UDC (spawns Core + Vault)
  - `sncast -p default -a chama-dev invoke --contract-address 0x054a4299170e89bdd10e63aa1558ded3f9237fd4ff01795fec0f0f4ee54ad8c3 --function create_chama_udc --calldata <token_addr> <dep_low> <dep_high> <cont_low> <cont_high> <pen_bps> <max_members> <cycle_secs>`
- Read back addresses
  - `sncast -p default -a chama-dev call --contract-address 0x054a4299170e89bdd10e63aa1558ded3f9237fd4ff01795fec0f0f4ee54ad8c3 --function get_chama --calldata 1`
  - `sncast -p default -a chama-dev call --contract-address 0x054a4299170e89bdd10e63aa1558ded3f9237fd4ff01795fec0f0f4ee54ad8c3 --function get_vault --calldata 1`

Next Starknet milestones:
- Token flows with vault (approve/transferFrom) and payouts
- Wallet integration (Argent X / Braavos) and starknet.js state wiring
- Indexing (Apibara) and event schemas


---

## ✨ Features

### 🏗️ Core Functionality

- **🎯 Create a Chama**
  Launch your decentralized savings group with configurable parameters:
  - Initial deposit and recurring contribution amounts
  - Penalty rates for defaulting members
  - Maximum number of members
  - Contribution cycle duration (daily, weekly, or monthly)

- **🤝 Join a Chama**
  Discover and join active Chamas through an intuitive interface with enhanced filtering and search capabilities. Membership is verified on-chain, ensuring complete transparency.

- **⚡ Automated Contributions & Payouts**
  Smart contract-powered automation handles contributions and payouts in a round-robin fashion. Penalties for defaults are automatically deducted from deposits and added to scheduled recipient payouts.

- **💬 Real-Time Communication Hub**
  Comprehensive member communication system featuring:
  - **Real-time Chat**: Instant messaging with member presence indicators and message threading
  - **Proposal Voting**: Democratic decision-making with visual vote tracking and deadline management
  - **Announcement System**: Priority-based announcements with read receipts and notifications
  - **Member Coordination**: Event scheduling, task assignments, and progress tracking

### 🎨 Enhanced UI/UX (v2.0)

- **🎨 Professional Design System**
  - Modern blue color palette with carefully crafted gradients and shadows
  - Consistent spacing and typography using Inter font family
  - Material Design 3 principles with custom component styling

- **📱 Mobile-First Responsive Design**
  - Enhanced mobile navigation with slide-out drawer
  - Touch-optimized interactions and button sizing
  - Adaptive layouts that work seamlessly across all devices

- **⚡ Advanced Loading States**
  - Skeleton screens for cards, tables, and forms
  - Smooth loading animations and transitions
  - Progress indicators for blockchain transactions

- **♿ Accessibility & Performance**
  - WCAG 2.1 AA compliant components
  - Keyboard navigation support
  - Screen reader optimized with proper ARIA labels
  - React.memo optimizations for better performance

### 🔗 Blockchain Integration

- **🔐 Smart Wallet Connection**
  - Secure wallet integration using Reown AppKit
  - Network validation with automatic Scroll Sepolia detection
  - Connection guards that protect sensitive pages

- **📊 Real-Time Dashboard & Analytics**
  - Live metrics cards showing balance, active chamas, and deposits
  - Interactive charts for contribution history and fund allocation
  - Real-time balance updates and transaction status

- **🔔 Status & Notifications**
  - Visual status indicators for chamas (active, pending, completed)
  - Transaction status tracking with detailed feedback
  - Email notifications via SendGrid integration

---

## 🌐 Live Application

**🚀 Experience Chama Dapp:** [https://chama-dapp.vercel.app/](https://chama-dapp.vercel.app/)

---

## 🛠️ Technology Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 19.1.0, Material UI v6.4.5, Vite 6.2.1 |
| **Blockchain** | Ethers.js 6.13.5, Reown AppKit 1.6.9 |
| **Smart Contracts** | Solidity 0.8.26, Scroll Sepolia Testnet |
| **Styling** | Material UI Theme System, Custom Design Tokens |
| **Charts** | Recharts 2.15.1 |
| **Real-Time** | Socket.IO Client 4.8.1, WebSocket Communication |
| **Testing** | Vitest 3.2.4, Testing Library, Jest DOM |
| **Deployment** | Vercel, GitHub Actions |
| **Notifications** | SendGrid Email API |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 or above ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **MetaMask** or compatible wallet
- **Scroll Sepolia Testnet** configuration

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Bratipah/Chama-Dapp.git
   cd Chama-Dapp
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open in Browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

### Production Build

```bash
npm run build
npm run preview
```

### Environment Setup

Create a `.env.local` file for environment variables:
```env
VITE_REOWN_PROJECT_ID=your_project_id_here
VITE_SENDGRID_API_KEY=your_sendgrid_key_here
```

---

## 📖 Usage Guide

### 🔗 Connecting Your Wallet

1. **Install MetaMask** or your preferred Ethereum wallet
2. **Add Scroll Sepolia Network** to your wallet:
   - Network Name: `Scroll Sepolia`
   - RPC URL: `https://sepolia-rpc.scroll.io/`
   - Chain ID: `534351`
   - Currency Symbol: `ETH`
   - Block Explorer: `https://sepolia.scrollscan.com/`

3. **Get Test ETH** from [Scroll Sepolia Faucet](https://sepolia.scroll.io/faucet)

### 🎯 Creating Your First Chama

1. **Navigate** to "Create Chama" page
2. **Fill in details**:
   - Chama name and description
   - Deposit amount (ETH)
   - Contribution amount (ETH)
   - Penalty percentage
   - Maximum members
   - Cycle duration (daily/weekly/monthly)
3. **Submit transaction** and wait for confirmation
4. **Share** the generated invite link with potential members

### 🤝 Joining a Chama

1. **Browse** available Chamas on "Join Chama" page
2. **Review** chama details and requirements
3. **Click "Join"** and send the required deposit
4. **Confirm** transaction in your wallet
5. **Access** your dashboard to view joined Chamas

### 📊 Using the Dashboard

- **View Metrics**: Total balance, active Chamas, deposits, next payout
- **Monitor Activity**: Track contribution history and fund allocation
- **Manage Chamas**: Contribute to cycles and invite new members
- **Check Status**: Real-time updates on chama and transaction status

### 💬 Communication Hub Features

#### 🗨️ Real-Time Chat
- **Instant Messaging**: Send and receive messages in real-time
- **Member Presence**: See who's online with live status indicators
- **Message Threading**: Reply to specific messages for organized discussions
- **Mobile Optimized**: Touch-friendly interface with swipe gestures
- **Accessibility**: Full screen reader support and keyboard navigation

#### 🗳️ Proposal Voting System
- **Democratic Decisions**: Create proposals for chama governance
- **Visual Vote Tracking**: Real-time vote counts with progress bars
- **Deadline Management**: Set voting deadlines with countdown timers
- **Results Display**: Transparent results with percentage breakdowns
- **Creator Controls**: Proposal creation restricted to chama creators

#### 📢 Announcement System
- **Priority Levels**: Normal, high, and urgent announcement classifications
- **Read Receipts**: Track which members have read announcements
- **Rich Content**: Support for formatted text and detailed descriptions
- **Notification Integration**: Automatic in-app notifications
- **Broadcast Control**: Creator-only announcement permissions

#### 👥 Member Coordination
- **Event Scheduling**: Plan chama meetings and activities with date/time pickers
- **Task Assignments**: Assign responsibilities to specific members
- **Progress Tracking**: Visual indicators for task completion status
- **Calendar Integration**: Timeline view of events and deadlines
- **Member Management**: Role-based access and permissions

#### 🔧 Technical Features
- **WebSocket Communication**: Real-time updates without page refresh
- **Mock Server**: Development-ready testing environment
- **Performance Optimized**: Message virtualization for large conversations
- **Mobile Responsive**: Adaptive design for all screen sizes
- **Offline Support**: Graceful handling of connection issues

---

## 🏗️ Smart Contract Architecture

The core of Chama Dapp is the [**ChamaFactory**](https://github.com/gethsun1/chama-dapp/blob/main/src/contracts/ChamaFactory.sol) smart contract. Developed in Solidity (v0.8.26), it implements a decentralized savings model that automates the management of group savings with strict on-chain governance.

### Key Functions & Sample Snippets

#### 1. Creating a Chama

The `createChama` function initializes a new savings group with all necessary parameters. It ensures that key requirements are met (e.g., non-zero deposit and contribution amounts) and logs an event for on-chain transparency.

```solidity
function createChama(
    string memory _name,
    string memory _description,
    uint256 _depositAmount,
    uint256 _contributionAmount,
    uint256 _penalty,
    uint256 _maxMembers,
    uint256 _cycleDuration
) external returns (uint256) {
    require(_maxMembers > 0, "Max members must be > 0");
    require(_depositAmount > 0, "Deposit amount must be > 0");
    require(_contributionAmount > 0, "Contribution amount must be > 0");

    chamaCount++;
    Chama storage newChama = chamas[chamaCount];
    newChama.id = chamaCount;
    newChama.creator = msg.sender;
    newChama.name = _name;
    newChama.description = _description;
    newChama.depositAmount = _depositAmount;
    newChama.contributionAmount = _contributionAmount;
    newChama.penalty = _penalty;
    newChama.maxMembers = _maxMembers;
    newChama.cycleDuration = _cycleDuration;
    newChama.currentRound = 1;
    newChama.currentCycle = 1;
    newChama.nextCycleStart = block.timestamp + _cycleDuration;
    newChama.isActive = true;

    emit ChamaCreated(chamaCount, _name, msg.sender);
    return chamaCount;
}
```

#### 2. Joining a Chama

The `joinChama` function allows users to join an active Chama by sending the exact deposit amount. It prevents duplicate membership and ensures the Chama is not already full.

```solidity
function joinChama(uint256 _chamaId) external payable {
    Chama storage chama = chamas[_chamaId];
    require(chama.isActive, "Chama is not active");
    require(chama.membersCount < chama.maxMembers, "Chama is full");
    require(msg.value == chama.depositAmount, "Incorrect deposit amount");
    require(!isMember(_chamaId, msg.sender), "Already a member");

    chama.members.push(msg.sender);
    chama.membersCount++;
    memberDeposit[_chamaId][msg.sender] = chama.depositAmount;
    emit JoinedChama(_chamaId, msg.sender);
}
```

#### 3. Making Contributions & Payouts

The contract also handles periodic contributions and automated payouts. Contributions are checked against the schedule, and if a member defaults, a penalty is applied. Payouts are executed in a round‑robin fashion.

```solidity
function contribute(uint256 _chamaId) external payable {
    Chama storage chama = chamas[_chamaId];
    require(chama.isActive, "Chama is not active");
    require(isMember(_chamaId, msg.sender), "Not a member of this Chama");
    require(msg.value == chama.contributionAmount, "Incorrect contribution amount");
    require(block.timestamp < chama.nextCycleStart, "Contribution period over for current cycle");
    require(!contributions[_chamaId][chama.currentCycle][msg.sender], "Contribution already made for current cycle");

    contributions[_chamaId][chama.currentCycle][msg.sender] = true;
    emit ContributionMade(_chamaId, chama.currentCycle, msg.sender, msg.value);
}
```

*Note: Additional functions (such as `payout` and internal calculations) ensure that the smart contract robustly handles all group savings operations while protecting against reentrancy and other common attacks.*

---

## 🏗️ Technical Architecture

### 🔗 Blockchain Layer
- **Smart Contracts**: ChamaFactory deployed on Scroll Sepolia Testnet
- **Zero-Knowledge Proofs**: Enhanced scalability and privacy via Scroll technology
- **Gas Optimization**: Efficient contract design for minimal transaction costs

### 🎨 Frontend Architecture
- **React 19**: Latest React features with concurrent rendering
- **Material UI v6**: Modern design system with custom theming
- **Vite**: Lightning-fast build tool and development server
- **TypeScript**: Type-safe development (optional, JSX supported)

### 🔌 Integration Layer
- **Reown AppKit**: Secure wallet connection and management
- **Ethers.js**: Blockchain interaction and transaction handling
- **Custom Hooks**: Reusable logic for chama data and wallet state

### ☁️ Backend Services
- **Vercel Functions**: Serverless API endpoints
- **SendGrid**: Email notification system
- **IPFS**: Decentralized metadata storage (planned)

---

## 🎨 Component Architecture

### 🧩 Core Components

| Component | Purpose | Features |
|-----------|---------|----------|
| `WalletConnectionGuard` | Protects routes requiring wallet | Network validation, connection prompts |
| `LoadingState` | Provides loading UI | Skeletons, spinners, progress indicators |
| `StatusIndicator` | Shows status information | Multiple variants, tooltips, accessibility |
| `AccessibleTextField` | Enhanced form inputs | Validation, character count, accessibility |
| `BreadcrumbNavigation` | Navigation context | Auto-generation, icons, responsive |
| `MetricCard` | Dashboard metrics | Animated counters, trend indicators |

### 💬 Communication Components

| Component | Purpose | Features |
|-----------|---------|----------|
| `CommunicationHub` | Main communication interface | Tabbed interface, drawer/embedded modes |
| `ChatInterface` | Real-time messaging | Message threading, presence indicators, virtualization |
| `ProposalVoting` | Democratic decision making | Vote tracking, deadline management, results display |
| `AnnouncementSystem` | Broadcast communications | Priority levels, read receipts, notifications |
| `MemberCoordination` | Event and task management | Scheduling, assignments, progress tracking |
| `NotificationCenter` | Notification management | Real-time alerts, read status, filtering |

### 🎯 Performance Optimizations

- **React.memo**: Prevents unnecessary re-renders
- **useMemo**: Memoizes expensive calculations
- **useCallback**: Optimizes event handlers
- **Code Splitting**: Lazy loading for better performance
- **Bundle Optimization**: Tree shaking and minification

---

## 🚀 Deployment

### 📦 Build for Production

```bash
npm run build
```

### 🌐 Deploy to Vercel

1. **Connect Repository** to Vercel
2. **Configure Environment Variables**:
   ```
   VITE_REOWN_PROJECT_ID=your_project_id
   VITE_SENDGRID_API_KEY=your_sendgrid_key
   ```
3. **Deploy** automatically on push to main branch

### 🔧 Manual Deployment

```bash
npm run build
npm run preview  # Test production build locally
```

---

## 🛣️ Roadmap

### 🎯 Phase 1 (Completed ✅)
- ✅ Core smart contract functionality
- ✅ Basic UI/UX implementation
- ✅ Wallet integration with Reown AppKit
- ✅ Professional design system overhaul
- ✅ Mobile-responsive navigation
- ✅ Accessibility improvements
- ✅ Performance optimizations
- ✅ Real-time communication hub
- ✅ Chat system with message threading
- ✅ Proposal voting interface
- ✅ Announcement broadcast system
- ✅ Member coordination tools

### 🎯 Phase 2 (In Progress 🚧)
- 🔄 Enhanced on-chain analytics with The Graph
- 🔄 Advanced chama governance features
- 🔄 Multi-token support (USDC, DAI)
- 🔄 Automated investment strategies

### 🎯 Phase 3 (Planned 📋)
- 📋 AI-powered financial insights
- 📋 Cross-chain compatibility
- 📋 Mobile app development
- 📋 DeFi protocol integrations
- 📋 Governance token launch

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### 🐛 Bug Reports
- Use GitHub Issues to report bugs
- Include detailed reproduction steps
- Provide browser/wallet information

### 💡 Feature Requests
- Open an issue with the "enhancement" label
- Describe the feature and its benefits
- Include mockups or examples if possible

### 🔧 Development
1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### 📝 Code Style
- Follow existing code conventions
- Use meaningful commit messages
- Add comments for complex logic
- Ensure all tests pass

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support & Contact

- **Developer**: Gethsun Kahinga
- **Email**: [gethsun09@gmail.com](mailto:gethsun09@gmail.com)
- **GitHub**: [@gethsun1](https://github.com/gethsun1)
- **Issues**: [GitHub Issues](https://github.com/gethsun1/chama-dapp/issues)

---

## 🙏 Acknowledgments

- **Scroll Team** for the innovative L2 solution
- **Material UI** for the excellent component library
- **Reown** for the seamless wallet integration
- **Vercel** for the deployment platform
- **Community** for feedback and contributions

---

<div align="center">

**🏦 Chama Dapp v2.0**

*Transforming traditional ROSCA savings into a modern, trustless, and decentralized solution that empowers communities and fosters collective financial resilience.*

[![GitHub stars](https://img.shields.io/github/stars/gethsun1/chama-dapp?style=social)](https://github.com/gethsun1/chama-dapp/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/gethsun1/chama-dapp?style=social)](https://github.com/gethsun1/chama-dapp/network/members)

</div>
