use starknet::ContractAddress;
use starknet::class_hash::ClassHash;
use core::integer::u256;
use starknet::get_caller_address;
use starknet::storage::Map;

#[starknet::contract]
mod ChamaFactory {
    use super::{ContractAddress, ClassHash, u256, get_caller_address, Map};
    use core::array::{ArrayTrait, Array};

    // Universal Deployer Contract (UDC) interface per OpenZeppelin
    #[starknet::interface]
    trait IUniversalDeployer<TContractState> {
        fn deploy_contract(
            ref self: TContractState,
            class_hash: ClassHash,
            salt: felt252,
            from_zero: bool,
            calldata: Span<felt252>
        ) -> ContractAddress;
    }

    fn udc_address() -> ContractAddress {
        // UDC on Mainnet & Sepolia
        let addr: felt252 = 0x04a64cd09a853868621d94cae9952b106f2c36a3f81260f85de6696c6b050221;
        addr.try_into().unwrap()
    }

    #[storage]
    struct Storage {
        admin: ContractAddress,
        chama_class_hash: ClassHash,
        vault_class_hash: ClassHash,
        counter: u64,
        chamas: Map<u64, ContractAddress>,
        vaults: Map<u64, ContractAddress>,
    }

    #[event]
    #[derive(Drop, Serde, starknet::Event)]
    enum Event {
        FactoryInitialized: FactoryInitialized,
        ChamaDeployed: ChamaDeployed,
    }

    #[derive(Drop, Serde, starknet::Event)]
    struct FactoryInitialized { admin: ContractAddress, chama_class: ClassHash, vault_class: ClassHash }
    #[derive(Drop, Serde, starknet::Event)]
    struct ChamaDeployed { id: u64, core: ContractAddress, vault: ContractAddress }

    #[constructor]
    fn constructor(ref self: ContractState, admin: ContractAddress, chama_class_hash: ClassHash, vault_class_hash: ClassHash) {
        self.admin.write(admin);
        self.chama_class_hash.write(chama_class_hash);
        self.vault_class_hash.write(vault_class_hash);
        self.emit(Event::FactoryInitialized(FactoryInitialized { admin, chama_class: chama_class_hash, vault_class: vault_class_hash }));
    }

    #[external(v0)]
    fn get_chama(self: @ContractState, id: u64) -> ContractAddress {
        self.chamas.read(id)
    }

    #[external(v0)]
    fn get_vault(self: @ContractState, id: u64) -> ContractAddress {
        self.vaults.read(id)
    }

    // Legacy placeholder
    #[external(v0)]
    fn create_chama(
        ref self: ContractState,
        token: ContractAddress,
        deposit_amount: u256,
        contribution_amount: u256,
        penalty_bps: u16,
        max_members: u16,
        cycle_duration_secs: u64
    ) -> (u64, ContractAddress, ContractAddress) {
        self.counter.write(self.counter.read() + 1_u64);
        let id = self.counter.read();
        let core: ContractAddress = 0.try_into().unwrap();
        let vault: ContractAddress = 0.try_into().unwrap();
        self.chamas.write(id, core);
        self.vaults.write(id, vault);
        self.emit(Event::ChamaDeployed(ChamaDeployed { id, core, vault }));
        (id, core, vault)
    }

    // Deploy Core and Vault via UDC
    #[external(v0)]
    fn create_chama_udc(
        ref self: ContractState,
        token: ContractAddress,
        deposit_amount: u256,
        contribution_amount: u256,
        penalty_bps: u16,
        max_members: u16,
        cycle_duration_secs: u64
    ) -> (u64, ContractAddress, ContractAddress) {
        // Increment id and use it as salt
        self.counter.write(self.counter.read() + 1_u64);
        let id = self.counter.read();
        let salt: felt252 = id.into();
        let creator = get_caller_address();

        // Build calldata for ChamaCore constructor
        let mut core_calldata: Array<felt252> = ArrayTrait::new();
        ArrayTrait::append(ref core_calldata, id.into());
        ArrayTrait::append(ref core_calldata, token.into());
        ArrayTrait::append(ref core_calldata, creator.into());
        ArrayTrait::append(ref core_calldata, deposit_amount.low.into());
        ArrayTrait::append(ref core_calldata, deposit_amount.high.into());
        ArrayTrait::append(ref core_calldata, contribution_amount.low.into());
        ArrayTrait::append(ref core_calldata, contribution_amount.high.into());
        ArrayTrait::append(ref core_calldata, penalty_bps.into());
        ArrayTrait::append(ref core_calldata, max_members.into());
        ArrayTrait::append(ref core_calldata, cycle_duration_secs.into());

        let udc = IUniversalDeployerDispatcher { contract_address: udc_address() };
        let core_addr = udc.deploy_contract(
            self.chama_class_hash.read(),
            salt,
            false,
            core_calldata.span()
        );

        // Build calldata for ChamaVault constructor: (token, owner=core_addr)
        let mut vault_calldata: Array<felt252> = ArrayTrait::new();
        ArrayTrait::append(ref vault_calldata, token.into());
        ArrayTrait::append(ref vault_calldata, core_addr.into());

        let vault_addr = udc.deploy_contract(
            self.vault_class_hash.read(),
            salt + 1,
            false,
            vault_calldata.span()
        );

        self.chamas.write(id, core_addr);
        self.vaults.write(id, vault_addr);
        self.emit(Event::ChamaDeployed(ChamaDeployed { id, core: core_addr, vault: vault_addr }));
        (id, core_addr, vault_addr)
    }
}

