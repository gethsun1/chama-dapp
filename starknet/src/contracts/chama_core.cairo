use starknet::ContractAddress;
use core::integer::u256;
use starknet::get_block_timestamp;
use starknet::storage::Map;

#[starknet::contract]
mod ChamaCore {
    use super::{ContractAddress, u256, get_block_timestamp, Map};

    #[storage]
    struct Storage {
        // Parameters
        id: u64,
        token: ContractAddress,
        creator: ContractAddress,
        deposit_amount: u256,
        contribution_amount: u256,
        penalty_bps: u16,
        max_members: u16,
        cycle_duration_secs: u64,

        // State
        is_active: bool,
        members_len: u16,
        members: Map<u16, ContractAddress>,
        members_index: Map<ContractAddress, u16>, // 1-based index; 0 = not a member
        current_round: u16,
        current_cycle: u64,
        next_cycle_start: u64,

        // Contributions keyed by felt252 = cycle*65536 + idx1
        contributions: Map<felt252, bool>,

        // Deposit balances (reserved for Phase 0.1+)
        deposit_balance: Map<ContractAddress, u256>,

        // Reentrancy guard
        locked: bool,
    }

    #[event]
    #[derive(Drop, Serde, starknet::Event)]
    enum Event {
        ChamaCreated: ChamaCreated,
        MemberJoined: MemberJoined,
        ContributionRecorded: ContributionRecorded,
        PayoutExecuted: PayoutExecuted,
    }

    #[derive(Drop, Serde, starknet::Event)]
    struct ChamaCreated { id: u64, creator: ContractAddress, token: ContractAddress, deposit: u256 }
    #[derive(Drop, Serde, starknet::Event)]
    struct MemberJoined { chama_id: u64, member: ContractAddress }
    #[derive(Drop, Serde, starknet::Event)]
    struct ContributionRecorded { chama_id: u64, member: ContractAddress, amount: u256, cycle: u64 }
    #[derive(Drop, Serde, starknet::Event)]
    struct PayoutExecuted { chama_id: u64, recipient: ContractAddress, amount: u256, cycle: u64 }

    fn contrib_key(cycle: u64, idx1: u16) -> felt252 {
        let c: felt252 = cycle.into();
        let i: felt252 = idx1.into();
        c * 65536 + i
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        id: u64,
        token: ContractAddress,
        creator: ContractAddress,
        deposit_amount: u256,
        contribution_amount: u256,
        penalty_bps: u16,
        max_members: u16,
        cycle_duration_secs: u64
    ) {
        self.id.write(id);
        self.token.write(token);
        self.creator.write(creator);
        self.deposit_amount.write(deposit_amount);
        self.contribution_amount.write(contribution_amount);
        self.penalty_bps.write(penalty_bps);
        self.max_members.write(max_members);
        self.cycle_duration_secs.write(cycle_duration_secs);
        self.is_active.write(true);
        self.members_len.write(0_u16);
        self.current_round.write(1_u16);
        self.current_cycle.write(1_u64);
        let now = get_block_timestamp();
        self.next_cycle_start.write(now + cycle_duration_secs);
        self.emit(Event::ChamaCreated(ChamaCreated { id, creator, token, deposit: deposit_amount }));
    }

    #[external(v0)]
    fn get_meta(self: @ContractState) -> (u64, ContractAddress, ContractAddress, u256, u256, u16, u16, u64, bool) {
        (
            self.id.read(),
            self.token.read(),
            self.creator.read(),
            self.deposit_amount.read(),
            self.contribution_amount.read(),
            self.penalty_bps.read(),
            self.max_members.read(),
            self.cycle_duration_secs.read(),
            self.is_active.read(),
        )
    }

    #[external(v0)]
    fn join(ref self: ContractState, member: ContractAddress) {
        assert(self.is_active.read(), 'INACTIVE');
        let count: u16 = self.members_len.read();
        assert(count < self.max_members.read(), 'FULL');
        let existing = self.members_index.read(member);
        assert(existing == 0_u16, 'DUP');
        let new_idx: u16 = count + 1_u16; // 1-based index
        self.members.write(new_idx, member);
        self.members_len.write(new_idx);
        self.members_index.write(member, new_idx);
        self.emit(Event::MemberJoined(MemberJoined { chama_id: self.id.read(), member }));
    }

    #[external(v0)]
    fn contribute(ref self: ContractState, member: ContractAddress, amount: u256) {
        assert(self.is_active.read(), 'INACTIVE');
        let now = get_block_timestamp();
        assert(now < self.next_cycle_start.read(), 'CLOSED');
        let idx1 = self.members_index.read(member);
        assert(idx1 != 0_u16, 'NOTMEM');
        assert(amount == self.contribution_amount.read(), 'AMOUNT');
        let key = contrib_key(self.current_cycle.read(), idx1);
        self.contributions.write(key, true);
        self.emit(Event::ContributionRecorded(ContributionRecorded { chama_id: self.id.read(), member, amount, cycle: self.current_cycle.read() }));
    }

    #[external(v0)]
    fn payout(ref self: ContractState) {
        assert(self.is_active.read(), 'INACTIVE');
        let now = get_block_timestamp();
        assert(now >= self.next_cycle_start.read(), 'NOT_ENDED');
        let count: u16 = self.members_len.read();
        assert(count == self.max_members.read(), 'NOT_FULL');
        let mut contributed: u16 = 0_u16;
        let mut i: u16 = 1_u16;
        loop {
            if i > count { break; }
            let key = contrib_key(self.current_cycle.read(), i);
            let did = self.contributions.read(key);
            if did { contributed = contributed + 1_u16; }
            i = i + 1_u16;
        }
        let unit = self.contribution_amount.read();
        let amount: u256 = unit * u256 { low: contributed.into(), high: 0 };
        let round = self.current_round.read();
        let r_idx: u16 = if round == 0_u16 { 1_u16 } else { round };
        let recipient = self.members.read(r_idx);
        self.emit(Event::PayoutExecuted(PayoutExecuted { chama_id: self.id.read(), recipient, amount, cycle: self.current_cycle.read() }));
        let next_round: u16 = if self.current_round.read() % self.max_members.read() == 0_u16 { 1_u16 } else { self.current_round.read() + 1_u16 };
        self.current_round.write(next_round);
        self.current_cycle.write(self.current_cycle.read() + 1_u64);
        self.next_cycle_start.write(now + self.cycle_duration_secs.read());
    }
}

