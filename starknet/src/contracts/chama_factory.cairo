use starknet::ContractAddress;
use starknet::class_hash::ClassHash;
use core::integer::u256;
use starknet::get_caller_address;
use starknet::storage::Map;

#[starknet::contract]
mod ChamaFactory {
    use super::{ContractAddress, ClassHash, u256, get_caller_address, Map};

    #[storage]
    struct Storage {
        admin: ContractAddress,
        chama_class_hash: ClassHash,
        counter: u64,
        chamas: Map<u64, ContractAddress>,
    }

    #[event]
    #[derive(Drop, Serde, starknet::Event)]
    enum Event {
        FactoryInitialized: FactoryInitialized,
        ChamaDeployed: ChamaDeployed,
    }

    #[derive(Drop, Serde, starknet::Event)]
    struct FactoryInitialized { admin: ContractAddress, chama_class: ClassHash }
    #[derive(Drop, Serde, starknet::Event)]
    struct ChamaDeployed { id: u64, addr: ContractAddress }

    #[constructor]
    fn constructor(ref self: ContractState, admin: ContractAddress, chama_class_hash: ClassHash) {
        self.admin.write(admin);
        self.chama_class_hash.write(chama_class_hash);
        self.emit(Event::FactoryInitialized(FactoryInitialized { admin, chama_class: chama_class_hash }));
    }

    #[external(v0)]
    fn get_chama(self: @ContractState, id: u64) -> ContractAddress {
        self.chamas.read(id)
    }

    #[external(v0)]
    fn create_chama(
        ref self: ContractState,
        token: ContractAddress,
        deposit_amount: u256,
        contribution_amount: u256,
        penalty_bps: u16,
        max_members: u16,
        cycle_duration_secs: u64
    ) -> (u64, ContractAddress) {
        self.counter.write(self.counter.read() + 1_u64);
        let id = self.counter.read();
        let addr: ContractAddress = 0.try_into().unwrap();
        self.chamas.write(id, addr);
        self.emit(Event::ChamaDeployed(ChamaDeployed { id, addr }));
        (id, addr)
    }
}

