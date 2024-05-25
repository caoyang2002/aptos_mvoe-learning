<a name="readme-top"></a>

# Aptos_move-Learning

**简体中文** | [English](Docs/en/README.md) | [CHANGELOG](Docs/CHANGELOG.md)

# 创建一个将 burn 保存在 object 内的 NFT

> 使用 const 定义常量

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

> [!IMPORTANT]
> 这里除了创建 NFT 及基本操作外，还实现了一个 token 的签名 (object)， 用于存储 burn 的引用'

## 1. 配置文件

```toml
[package]
name = "create_one_nft_with_an_object"
version = "1.0.0"
authors = []

[addresses]

MyNFT = "0xc70dccea7751cb2e1ba210918eda303249b634761e90b1576f63f44d6b34de6f"

[dev-addresses]

[dependencies.AptosTokenObjects]
git = "https://github.com/aptos-labs/aptos-core.git"
rev = "testnet"
subdir = "aptos-move/framework/aptos-token-objects"

[dev-dependencies]
```

## 2. 创建一个 collection

collection 信息

```move]
const CollectionDescription:vector<u8> = b"collection_description";
const CollectionName:vector<u8> = b"collection_name";
const CollectionURI:vector<u8> = b"collection_uri";
```

常量的首字母必须大写

创建 collection 的函数

```move
// create collection
public entry fun create_collection(creator:&signer){
    let max_supply = 1000;
    let collection_construcor_ref = collection::create_fixed_collection(
        creator,
        string::utf8(CollectionDescription),
        max_supply,
        string::utf8(CollectionName),
        option::some(royalty::create(1,1,address_of(creator))),
        string::utf8(CollectionURI),
    );
}
```

## 3. 创建 mint 函数

token 信息

```move
const TokenDescription:vector<u8> = b"token_description";
const TokenName:vector<u8> = b"token_name";
const TokenURI:vector<u8> = b"token_uri";
```

保存 burn 引用的结构体

```move
struct TokenRefsStore has key{
    burn_ref:token::BurnRef,
}
```

创建 token 的 mint 函数

```move
public entry fun mint (creator:&signer){
    let token_construcor_ref = token::create(
        creator,
        string::utf8(CollectionName),
        string::utf8(TokenDescription),
        string::utf8(TokenName),
        option::some(royalty::create(1,1,address_of(creator))),
        string::utf8(TokenURI)
    );

    let token_signer = object::generate_signer(&token_construcor_ref);

    let burn_ref= token::generate_burn_ref(&token_construcor_ref);
    move_to(
        &token_signer,
        TokenRefsStore{
        burn_ref
    })
}
```

## 4. 创建 burn 函数

burn token 的函数

```move
 public entry fun burn (creator:&signer,object:Object<Token>) acquires TokenRefsStore {
    let TokenRefsStore{burn_ref} = move_from<TokenRefsStore>(object::object_address(&object));
    token::burn(burn_ref);
}
```

> [!CAUTION]
> 问题:
>
> 创建的每一个 token 都是相同的
