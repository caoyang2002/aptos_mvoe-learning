<a name="readme-top"></a>

# Aptos_move-Learning

**简体中文** | [English](Docs/en/README.md) | [CHANGELOG](Docs/CHANGELOG.md)

# 创建一个 NFT

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

> [!IMPORTANT]
> 这里只是实现了创建 NFT 的基本操作

创建 NFT 后需要保存可变引用

## 1. 配置文件

```toml
[package]
name = "create_one_nft"
version = "1.0.0"
authors = []

[addresses]

# 这里改为你自己的 aptos init 出来的地址
MyNFT = "0xfa1d368f0dbad70a35ebce24a13b6e8d77eb159311a54ffc0b920390dbd7349f"

[dev-addresses]

# 这里使用 AptosTokenObjects
[dependencies.AptosTokenObjects]
git = "https://github.com/aptos-labs/aptos-core.git"
rev = "testnet"
subdir = "aptos-move/framework/aptos-token-objects"

[dev-dependencies]
```

## 2. 创建一个 collection

```move
module MyNFT::first_NFT{
    use std::option;
    use std::signer;
    use std::string;
    use aptos_token_objects::collection;
    use aptos_token_objects::royalty;

    // step one: create a collection
    public entry fun create_collection(creator: &signer) {
        let max_supply = 1000;
        let collection_construcor_ref = &collection::create_fixed_collection(
            creator,
            string::utf8(b"collection_description"),
            max_supply,
            string::utf8(b"collection_name"),
            option::some(royalty::create(1,1,signer::address_of(creator))),
            string::utf8(b"collectionURI"),
        );
    }
}
```

- 每一个 toekn 都需要放在 collection 里面
- `royalty::create(1,1,signer: :address_of(creator))`: 设置版税费，也可以使用 `option::none()` 取消版税，版税的计算方式是 `(分子 / 分母) * 100%`
- `create_fixed_collection`：创建一个具有固定大小的 collection ，或者能够容纳固定数量 token 的 collection 。

  - 这对于生成一个在链上具有确定且有限供应的数字资产非常有用。
  - 比如，可以创建一个包含 ”1111 条蝰蛇“ 的 collection 系列。
  - 需要注意的是，设置诸如上限之类的限制会导致数据结构的设计，这种设计会阻碍 Aptos 对这个类型 collection 的 mint 操作进行并行处理。而且，这种方法还通过事件机制增加了对供应量的跟踪功能。

- `fun create_collection(creator:&signer){}`: fun 要挨着函数名, 否则会报错

> [!TIP]
> 函数签名在 publish 后不可以更改, 否则会出现冲突, 导致无法再次 publish

## 3. 创建 mint 函数

用于创建 token ，并创建 burn 引用，移动到创建者的地址上

- 保存 burn 引用的结构体，需要 key 能力，用于在全局作为键

```Move
// token ref manager
struct TokenRefsStore has key {
    burn_ref: token::BurnRef,
}
```

- 配置 token 的信息，并使用 cerate 函数创建出来

```move
// step two: mint NFT
public entry fun mint(creator: &signer){
    let token_constructor_ref = &token::create(
        creator,
        string::utf8(b"collection_name"),
        string::utf8(b"token_description"),
        string::utf8(b"token_name"),
        option::some(royalty::create(1,1,signer::address_of(creator))),
        string::utf8(b"token_uri")
        );
    // Create a reference for burning an NFT
    let burn_ref = token::generate_burn_ref(token_constructor_ref);
    move_to(
        creator,
        TokenRefsStore{
            burn_ref,
        }
    );
}
```

- `move_to` 把后者移动给前者，这里是把结构体以及 burn_ref，移动到 ceator 的地址，以便用于删除
- `string::utf8(b"collection_name")`：这里的 `Collection_name` 必须和刚才创建的 collection 名字相同，因为这个 token 会被放入指定的 collection

## 4. 创建 burn 函数

```move
public entry fun burn(creator:&signer) acquires TokenRefsStore {
    let TokenRefsStore{
        burn_ref,
    } = move_from<TokenRefsStore>(signer::address_of(creator));
    token::burn(burn_ref)
}
```

- `move_from`：是 Move 语言中用于资源转移的标准库函数，它将资源的所有权从一个地址转移到另一个地址。这里是将`creator`账户地址下的一个`TokenRefsStore`资源移动到当前操作的上下文中，并且提取出`burn_ref`字段供后续使用。
- `burn`：是烧毁 token 的函数。

> [!CAUTION]
> 问题:
>
> burn 的引用保存在创建者账户下的, 可以更改到合约地址下, 即: 使用 token 构造器引用生成一个签名 (signer)
>
> `let token_signer = object::generate_signer(&token_construcor_ref);`
