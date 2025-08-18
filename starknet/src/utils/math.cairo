use starknet::Uint256;

fn u256_add(a: Uint256, b: Uint256) -> Uint256 {
    let (res, _) = a.add(b);
    res
}

fn u256_sub(a: Uint256, b: Uint256) -> Uint256 {
    let (res, _) = a.sub(b);
    res
}

