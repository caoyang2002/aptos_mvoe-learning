<a name="readme-top"></a>

# Aptos_move-Learning

**简体中文** | [English](Docs/en/README.md) | [CHANGELOG](Docs/CHANGELOG.md)

仅仅是输出 `hello world` 字符串，就像绝大多数的编程语言入门一样。

```move
module 0x42::hello {
    #[test_only] 
    use std::string;
    #[test_only]
    use std::debug::print;

    #[test]
    fun test() {
        let hello = string::utf8(b"hello_world");
        print(&hello);
    }
}
```

使用 `let` 关键字定义一个变量 "hello"

调用 `string` 模块中的 `utf8()` 方法，

使用 `b` 以二进制读取 "hello_world" 字符串

`print()` 打印 hello 变量，需要传入的类型是 `&T` 否则会报 `Incompatible type 'String', expected '&T'`

> `#[tset_only]` 表示只在测试的时候使用
> `use std::string` 表示使用标准库下的字符串模块

<div align="right">

[![](https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square)](#readme-top)

</div>
