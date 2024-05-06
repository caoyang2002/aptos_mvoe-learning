module 0x12::count{
    use std::vector;
    use aptos_std::debug::print;
    #[test_only]
    use std::features;
    use std::string;


    const AGGREGATOR_V2_API: u64 = 30;

    public fun aggregator_v2_api_enabled(): bool acquires Features {
        is_enabled(AGGREGATOR_V2_API)
    }

    struct Features has key {
        features: vector<u8>,
    }
    public fun contains(features: &vector<u8>, feature: u64): bool {
        let byte_index = feature / 8;
        print(&byte_index);
        let bit_mask = 1 << ((feature % 8) as u8);
        print(&bit_mask);
        byte_index < vector::length(features) && (*vector::borrow(features, byte_index) & bit_mask) != 0
    }
    public fun is_enabled(feature: u64): bool acquires Features {
        exists<Features>(@std) && contains(&borrow_global<Features>(@std).features, feature)
    }

    #[test]
    fun test() acquires Features {
        if ( aggregator_v2_api_enabled()){
            print(&string::utf8(b"ok"))
        }
    }
}
