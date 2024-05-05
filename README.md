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

- [image](/Docs/images)

</details>


> [!TIP]
> 这个 NFT 是保存在 `合约账户` 下的


# 参与




# 一、创建一个 NFT

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

```move
const CollectionDescription:vector<u8> = b"collection_description";
const CollectionName:vector<u8> = b"collection_name";
const CollectionURI:vector<u8> = b"collection_uri";
```

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
> 







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
