<a name="readme-top"></a>

# Aptos_move-Learning

**简体中文** | [English](Docs/en/README.md) | [CHANGELOG](Docs/CHANGELOG.md)

# 使用 init_moudle 初始化模块

> 使用 init_module 初始化模块, 并为 collection 创建可更改的引用 mutator
>
> `collection:generate_mutator_ref()`

<div align="right">
[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

## 1. 创建 init_module

> `init_module` 是一个初始化函数, Move 虚拟机会在该模块首次发布的时候搜索并执行这个模块, 但是不会在升级的时候执行它,
>
> 发布模块的账户签名者会被传递给合约的 `init_module` 函数, 这个函数必须是私有的, 并且不返回任何值

cont

```rust
// collection information
const CollectionDescription:vector<u8> = b"collection_description";
const CollectionName:vector<u8> = b"collection_name";
const CollectionURI:vector<u8> = b"collection_uri";

// create a resource account seed
const ResourceAccountSeed:vector<u8> = b"seed";
```

一个最基本的 `init_module`,

```rust
fun init_module(creator: &signer){
    let max_supply = 10;
    let collection_constructor_ref = collection::create_fixed_collection(
        &resource_signer,
        string::utf8(CollectionDescription),
        max_supply,
        string::utf8(CollectionName),
        option::none(),
        string::utf8(CollectionURI),
    );

}
```

但是存在几个问题:

1. 这里的 creator 是合约自己, 并且这个 `create_collection` 只能在发布的时候调用一次, 也就是说用户不能创建这个 collection, 导致用户无法 `mint` NFT

解决方法: 创建一个资源账户, 用户临时保存资源, 随后在用户调用的时候转移到用户的地址下

> 创建一个资源账户, 这个资源账户属于这个合约

```rust
// create a resource account
let (resource_signer,resource_signer_cap) = account::create_resource_account(creator,ResourceAccountSeed);
move_to( &resource_signer,ResourceCap{cap:resource_signer_cap});
```

> 创建 collection 可变更引用

```rust
// create collection mutator
let collection_signer = object::generate_signer(&collection_constructor_ref);
let collection_mutator_ref = collection::generate_mutator_ref(&collection_constructor_ref);
move_to(&collection_signer,CollectionRefsStore{collection_mutator_ref})
```

完整代码

```rust
fun init_module(creator: &signer){
    // create a resource account
    let (resource_signer,resource_cap) = account::create_resource_account(creator,ResourceAccountSeed);
    move_to(&resource_signer,ResourceCap{cap:resource_cap});
    // collection
    let max_supply = 10;
    let collection_constructor_ref = collection::create_fixed_collection(
        &resource_signer,
        string::utf8(CollectionDescription),
        max_supply,
        string::utf8(CollectionName),
        option::none(),
        string::utf8(CollectionURI),
    );

    // create collection mutator
    let collection_signer = object::generate_signer(&collection_constructor_ref);
    let collection_mutator_ref = collection::generate_mutator_ref(&collection_constructor_ref);
    move_to(&collection_signer,CollectionRefsStore{collection_mutator_ref})
}
```

## 2. mint 函数

> 要点

```rust
// borrow signer capability
let resource_signer_cap = &borrow_global<ResourceCap>(account::create_resource_address(&@MyNFT,ResourceAccountSeed)).cap;
let resource_signer = &account::create_signer_with_capability(resource_signer_cap);
```

```rust
let token_constructor_ref = token::create_numbered_token(
    resource_signer,
    string::utf8(CollectionName),
    string::utf8(TokenDescription),
    string::utf8(TokenPrefix),
    string::utf8(b""),
    option::some(royalty::create(1,1,address_of(resource_signer))),
    string::utf8(b""),
);
```

```rust
let url = string::utf8(TokenURI);
let id = token::index<Token>(object::object_from_constructor_ref(&token_constructor_ref));
string::append(&mut url,string_utils::to_string(&id));
string::append(&mut url, string::utf8(b".png"));
let token_mutator_ref = token::generate_mutator_ref(&token_constructor_ref);
token::set_uri(&token_mutator_ref,url);
let token_mutator_ref = token::generate_mutator_ref(&token_constructor_ref);
let token_burn_ref = token::generate_burn_ref(&token_constructor_ref);
let token_signer = object::generate_signer(&token_constructor_ref);
```

> 这里首先是创建了一个资源地址, 并借用了 cap 能力
>
> 然后使用资源能力创建了一个签名者

```rust
move_to(
    &token_signer,
    TokenRefsStore{
        token_mutator_ref,
        token_burn_ref,
    }
);
```

- 将指定地址处的对象（`Object<T>`）的所有权（以及所有相关资源）转移到“to”地址。

```rust
object::transfer(
    resource_signer,
    object::object_from_constructor_ref<Token>(&token_constructor_ref),
    signer::address_of(creator) // to
)
```

> 源码:
>
> ```rust
> public entry fun transfer<T: key>(
>     owner: &signer,
>     object: Object<T>,
>     to: address,
> ) acquires ObjectCore {
>     transfer_raw(owner, object.inner, to)
> }
> ```
>
> 尝试仅使用地址进行转移。如果设置了 allow_ungated_transfer 为 true，则转移给定的对象。注意，这允许嵌套对象的所有者转移该对象，只要在层次结构的每个阶段都启用了 allow_ungated_transfer。
>
> ```rust
> public fun transfer_raw(
>     owner: &signer,
>     object: address,
>     to: address,
> ) acquires ObjectCore {
>     let owner_address = signer::address_of(owner);
>     verify_ungated_and_descendant(owner_address, object);
>     transfer_raw_inner(object, to);
> }
> ```

## 3. burn

```rust
/// No ownership
const ERROR_NO_OWNERSHIP:u64 = 404;
public entry fun burn(creator:&signer,object:Object<Token>) acquires TokenRefsStore {
    assert!(object::is_owner(object,signer::address_of(creator)),ERROR_NO_OWNERSHIP);
    let TokenRefsStore{
        token_mutator_ref: _,
        token_burn_ref
    } = move_from<TokenRefsStore>(object::object_address(&object));
    token::burn(token_burn_ref);
}
```

- 完整代码

```rust
module MyNFT::init_module_collection{
    use std::option;
    use std::signer;
    use std::signer::address_of;
    use std::string;
    use aptos_std::string_utils;
    use aptos_framework::account;
    use aptos_framework::account::SignerCapability;
    use aptos_framework::object;
    use aptos_framework::object::Object;
    use aptos_token_objects::collection;
    use aptos_token_objects::royalty;
    use aptos_token_objects::token;
    use aptos_token_objects::token::Token;

    // collection information
    const CollectionDescription:vector<u8> = b"collection_description";
    const CollectionName:vector<u8> = b"collection_name";
    const CollectionURI:vector<u8> = b"https://caoyang2002.top/images/gclx/bird.png";

    // token information
    const TokenDescription:vector<u8> = b"token_description";
    const TokenName:vector<u8> = b"token_name";
    const TokenURI:vector<u8> = b"https://caoyang2002.top/images/gclx/";
    const TokenPrefix:vector<u8> = b"number #";

    // create a resource account seed
    const ResourceAccountSeed:vector<u8> = b"seed";


    struct ResourceCap has key{
        cap:SignerCapability
    }
    struct CollectionRefsStore has key{
        collection_mutator_ref:collection::MutatorRef
    }
    struct TokenRefsStore has key{
        token_mutator_ref: token::MutatorRef,
        token_burn_ref: token::BurnRef,
    }

    fun init_module(creator: &signer){
        // create a resource account
        let (resource_signer,resource_cap) = account::create_resource_account(creator,ResourceAccountSeed);
        move_to(&resource_signer,ResourceCap{cap:resource_cap});
        // collection
        let max_supply = 10;
        let collection_constructor_ref = collection::create_fixed_collection(
            &resource_signer,
            string::utf8(CollectionDescription),
            max_supply,
            string::utf8(CollectionName),
            option::none(),
            string::utf8(CollectionURI),
        );

        // create collection mutator
        let collection_signer = object::generate_signer(&collection_constructor_ref);
        let collection_mutator_ref = collection::generate_mutator_ref(&collection_constructor_ref);
        move_to(&collection_signer,CollectionRefsStore{collection_mutator_ref})
    }

    public entry fun mint(creator:&signer)acquires ResourceCap {
        // borrow signer capability
        let resource_cap = &borrow_global<ResourceCap>(account::create_resource_address(&@MyNFT,ResourceAccountSeed)).cap;
        let resource_signer = &account::create_signer_with_capability(resource_cap);
        let token_constructor_ref = token::create_numbered_token(
            resource_signer,
            string::utf8(CollectionName),
            string::utf8(TokenDescription),
            string::utf8(TokenPrefix),
            string::utf8(b""),
            option::some(royalty::create(1,1,address_of(resource_signer))),
            string::utf8(b""),
        );
        let url = string::utf8(TokenURI);
        let id = token::index<Token>(object::object_from_constructor_ref(&token_constructor_ref));
        string::append(&mut url,string_utils::to_string(&id));
        string::append(&mut url, string::utf8(b".png"));
        let token_mutator_ref = token::generate_mutator_ref(&token_constructor_ref);
        token::set_uri(&token_mutator_ref,url);
        let token_mutator_ref = token::generate_mutator_ref(&token_constructor_ref);
        let token_burn_ref = token::generate_burn_ref(&token_constructor_ref);
        let token_signer = object::generate_signer(&token_constructor_ref);
        move_to(
            &token_signer,
            TokenRefsStore{
                token_mutator_ref,
                token_burn_ref,
            }
        );
        object::transfer(
            resource_signer,
            object::object_from_constructor_ref<Token>(&token_constructor_ref),
            signer::address_of(creator)
        )
    }

    /// No ownership
    const ERROR_NO_OWNERSHIP:u64 = 404;
    public entry fun burn(creator:&signer,object:Object<Token>) acquires TokenRefsStore {
        assert!(object::is_owner(object,signer::address_of(creator)),ERROR_NO_OWNERSHIP);
        let TokenRefsStore{
            token_mutator_ref: _,
            token_burn_ref
        } = move_from<TokenRefsStore>(object::object_address(&object));
        token::burn(token_burn_ref);
    }

}

```