module 0x42::link{
    use std::option::Option;
    use aptos_std::table;

    struct Node {
        data: u64,
        next: table::Table<>
    }
}