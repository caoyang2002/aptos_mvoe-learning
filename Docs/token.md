# create_numbered_token

```move
public fun create_numbered_token(
    creator: &signer,
    collection_name: String,
    description: String,
    name_with_index_prefix: String,
    name_with_index_suffix: String,
    royalty: Option<Royalty>,
    uri: String,
): ConstructorRef {
    let creator_address = signer::address_of(creator);
    let constructor_ref = object::create_object(creator_address);
    // 调用内联函数
    create_common(&constructor_ref, creator_address, collection_name, description, name_with_index_prefix, option::some(name_with_index_suffix), royalty, uri);
    constructor_ref
}
```



## string_concat

```move
/// 将 `before`、`snapshot` 和 `after` 串联成一个单独的字符串。
/// 传入的 `snapshot` 需要是整数类型 - 目前支持的类型有 u64 和 u128。
/// 如果使用另一种类型调用，将引发 EUNSUPPORTED_AGGREGATOR_SNAPSHOT_TYPE 错误。
/// 如果前缀和后缀的长度总和超过 256 字节，将引发 ECONCAT_STRING_LENGTH_TOO_LARGE 错误。
/// public native fun string_concat<IntElement>(before: String, snapshot: &AggregatorSnapshot<IntElement>, after: String): AggregatorSnapshot<String>;
```

> `string_concat` 函数的作用是将一个字符串（`before`）和一个字符串（`after`）分别放在一个聚合器快照（`snapshot`）的前后，然后将这三个部分串联起来，形成一个新的字符串快照，返回这个新的快照对象。这个函数在区块链编程中可能用于处理和存储交易的快照数据。



# create_common

```rust
// 内联函数，用于创建代币
inline fun create_common(
    constructor_ref: &ConstructorRef, // 构造函数的引用
    creator_address: address, // 创建者地址
    collection_name: String, // 集合名称
    description: String, // 代币描述
    name_prefix: String, // 代币名称前缀
    // 如果是 option::some，将创建带编号的代币 - 即在名称后附加索引。
    // 如果是 option::none，name_prefix 就是代币的完整名称。
    name_with_index_suffix: Option<String>, // 后缀是可选的
    royalty: Option<Royalty>, // 版税选项
    uri: String, // 代币资源的统一资源标识符
) {
    // 检查名称前缀长度是否在允许的最大长度内
    if (option::is_some(&name_with_index_suffix)) {
        // 假设索引长度最大为20个字符（最大U64的字符串长度）
        assert!(string::length(&name_prefix) + 20 + string::length(option::borrow(&name_with_index_suffix)) 
                <= MAX_TOKEN_NAME_LENGTH, error::out_of_range(ETOKEN_NAME_TOO_LONG));
    } else {
        assert!(string::length(&name_prefix) <= MAX_TOKEN_NAME_LENGTH, error::out_of_range(ETOKEN_NAME_TOO_LONG));
    };
    // 检查描述和URI长度是否在允许的最大长度内
    assert!(string::length(&description) <= MAX_DESCRIPTION_LENGTH, error::out_of_range(EDESCRIPTION_TOO_LONG));
    assert!(string::length(&uri) <= MAX_URI_LENGTH, error::out_of_range(EURI_TOO_LONG));

    // 生成对象签名
    let object_signer = object::generate_signer(constructor_ref);

    // 创建集合地址并转换为集合对象
    let collection_addr = collection::create_collection_address(&creator_address, &collection_name);
    let collection = object::address_to_object<Collection>(collection_addr);

	// TODO [agg_v2](清理) 一旦此标志被启用，就清理 aggregator_api_enabled = false 的代码。
    // 控制是否可以调用聚合器_v2模块中任何函数的标志。
    
    // 特性标志，控制是否启用聚合器API
    let aggregator_api_enabled = features::aggregator_v2_api_enabled();
    // 特性标志，控制是否启用并发资产
    let concurrent_assets_enabled = features::concurrent_assets_enabled();


	// 如果聚合器API启用，则执行以下逻辑：
	let (deprecated_index, deprecated_name) = if (aggregator_api_enabled) {
    	// 使用destroy_with_default函数，它在increment_concurrent_supply函数返回some时销毁并返回值，
    	// 如果返回none，则返回create_snapshot创建的快照，这里快照的初始值为0。
    	let index = option::destroy_with_default(
        	collection::increment_concurrent_supply(&collection, signer::address_of(&object_signer)),
        	aggregator_v2::create_snapshot<u64>(0)
    	);

    	// 如果需要创建带编号的代币，则在名称前缀后添加索引。
    	let name = if (option::is_some(&name_with_index_suffix)) {
        	aggregator_v2::string_concat(
            	name_prefix, // 使用的名称前缀
            	&index, // 代币的索引
            	option::extract(&mut name_with_index_suffix) // 从选项中提取名称后缀
        	)
    	} else {
        	aggregator_v2::create_snapshot(name_prefix) // 如果不需要带编号，直接使用名称前缀
    	};

    	// 在concurrent_assets_enabled特性标志启用之前，我们仍需要向已弃用的字段写入数据。
    	// 否则，我们将在那里放置空值。
    	// （我们需要在创建token_concurrent之前进行这些调用，以避免复制对象）
    	let deprecated_index = if (concurrent_assets_enabled) {
        	0 // 如果并发资产特性标志启用，使用0作为已弃用的索引
    	} else {
        	aggregator_v2::read_snapshot(&index) // 否则，从快照中读取索引
    	};
    	let deprecated_name = if (concurrent_assets_enabled) {
        	string::utf8(b"") // 如果并发资产特性标志启用，使用空字符串作为已弃用的名称
    	} else {
        	aggregator_v2::read_snapshot(&name) // 否则，从快照中读取名称
    	};

    	// 如果聚合器API启用，我们总是填充新添加的字段
    	let token_concurrent = ConcurrentTokenIdentifiers {
        	index, // 代币的索引
        	name, // 代币的名称
    	};
    	move_to(&object_signer, token_concurrent); // 将新创建的token_concurrent对象移至对象签名

    	(deprecated_index, deprecated_name) // 返回已弃用的索引和名称
	} else {
    	// 如果聚合器API特性标志未启用，我们不能使用increment_concurrent_supply或创建ConcurrentTokenIdentifiers，
    	// 因此我们退回到旧的行为。
   		let id = collection::increment_supply(&collection, signer::address_of(&object_signer));
    	let index = option::get_with_default(&mut id, 0); // 获取供应量增量，如果没有则使用0

    	// 如果需要创建带编号的代币，则在名称前缀后添加索引。
    	let name = if (option::is_some(&name_with_index_suffix)) {
        	let mut name = name_prefix.to_string(); // 将名称前缀转换为字符串
        	string::append(&mut name, to_string<u64>(&index)); // 将索引追加到名称
        	string::append(&mut name, option::extract(&mut name_with_index_suffix)); // 将名称后缀追加到名称
        	name // 返回组合后的名称
    	} else {
        	name_prefix.to_string() // 如果不需要带编号，直接使用名称前缀
    	};

    	(index, name) // 返回索引和名称
	};
	
    // 创建代币对象并将其移动到对象签名
    let token = Token {
        collection, // 所属集合
        index: deprecated_index, // 代币索引
        description, // 代币描述
        name: deprecated_name, // 代币名称
        uri, // 代币URI
        mutation_events: object::new_event_handle(&object_signer), // 事件句柄
    };
    move_to(&object_signer, token);

    // 如果提供了版税选项，则初始化版税
    if (option::is_some(&royalty)) {
        royalty::init(constructor_ref, option::extract(&mut royalty))
    };
}
```



