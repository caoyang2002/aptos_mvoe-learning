<a name="readme-top"></a>
[TOC]
## Language

- [English](#english)
- [中文](#中文)

- [中文自述文件](Docs/zh/README_zh.md)
- [English Readme](Docs/en/README.md)

### English

// Your English content here


### 中文

中文

---



# 开始

首先从 NFT 的创建展开, 逐步扩展到 aptos move 的语法, 以及特性

## 目录
<details>
<summary>
</summary>

- [创建第一个 NFT](#一创建一个-nft) : 一个简单功能的 NFT mnt 合约, 一次只能创建一个, 并且不能重复创建, 没有错误处理

- [创建一个将 burn 保存在对象里面的 NFT](#二创建一个将-burn-保存在-object-内的-nft): 这是上一个版本的优化版本, 创建了一个 object, 用于存储引用和其他内容

- [创建一个可以更改内容的 NFT](#三创建一个可以更改内容的-NFT): 这是上一个版本的优化版本, 创建了一个 object, 用于存储引用和其他内容

</details>


> [!TIP]
> 这个 NFT 是保存在 `合约账户` 下的


# 参与




# 一、创建一个 NFT

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

- `move_to` 把后者移动给前者，这里是把结构体以及burn_ref，移动到 ceator 的地址，以便用于删除
-  `string::utf8(b"collection_name")`：这里的 `Collection_name` 必须和刚才创建的 collection 名字相同，因为这个 token 会被放入指定的 collection



## 4. 创建 burn函数

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



# 二、创建一个将 burn 保存在 object 内的 NFT

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
>



# 三、创建不同的 NFT

> 实际上相同的只能叫 token, 比如之前的案例

<div align="right">
[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>


>[!IMPORTANT]
>
>之前的 NFT 都是一样的, 目前希望创建的 NFT 是不同的,
>
>这里除了创建 NFT 及基本操作外，还实现了一个序号自增的NFT
>
>使用的图片链接: https://caoyang2002.top/images/gclx/1.png
>
>一共有 10 张图片, 从 1 ~ 10
>
>生成图片的地址: 
>
>https://gclx.xyz/
>https://vue-color-avatar.leoku.dev/

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

max_supply 是自定义,任意数值, 如果uri 中没有, 就无法显示

例如: 之后的 token 生成了数字 11

但是我的 uri 中最大只有 9, 所以它将无法显示

> 无法显示: https://caoyang2002.top/images/gclx/10.png
>
> 可以显示:  https://caoyang2002.top/images/gclx/9.png



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

```    rust
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
> 这里的前缀就是 `https://caoyang2002.top/images/gclx/` , 后缀是 `.png` , `1` 是需要更改的部分 (从1 到 10)
>

为了实现序号的递增, 还需要一个函数

构造 token 的地址,

```move
let url = string::utf8(TokenURI);
let id = token::index<Token>(object::object_from_constructor_ref(&token_constructor_ref));
string::append(&mut url,string_utils::to_string(&id));
string::append(&mut url,string::utf8(b".png"));
```

首先定义基础的token url :  `https://caoyang2002.top/images/gclx/` , 添加序号 

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







# 四、使用 init_moudle 初始化模块

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























# 五、在 NFT 中添加更多的内容

> `#[event]` 给 view 用的,以监控变化

<div align="right">


[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>
    

## init_module

```rust
fun init_module(sender: &signer){
    // create a empty resource account, get signer and cap
    let (resource_signer,resource_cap) = account::create_resource_account(sender,ResourceAccountSeed);
    // move resource to current signer
    move_to(&resource_signer,ResourceCap{cap:resource_cap});
    //create collection return ref
    let collection_ref = collection::create_unlimited_collection(
        &resource_signer,
        string::utf8(CollectionDescription),
        string::utf8(CollectionName),
        option::none(), // fee
        string::utf8(CollectionURI));
    // generate collection signer
    let collection_signer = object::generate_signer(&collection_ref);
    // generate collection mutator ref
    let collection_mut_ref = collection::generate_mutator_ref(&collection_ref);
    // move collection to current signer
    move_to(&collection_signer,CollectionRefStore{mutator_ref:collection_mut_ref});
}
```





## mint

```rust
entry public fun mint(sender: &signer,content: string::String) acquires ResourceCap {
    // borrow
    // not add '&' witbout the copy ability
    let resource_cap = &borrow_global<ResourceCap>(account::create_resource_address(&@MyNFT,ResourceAccountSeed)).cap;
    // create a rexource signer
    let resource_signer = &account::create_signer_with_capability(resource_cap);
    // u8 to utf8
    let url = string::utf8(TokenURL);
    // create token ref
    let token_ref = token::create_numbered_token(
        resource_signer,
        string::utf8(CollectionName),
        string::utf8(CollectionDescription),
        string::utf8(TokenPrefix),
        string::utf8(b""),
        option::none(),
        string::utf8(b"")
    );
    // get id from object constuctor
    let id = token::index<Token>(object::object_from_constructor_ref(&token_ref));
    //
    // mutable reference url, Add integers to url after converting them to characters
    string::append(&mut url,string_utils::to_string(&id));

    //

    // add characters to url
    string::append(&mut url, string::utf8(b".jpg"));
    // gennerate token signer
    let token_signer = object::generate_signer(&token_ref);
    // mutable reference of token
    let token_mut_ref = token::generate_mutator_ref(&token_ref);
    //set utl of token
    token::set_uri(&token_mut_ref,url);
    // gemnerate burnout ref
    let token_burn_ref = token::generate_burn_ref(&token_ref);
    // move token resource ref to token signer
    move_to(
        &token_signer,
        TokenRefStore{
            mutator_ref:token_mut_ref,
            burn_ref:token_burn_ref,
            extend_ref: object::generate_extend_ref(&token_ref),
            transfer_ref:option::none()
        }
    );
    // move content string to token signer
    move_to(&token_signer,Content{content});
    // trigger event
    event::emit(
        MintEvent{
            owner: signer::address_of(sender),
            token_id: object::address_from_constructor_ref(&token_ref),
            content
        }
    );
    // trade ,
    object::transfer(
        resource_signer,
        object::object_from_constructor_ref<Token>(&token_ref),
        signer::address_of(sender)
    )
}
```







## burn

```rust
entry fun burn(
    sender:&signer,
    object: Object<Content>
)acquires TokenRefStore,Content {
    // Obtain whether the user uses ownership
    assert!(object::is_owner(object,signer::address_of(sender)),ERROR_NOWNER);
    // get burn ref
    let TokenRefStore{
        mutator_ref : _,
        burn_ref,
        extend_ref:_,
        transfer_ref:_,
    } = move_from<TokenRefStore>(object::object_address(&object));
    // Take out an TokenRefStore type from the object

    // get content
    let Content{
        content
    } = move_from<Content>(object::object_address(&object));
    event::emit(BurnEvent{
        owner:object::owner(object),
        token_id: object::object_address(&object),
        content
    });
    // burn
    token::burn(burn_ref)
}
```







## set_string





## view

```rust
#[view]
public fun get_content(object:Object<Content>):string::String acquires Content{
    borrow_global<Content>(object::object_address(&object)).content
}
```



## event

```rust
#[event]
struct MintEvent has drop,store {
    owner: address,
    token_id: address,
    content: string::String
}

#[event]
struct BurnEvent has drop,store{
    owner:address,
    token_id: address,
    content: string::String
}
```



## struct

```rust
struct ResourceCap has key{ //not capability
    cap:SignerCapability
}
struct CollectionRefStore has key{ // store collection
    mutator_ref: collection::MutatorRef,
}
struct TokenRefStore has key{
    mutator_ref: token::MutatorRef,
    burn_ref: token::BurnRef,
    extend_ref: object::ExtendRef,
    transfer_ref:option::Option<object::TransferRef>
}
struct Content has key{
    content: string::String
}
```



## const

```rust
const TokenURL:vector<u8> = b"https://www.caoyang2002.top/usr/uploads/2023/08/4079902677";
// const TokenPrefix:vector<u8> = b"";
const ERROR_NOWNER:u64 = 1;
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
```







---

# X-基础

[NFT 需要存在 Collection 中。](https://aptos.dev/standards/digital-asset#collection-creation)

```move
use aptos_token_objects::collection;  
  
public entry fun create_collection(creator: &signer) {  
  let max_supply = 1000;  // 设置最大供应量
  collection::create_fixed_collection(  
  creator,  
  "My Collection Description",  
  max_supply,  
  "My Collection",  
  royalty,  
  "https://mycollection.com",  
  );  
}
```

案例解析

```move
use aptos_token_objects::collection;  
const CollectionDescription:vector<u8> = b"collection_description";
const collectionName:vector<u8> = b"collection_name";
const collectionURI:vector<u8> = b"collection_uri";

  
public entry fun create_collection(creator: &signer) {  
  let max_supply = 1000;  // 设置最大供应量
  collection::create_fixed_collection(  
  creator,  
  string::utf8(CollectionDescription), // 集合描述，小于 2048 个字符，使用 MutatorRef 修改
  max_supply, // 最大供应量
  string::utf8(CollectionName), // Name：唯一的名称，同一个账户中不能重复创建
  option::some(royalty::create(5,100,signer::address_of(creator))),// or option::none()   计算方法： 版税 (分子，分母，接收人)
  string::utf8(CollectionURI), // uri：小于 512 个字符，使用 MutatorRef 修改
  );  
}
```

> [!CAUTION]
> 问题:
>
> 不能



---
> [!NOTE]
> GitHub 的md笔记。

> [!TIP]
> 提供更好或更容易做事的有益建议。

> [!IMPORTANT]
> 用户为了实现目标所需的关键信息。

> [!WARNING]
> 紧急信息，需要用户立即注意以避免问题。

> [!CAUTION]
> 关于某些操作的风险或负面结果的建议。
