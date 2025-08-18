use starknet::ContractAddress;
use core::integer::u256;

#[starknet::interface]
trait IVault<TContractState> {
    fn token(self: @TContractState) -> ContractAddress;
    fn owner(self: @TContractState) -> ContractAddress;
    fn set_owner(ref self: TContractState, new_owner: ContractAddress);
    fn deposit_from(ref self: TContractState, from: ContractAddress, amount: u256);
    fn payout_to(ref self: TContractState, to: ContractAddress, amount: u256);
}

