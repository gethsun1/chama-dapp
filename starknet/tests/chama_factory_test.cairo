#[cfg(test)]
mod tests {
    use snforge_std::prelude::*;

    #[test]
    fn factory_sanity() {
        assert(2 == 1 + 1, 'ok');
    }
}

