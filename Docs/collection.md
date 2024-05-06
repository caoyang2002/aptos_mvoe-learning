# increment_supply

```move
/// 当代币在铸造时调用以增加供应量，如果存在相应的 Supply 结构体。
/// TODO[agg_v2](清理): 在未来的版本中移除。我们需要同时拥有这两个函数，因为
/// 在 AGGREGATOR_API_V2 启用之前，无法使用 increment_concurrent_supply。

/// 此函数用于增加集合的供应量，通常在代币铸造时被调用。
/// 如果存在相应的 Supply 结构体，它将供应量增加一。
///
/// 参数:
/// - `collection`: 集合对象的引用，其供应量将被增加。
/// - `token`: 将被铸造的代币的地址。
///
/// 返回:
/// - `Option<u64>`: 返回一个包含铸造的代币索引的 `Option`，如果铸造成功则为 `Some`，否则为 `None`。
///
/// 注意:
/// - 此函数需要访问 `FixedSupply` 和 `UnlimitedSupply` 资源，以修改供应量。
/// - 如果 `collection` 地址上存在 `FixedSupply`，则增加 `current_supply` 和 `total_minted`，
///   并断言 `current_supply` 不超过 `max_supply`。
/// - 如果 `collection` 地址上存在 `UnlimitedSupply`，则同样增加 `current_supply` 和 `total_minted`，
///   但没有供应量上限的检查。
/// - 发出一个 `MintEvent` 事件，包含铸造的代币索引和代币地址。
/// - 如果既不是 `FixedSupply` 也不是 `UnlimitedSupply`，则返回 `None`。
public(friend) fun increment_supply(
    collection: &Object<Collection>,
    token: address,
): Option<u64> acquires FixedSupply, UnlimitedSupply {
    // 获取集合对象的地址
    let collection_addr = object::object_address(collection);
    // 检查集合地址上是否存在 FixedSupply 结构体
    if (exists<FixedSupply>(collection_addr)) {
        let supply = borrow_global_mut<FixedSupply>(collection_addr);
        supply.current_supply = supply.current_supply + 1;
        supply.total_minted = supply.total_minted + 1;
        // 确保当前供应量不超过最大供应量
        assert!(
            supply.current_supply <= supply.max_supply,
            error::out_of_range(ECOLLECTION_SUPPLY_EXCEEDED),
        );
        // 发出 MintEvent 事件
        event::emit_event(&mut supply.mint_events,
            MintEvent {
                index: supply.total_minted,
                token,
            },
        );
        // 返回 Some 包含总铸造数
        option::some(supply.total_minted)
    } else if (exists<UnlimitedSupply>(collection_addr)) {
        // 如果是 UnlimitedSupply，则无需检查最大供应量
        let supply = borrow_global_mut<UnlimitedSupply>(collection_addr);
        supply.current_supply = supply.current_supply + 1;
        supply.total_minted = supply.total_minted + 1;
        // 发出 MintEvent 事件
        event::emit_event(
            &mut supply.mint_events,
            MintEvent {
                index: supply.total_minted,
                token,
            },
        );
        // 返回 Some 包含总铸造数
        option::some(supply.total_minted)
    } else {
        // 如果集合地址上既没有 FixedSupply 也没有 UnlimitedSupply，则返回 None
        option::none()
    }
}
```









# increment_concurrent_supply

