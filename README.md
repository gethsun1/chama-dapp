
# Chama Dapp

![Chama Dapp Header](https://i.ibb.co/C5gP1FtN/chama-dapp-header.png)

[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)  
[![Vite](https://img.shields.io/badge/Vite-4.0.0-blue)](https://vitejs.dev/)  
[![Material UI](https://img.shields.io/badge/Material%20UI-v5-blue)](https://mui.com/)  
[![Solidity](https://img.shields.io/badge/Solidity-0.8.0-blue)](https://soliditylang.org/)  
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Overview

Chama Dapp is a decentralized savings platform built on blockchain technology that empowers users to create, join, and manage group savings (Chamas) in a transparent and secure manner. Utilizing smart contracts on the Scroll Sepolia Testnet, Chama Dapp automates contributions, payouts, and membership tracking—revolutionizing the traditional group savings model.

---

## Features

- **Create a Chama:**  
  Launch your decentralized savings group with customizable parameters such as deposit amount, recurring contributions, penalty rates, maximum members, and contribution cycle duration.

- **Join a Chama:**  
  Discover and join active Chamas by sending the required deposit. Enjoy automated on-chain membership verification and transparent contribution tracking.

- **Automated Contributions & Payouts:**  
  Members contribute according to a defined schedule and receive payouts automatically in a round-robin fashion once the group is complete.

- **Dashboard & Analytics:**  
  Real-time on-chain data is displayed on the Dashboard, providing insights into your savings, contributions, and upcoming payouts.

- **Secure & Transparent:**  
  Built with robust smart contracts and modern UI/UX principles, Chama Dapp offers a secure, transparent, and user-friendly experience for managing group savings.

---

## Live App

- **Live App:** [https://chama-dapp.vercel.app/](https://chama-dapp.vercel.app/)

---

## Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or above)
- [Yarn](https://yarnpkg.com/) or npm
- [Scroll Sepolia Testnet](https://scroll.io/) account & wallet (e.g., MetaMask)

### Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/chama-dapp.git
   cd chama-dapp

2. Install Dependencies:

yarn install


3. Run the Development Server:

yarn dev


4. Build for Production:

yarn build




---

Smart Contract

The core of Chama Dapp is the ChamaFactory smart contract, which manages the creation of Chamas, joining, contributions, and payouts. Key functionalities include:

createChama: Initializes a new Chama with specified parameters.

joinChama: Lets users join a Chama by providing the required deposit.

contribute: Enables members to contribute the defined amount for the current cycle.

payout: Executes payouts to members in a round-robin fashion.

isMember: Verifies membership of an address within a specific Chama.


The smart contract is written in Solidity (v0.8.0) and deployed on the Scroll Sepolia Testnet.


---

Technologies Used

Frontend:

React.js

Vite

Material UI

React Router


Blockchain:

Solidity

Scroll Sepolia Testnet

Wagmi / Ethers.js


Smart Contract Development:

Hardhat / Remix




---

Contributing

Contributions are welcome! Please fork the repository and submit a pull request. For major changes, open an issue first to discuss your ideas.


---

License

This project is licensed under the MIT License.


---

Contact

For further inquiries or support, please contact Gethsun at gethsun09@gmail.com.


---

Chama Dapp is committed to revolutionizing group savings through transparency, security, and user empowerment on the blockchain.