## index

```move
/// **避免在铸造代币的同一事务中调用此方法**
/// **因为这将禁止事务并行执行。**
/// 
/// 此函数用于获取与特定代币对象关联的索引。
/// 它首先尝试从全局状态中获取`ConcurrentTokenIdentifiers`对象，
/// 如果存在，则读取并返回该对象的索引。
/// 如果不存在，则直接从传入的代币对象中获取索引。
/// 
/// 参数:
/// - `token`: 一个代币对象，用作获取索引的依据。
///
/// 返回:
/// - 返回一个`u64`类型的索引值。
public fun index<T: key>(token: Object<T>): u64 acquires Token, ConcurrentTokenIdentifiers {
    // 获取传入代币对象的地址
    let token_address = object::object_address(&token);
    // 检查是否存在`ConcurrentTokenIdentifiers`对象
    if (exists<ConcurrentTokenIdentifiers>(token_address)) {
        // 如果存在，从全局状态中读取并返回`ConcurrentTokenIdentifiers`对象的索引
        aggregator_v2::read_snapshot(&borrow_global<ConcurrentTokenIdentifiers>(token_address).index)
    } else {
        // 如果不存在，直接从传入的代币对象中获取索引
        borrow(&token).index
    }
}
```





## aggregator_v2

```move
/// 将 `before`、`snapshot` 和 `after` 串联成一个单独的字符串。
/// 传入的 snapshot 需要是整数类型 - 目前支持的类型有 u64 和 u128。
/// 如果使用其他类型调用，将引发 EUNSUPPORTED_AGGREGATOR_SNAPSHOT_TYPE 错误。
/// 如果前缀和后缀的长度总和超过 256 字节，将引发 ECONCAT_STRING_LENGTH_TOO_LARGE 错误。
public native fun string_concat<IntElement>(before: String, snapshot: &AggregatorSnapshot<IntElement>, after: String): AggregatorSnapshot<String>;
```







```move
/// Aggregator V2 API 特性是否已启用。
/// 一旦启用，aggregator_v2.move 中的函数将可供使用。
/// 生命周期：短暂的
const AGGREGATOR_V2_API: u64 = 30;
public fun aggregator_v2_api_enabled(): bool acquires Features {
    is_enabled(AGGREGATOR_V2_API)
}
```



```move
/// 检查特性是否已启用。
public fun is_enabled(feature: u64): bool acquires Features {
    exists<Features>(@std) &&
        contains(&borrow_global<Features>(@std).features, feature)
}
```





```
/// 辅助函数，用于检查一个特性标志是否已启用。
fun contains(features: &vector<u8>, feature: u64): bool {
    let byte_index = feature / 8;
    let bit_mask = 1 << ((feature % 8) as u8);
    byte_index < vector::length(features) && (*vector::borrow(features, byte_index) & bit_mask) != 0
}
```



























