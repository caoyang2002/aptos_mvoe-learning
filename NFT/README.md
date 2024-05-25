<a name="readme-top"></a>

# Aptos_move-Learning

**简体中文** | [English](Docs/en/README.md) | [CHANGELOG](Docs/CHANGELOG.md)

[TOC]

目录

<details>

<summary><kbd>NFT</kbd></summary>

- [创建第一个 NFT](./create_one_nft/): 一个简单功能的 NFT mnt 合约, 一次只能创建一个, 并且不能重复创建, 没有错误处理

- [创建一个将 burn 保存在对象里面的 NFT](./create_one_nft_with_an_object/): 这是上一个版本的优化版本, 创建了一个 object, 用于存储引用和其他内容

- [创建不同的 NFT](./create_different_NFT/): 这是上一个版本的优化版本, 创建了一个 object, 用于存储引用和设置不同的 NFT 视图

- [使用 init_module 初始化模块](./create_nft_with_init_moudle_function/): 使用了 init_module, 以去掉 mint NFT 是的多余且容易误解的操作

- [创建 NFT 时主动设置 NFT 的内容](./update_nft_content_string/): 可以在创建 NFT 时设置 NFT 的内容,

</details>



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

---

> [!NOTE]
> GitHub 的 md 笔记。

> [!TIP]
> 提供更好或更容易做事的有益建议。

> [!IMPORTANT]
> 用户为了实现目标所需的关键信息。

> [!WARNING]
> 紧急信息，需要用户立即注意以避免问题。

> [!CAUTION]
> 关于某些操作的风险或负面结果的建议。
