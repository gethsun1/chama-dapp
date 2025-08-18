use starknet::ContractAddress;
use core::integer::u256;
use starknet::get_caller_address;
use starknet::get_contract_address;

#[starknet::contract]
mod ChamaVault {
    use super::{ContractAddress, u256, get_caller_address, get_contract_address};
    use crate::interfaces::erc20::IERC20Dispatcher;
    use crate::interfaces::erc20::IERC20DispatcherTrait;

    #[storage]
    struct Storage {
        token: ContractAddress,
        owner: ContractAddress,
    }

    #[constructor]
    fn constructor(ref self: ContractState, token: ContractAddress, owner: ContractAddress) {
        self.token.write(token);
        self.owner.write(owner);
    }

    #[external(v0)]
    fn token(self: @ContractState) -> ContractAddress { self.token.read() }

    #[external(v0)]
    fn owner(self: @ContractState) -> ContractAddress { self.owner.read() }

    #[external(v0)]
    fn set_owner(ref self: ContractState, new_owner: ContractAddress) {
        assert(get_caller_address() == self.owner.read(), 'NOT_OWNER');
        self.owner.write(new_owner);
    }

    #[external(v0)]
    fn deposit_from(ref self: ContractState, from: ContractAddress, amount: u256) {
        let token = self.token.read();
        IERC20Dispatcher { contract_address: token }.transfer_from(from, get_contract_address(), amount);
    }

    #[external(v0)]
    fn payout_to(ref self: ContractState, to: ContractAddress, amount: u256) {
        assert(get_caller_address() == self.owner.read(), 'NOT_OWNER');
        let token = self.token.read();
        IERC20Dispatcher { contract_address: token }.transfer(to, amount);
    }
}

