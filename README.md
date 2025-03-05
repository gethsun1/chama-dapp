---

  #          Chama Dapp

[![Chama Dapp Banner](https://i.postimg.cc/2y86kqFL/IMG-20250302-WA0000.jpg)](https://postimg.cc/0MFxZy49)

[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)  
[![Vite](https://img.shields.io/badge/Vite-4.0.0-blue)](https://vitejs.dev/)  
[![Material UI](https://img.shields.io/badge/Material%20UI-v5-blue)](https://mui.com/)  
[![Solidity](https://img.shields.io/badge/Solidity-0.8.26-blue)](https://soliditylang.org/)  
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

----

### Overview

---

Chama Dapp is a decentralized savings platform that empowers communities to manage group savings transparently and securely on-chain. A **Chama** is a traditional group savings system—where members regularly contribute to a collective pool and take turns receiving the lump sum—that has been modernized by leveraging blockchain technology. This Dapp automates group savings functions including contributions, payouts, and membership tracking via smart contracts.

Built on the Scroll Sepolia Testnet and leveraging **Scroll Zero-Knowledge Proofs (ZKP)** for enhanced scalability and privacy, Chama Dapp also integrates with reown Appkit for secure wallet connections and seamless blockchain interactions.

---

## Features

- **Create a Chama:**  
  Launch your decentralized savings group with customizable parameters such as initial deposit, recurring contributions, penalty rates for defaulting members, maximum number of members, and contribution cycle duration.

- **Join a Chama:**  
  Discover and join active Chamas by sending the required deposit. The system ensures on-chain membership verification and transparent tracking of contributions.

- **Automated Contributions & Payouts:**  
  Members contribute on a defined schedule, and payouts are executed automatically in a round-robin fashion. Defaulting members incur penalties, which are deducted from their deposits and added to the recipient's payout.

- **Smart Contract Updates:**  
  The core smart contract now includes refined penalty enforcement, cycle management, and improved security (with reentrancy guards) to ensure robust group savings management.

- **Dashboard & Analytics:**  
  Visualize real-time on-chain data, including savings status, contribution history, and upcoming payouts, all integrated into an intuitive UI.

- **Blockchain & Wallet Integration:**  
  Connect your wallet securely using reown Appkit and interact with the blockchain using modern libraries such as Wagmi and Ethers.js.

---

## Live App

- **Live App:** [https://chama-dapp.vercel.app/](https://chama-dapp.vercel.app/)

---

## Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or above)
- [Yarn](https://yarnpkg.com/) or npm
- A wallet (e.g., MetaMask) configured for the [Scroll Sepolia Testnet](https://scroll.io/)
- Familiarity with reown Appkit for wallet connections and blockchain integration

### Installation

1. **Clone the Repository:**

   ```
   git clone https://github.com/gethsun1/chama-dapp
   cd chama-dapp

2. **Install Dependencies:**
   ```
   yarn install

3. **Run the Development Server:**
    ```
   yarn dev

5. **Build for Production:**
   ```
   yarn build


---

## Smart Contract

The heart of Chama Dapp is the ChamaFactory smart contract, which orchestrates the following functionalities:

- ➤ **createChama:** Initializes a new Chama with parameters such as deposit amount, recurring contributions, penalty percentage, maximum members, and cycle duration.
  
- ➤ **joinChama:** Allows users to join an active Chama by depositing the required collateral.
  
- ➤ **contribute:** Enables members to contribute their scheduled amount per cycle.
  
- ➤ **payout:** Executes round-robin payouts, aggregating valid contributions and penalties from defaulting members.
  
- ➤ **isMember:** Verifies membership of an address within a specific Chama.

The smart contract is developed in Solidity (v0.8.26) and is deployed on the Scroll Sepolia Testnet, utilizing Scroll ZKP for improved privacy and efficiency.


---

## Technologies Used

Frontend:

React.js

Vite

Material UI

React Router


Blockchain:

Solidity

Scroll Sepolia Testnet (with Scroll ZKP)

Wagmi / Ethers.js


## Wallet & Integration:

reown Appkit for secure wallet connection and blockchain interactions


## Smart Contract Development:

Hardhat / Remix



---

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request. For major changes, open an issue first to discuss your ideas.


---

## License

This project is licensed under the [MIT License](https://opensource.org/license/mit)


---

## Contact

For further inquiries or support, please contact Gethsun at gethsun09@gmail.com.


---

Chama Dapp is dedicated to transforming traditional group savings and credit management based on _the Rotating Savings and Credit Association_ **(ROSCA)** model by delivering a transparent, secure, and fully decentralized on-chain solution that leverages blockchain technology to enhance trust, accountability, and efficiency in collective financial practices.


----
