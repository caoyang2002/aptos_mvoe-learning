<a name="readme-top"></a>

# Aptos_move-Learning

**简体中文** | [English](/Docs/en/README.md) | [CHANGELOG](/Docs/CHANGELOG.md)

# 创建不同的 NFT

> 实际上相同的只能叫 token, 比如之前的案例

<div align="right">
[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>

> [!IMPORTANT]
>
> 之前的 NFT 都是一样的, 目前希望创建的 NFT 是不同的,
>
> 这里除了创建 NFT 及基本操作外，还实现了一个序号自增的 NFT
>
> 使用的图片链接: https://caoyang2002.top/images/gclx/1.png
>
> 一共有 10 张图片, 从 1 ~ 10
>
> 生成图片的地址:
>
> https://gclx.xyz/ >https://vue-color-avatar.leoku.dev/

## 1. 配置文件

```toml
[package]
name = "create_different_NFT"
version = "1.0.0"
authors = []

[addresses]

MyNFT = "0xcea377b6331c5a4a3e36ee7decacfd526e682874f7777ab41e3199c3ecfe55a7"

[dev-addresses]

[dependencies.AptosFramework]
git = "https://github.com/aptos-labs/aptos-core.git"
rev = "mainnet"
subdir = "aptos-move/framework/aptos-framework"

[dev-dependencies]

```

## 2. 创建 collection

```move
// collection information
const CollectionDescription:vector<u8> = b"collection_description";
const CollectionName:vector<u8> = b"collection_new_name";
const CollectionURI:vector<u8> = b"https://caoyang2002.top/images/gclx/bird.png";
```

```move
public entry fun create_collection(creator:&signer){
    let max_supply = 12;
    let collection_constructor_ref = collection::create_fixed_collection(
        creator,
        string::utf8(CollectionDescription),
        max_supply,
        string::utf8(CollectionName),
        option::none(),
        string::utf8(CollectionURI)
    );
}
```

max_supply 是自定义,任意数值, 如果 uri 中没有, 就无法显示

例如: 之后的 token 生成了数字 11

但是我的 uri 中最大只有 9, 所以它将无法显示

> 无法显示: https://caoyang2002.top/images/gclx/10.png
>
> 可以显示: https://caoyang2002.top/images/gclx/9.png

## 3. 创建 NFT

token 信息

```move
// token information
const TokenDescription:vector<u8> = b"token_description";
const TokenPrefix:vector<u8> = b"prefix_name";
const TokenSuffix:vector<u8> = b"suffix_name";
const TokenURI:vector<u8> = b"https://caoyang2002.top/images/gclx/";

struct TokenRefsStore has key{
    burn_ref:token::BurnRef
}
```

mint

```rust
public entry fun mint(creator:&signer){
    let token_constructor_ref = token::create_numbered_token(
        creator,
        string::utf8(CollectionName),
        string::utf8(TokenDescription),
        string::utf8(TokenPrefix),
        string::utf8(TokenSuffix),
        option::some(royalty::create(1,1,address_of(creator))),
        string::utf8(b""),
    );
    // set url
    let url = string::utf8(TokenURI);
    let id = token::index<Token>(object::object_from_constructor_ref(&token_constructor_ref));
    string::append(&mut url,string_utils::to_string(&id));
    string::append(&mut url,string::utf8(b".png"));
    let token_mutator_ref = token::generate_mutator_ref(&token_constructor_ref);
    token::set_uri(&token_mutator_ref, url);

    // burn url
    let token_signer = object::generate_signer(&token_constructor_ref);
    let burn_ref = token::generate_burn_ref(&token_constructor_ref);
    move_to(
        &token_signer,
        TokenRefsStore{
            burn_ref,
        }
    )
}
```

使用 `create_numbered_token()` 创建

> 创建一个新的 token 对象，具有唯一的地址，并返回构造函数引用以进行进一步的特化。
>
> 名称是通过连接（name_prefix，index，name_suffix）创建的。
>
> 在启用并发资产标志（flag concurrent_assets_enabled）之后，此函数将允许并行创建来自同一 collection 的 token，同时提供有序号的名称。

参数

- collection name: collection 名称
- description: collection 描述
- name_with_index_prefix: 前缀
- name_with_index_suffix: 后缀
- royalty: 版税
- token_uri: token 的网络地址

```move
let token_constructor_ref = token::create_numbered_token(
    creator,
    string::utf8(CollectionName),
    string::utf8(TokenDescription),
    string::utf8(TokenPrefix),
    string::utf8(b""),
    option::some(royalty::create(1,1,address_of(creator))),
    string::utf8(b""),
);
```

这里重要的是更改 `url` , 其中前缀和后缀只是 `NFT` 的信息, 可以标识出 `NFT` 的序号

> 以 https://caoyang2002.top/images/gclx/1.png 为例
>
> 这里的前缀就是 `https://caoyang2002.top/images/gclx/` , 后缀是 `.png` , `1` 是需要更改的部分 (从 1 到 10)

为了实现序号的递增, 还需要一个函数

构造 token 的地址,

```move
let url = string::utf8(TokenURI);
let id = token::index<Token>(object::object_from_constructor_ref(&token_constructor_ref));
string::append(&mut url,string_utils::to_string(&id));
string::append(&mut url,string::utf8(b".png"));
```

首先定义基础的 token url : `https://caoyang2002.top/images/gclx/` , 添加序号

`token::index()` 会去获取 `token` 的 index, 这个 index 通过 ` token::create_numbered_token()` 定义的,

> ```move
> features::aggregator_v2_api_enabled();
> ```
>
> 这个函数不是很明白, 但是他在我测试的时候确实是返回了 true

在` token::create_numbered_token()` 中调用了 `create_common()` 函数, 它让 collection 没有值的时候,初始化为 0 , 有值的时候自动递增

## 4. 烧毁

```MOVE
public entry fun burn(create:&signer, object:Object<Token>) acquires TokenRefsStore {
    let TokenRefsStore{
        burn_ref
    } = move_from<TokenRefsStore>(object::object_address(&object));
    token::burn(burn_ref);
}
```