```move
/// 此函数用于增加集合的并发供应量，通常在代币铸造时被调用。
/// 如果存在相应的供应量结构体（ConcurrentSupply, FixedSupply, UnlimitedSupply），它将供应量增加一。
///
/// 参数:
/// - `collection`: 集合对象的引用，其供应量将被增加。
/// - `token`: 将被铸造的代币的地址。
///
/// 返回:
/// - `Option<AggregatorSnapshot<u64>>`: 返回一个包含铸造的代币索引的 `AggregatorSnapshot<u64>`，如果铸造成功则为 `Some`，否则为 `None`。
///
/// 注意:
/// - 此函数需要访问 `FixedSupply`、`UnlimitedSupply` 和 `ConcurrentSupply` 资源，以修改供应量。
/// - 根据集合地址上存在的供应量结构体类型，执行不同的逻辑。
/// - 对于 `ConcurrentSupply`，使用 `aggregator_v2::try_add` 增加供应量，并使用 `aggregator_v2::add` 增加总铸造数。
/// - 对于 `FixedSupply` 和 `UnlimitedSupply`，直接增加供应量和总铸造数。
/// - 发出一个 `ConcurrentMintEvent` 或 `MintEvent` 事件，包含铸造的代币索引和代币地址。
/// - 返回 `Some` 包含总铸造数的快照，如果铸造成功。

public(friend) fun increment_concurrent_supply(
    collection: &Object<Collection>,
    token: address,
): Option<AggregatorSnapshot<u64>> acquires FixedSupply, UnlimitedSupply, ConcurrentSupply {
    // 获取集合对象的地址
    let collection_addr = object::object_address(collection);
    // 检查集合地址上是否存在 ConcurrentSupply 结构体
    if (exists<ConcurrentSupply>(collection_addr)) {
        let supply = borrow_global_mut<ConcurrentSupply>(collection_addr);
        // 增加供应量，如果超出限制则断言失败
        assert!(
            aggregator_v2::try_add(&mut supply.current_supply, 1),
            error::out_of_range(ECOLLECTION_SUPPLY_EXCEEDED),
        );
        // 增加总铸造数
        aggregator_v2::add(&mut supply.total_minted, 1);
        // 发出并发铸造事件
        event::emit(
            ConcurrentMintEvent {
                collection_addr,
                index: aggregator_v2::snapshot(&supply.total_minted),
                token,
            },
        );
        // 返回铸造的代币索引快照
        option::some(aggregator_v2::snapshot(&supply.total_minted))
    } else if (exists<FixedSupply>(collection_addr)) {
        // 如果存在 FixedSupply 结构体
        let supply = borrow_global_mut<FixedSupply>(collection_addr);
        // 增加供应量和总铸造数
        supply.current_supply = supply.current_supply + 1;
        supply.total_minted = supply.total_minted + 1;
        // 确保供应量没有超过最大供应量
        assert!(
            supply.current_supply <= supply.max_supply,
            error::out_of_range(ECOLLECTION_SUPPLY_EXCEEDED),
        );
        // 发出铸造事件
        event::emit_event(&mut supply.mint_events,
            MintEvent {
                index: supply.total_minted,
                token,
            },
        );
        // 返回总铸造数的快照
        option::some(aggregator_v2::create_snapshot<u64>(supply.total_minted))
    } else if (exists<UnlimitedSupply>(collection_addr)) {
        // 如果存在 UnlimitedSupply 结构体
        let supply = borrow_global_mut<UnlimitedSupply>(collection_addr);
        // 增加供应量和总铸造数
        supply.current_supply = supply.current_supply + 1;
        supply.total_minted = supply.total_minted + 1;
        // 发出铸造事件
        event::emit_event(
            &mut supply.mint_events,
            MintEvent {
                index: supply.total_minted,
                token,
            },
        );
        // 返回总铸造数的快照
        option::some(aggregator_v2::create_snapshot<u64>(supply.total_minted))
    } else {
        // 如果集合地址上既没有 FixedSupply 也没有 UnlimitedSupply 也没有 ConcurrentSupply，则返回 None
        option::none()
    }
}

```


这段代码是一个智能合约中的函数，用于在代币铸造时增加集合的供应量。它首先检查集合对象的地址是否存在 `ConcurrentSupply`、`FixedSupply` 或 `UnlimitedSupply` 结构体，然后根据情况增加供应量，并发出一个铸造事件。如果存在相应的供应量结构体，则函数返回 `Some` 包含铸造的代币索引的快照；如果不存在，则返回 `None`。此外，对于 `FixedSupply`，还有一个断言来确保供应量不会超过预设的最大值。
