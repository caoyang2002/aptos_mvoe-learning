```yaml
original: 'https://aptos.dev/tutorials/build-e2e-dapp'
github: 'https://github.com/aptos-labs/aptos-core/tree/main/aptos-move/move-examples/my_first_dapp'
```

这是一个 todo list 项目

# 运行

```bash
npm start -port 8080
```

# 开始

## 创建 Move 项目

```bash
mkdir simple_react
cd simple_react
mkdir move
```

## 初始化项目结构

```bash
aptos move init --name todo_list
aptos init --network testnet
```

## 配置项目

move/Move.toml

```toml
[addresses]
todolist_addr = "账户地址"
```

账户地址在 `.aptos/config.yaml` 的 account 中

## 创建合约

### 创建文件

```bash
cd sources
touch todo_list.move
```

### 创建模块

```move
module todolist_addr::todolist {

}
```

> [!TIP]
> 一个 Move 模块存储在某个地址下（所以一旦发布，任何人都可以使用那个地址来访问它）；Move 模块的语法是：
>
> ```move
> module <account-address>::<module-name> {
> }
> ```
>
> 在我们的模块中，`account-address` 是 `todolist_addr`（我们在前一步在 `Move.toml` 文件中声明的一个持有地址的变量），而 `module-name` 是 `todolist`（我们自定义的一个名称）。

```move
module todolist_addr::todolist {
	struct TodoList has key {
		tasks: Table<u64, Task>,
		set_task_event: event::EventHandle<Task>,
		task_counter: u64
	}

	struct Task has store, drop, copy {
		task_id: u64,
		address:address,
		content: String,
		completed: bool,
	}
}
```

> **TodoList**
> 一个具有 `key` 和 `store` 能力的 struct：
>
> `key` 能力允许 struct 用作存储标识符。换句话说，`key` 是一种能够被存储在顶层并作为存储的能力。我们在这里需要它，以便让 `TodoList` 成为我们用户账户中存储的资源。
> 当一个 struct 具有 `key` 功能时，它将这个 struct 变成一个 `resource` ：`resource` 存储在该账户下 -- 因此它仅在分配给账户时存在，并且只能通过此账户访问
>
> **Task**
>
> 一个具有 `store` 、`copy` 和 `drop` 能力的 struct。
>
> - `store` - Task 需要 `store` 能力，因为它被存储在另一个 struct（TodoList）内部。
> - `copy` - 值可以被复制（或者通过值来克隆）。
> - `drop` - 值可以在作用域结束时被丢弃。

[查看原文](https://aptos.dev/tutorials/build-e2e-dapp/create-a-smart-contract/#our-contract-logic)

现在我们可以编译它，以查看是否有错误（边写边次测是一个写代码的好习惯）

```bash
cd move # 进入到 move 文件夹，这是一个示例，因为我不确定你现在所处的位置，你可以通过 `pwd` 查看你当前的位置
aptos move compile
```

> [!NOTE]
> 第一次运行的时候会花费比较长的时间，因为需要从 Github 下载 aptos-framework
> 成功的结果看起来是这样的
>
> ```bash
> Compiling, may take a little while to download git dependencies...
> UPDATING GIT DEPENDENCY https://github.com/aptos-labs/aptos-core.git
> INCLUDING DEPENDENCY AptosFramework
> INCLUDING DEPENDENCY AptosStdlib
> INCLUDING DEPENDENCY MoveStdlib
> BUILDING todo-list
> {
> 	"Result": [
> 		"976d41c72f1dd5ebbc7c1e5e02576a0dcf5e25c2c4405078184c744a66af8349::todolist"
> 	]
> }
> ```

### 添加类型

在这个模块内的顶部，编写如下代码：

```bash
use aptos_framework::event;
use std::string::String;
use aptos_std::table::Table;
```

### 创建 `create_list` 函数

```move
public entry fun create_list(account: &signer){

}
```

让我们来理解这个函数的组成部分：

`entry` - 入口函数是可以通过交易调用的函数。简单来说，每当你想要向链上提交交易时，你应该调用一个入口函数。

`&signer` - signer 参数是由 Move 虚拟机注入的，表示签署该交易的地址。

我们的代码中有一个 `TodoList` 资源。该资源存储在账户下；因此，它只有在分配给账户时才存在，并且只能通过这个账户访问。

这意味着要创建 `TodoList` 资源，我们需要将其分配给一个账户，只有这个账户才能访问。

create_list 函数可以处理那个 TodoList 资源的创建。

#### 补充完整

```move
public entry fun create_list(account: &signer){
  let tasks_holder = TodoList {
    tasks: table::new(),
    set_task_event: account::new_event_handle<Task>(account),
    task_counter: 0
  };
  // move the TodoList resource under the signer account
  move_to(account, tasks_holder);
}
```

这个函数接收一个签名者（signer），创建一个新的 `TodoList` 资源，并使用 `move_to` 将该资源存储在提供的签名者账户中。

## 创建 `create_task` 函数

```move
public entry fun create_task(account: &signer, content: String) acquires TodoList {
    // gets the signer address
    let signer_address = signer::address_of(account);
    // gets the TodoList resource
    let todo_list = borrow_global_mut<TodoList>(signer_address);
    // increment task counter
    let counter = todo_list.task_counter + 1;
    // creates a new Task
    let new_task = Task {
      task_id: counter,
      address: signer_address,
      content,
      completed: false
    };
    // adds the new task into the tasks table
    table::upsert(&mut todo_list.tasks, counter, new_task);
    // sets the task counter to be the incremented counter
    todo_list.task_counter = counter;
    // fires a new task created event
    event::emit_event<Task>(
      &mut borrow_global_mut<TodoList>(signer_address).set_task_event,
      new_task,
    );
}
```

### 引入库

```move
use std::signer;
use aptos_std::table::{Self, Table}; // This one we already have, need to modify it
```

回到代码，这里发生了什么？

首先，我们要获取签名者的地址，这样我们就可以获得这个账户的 `TodoList` 资源。

然后，我们使用签名者地址检索 `TodoList` 资源；有了它，我们就可以访问 `TodoList` 的属性。
现在我们可以增加 `task_counter` 属性的值，并使用签名者地址、计数器和提供的内容创建一个新的任务（`Task`）。
我们将它推入到 `todo_list.tasks` 表中，该表存储了我们所有的任务以及新的计数器（作为表的键）和新创建的任务。
然后我们将全局的 `task_counter` 设为新增加的计数器值。

最后，我们发出一个 `task_created` 事件，该事件包含新任务的数据。emit_event 是 `aptos-framework` 函数，它接受一个事件句柄的引用和一个消息。在我们的例子中，我们向函数传递了一个引用（使用 `sign &`）到账户的 `TodoList` 资源的 `set_task_event` 属性作为第一个参数，以及第二个消息参数，即我们刚刚创建的新任务。记住，我们的 `TodoList` 结构体中有一个 `set_task_event` 属性。

## 添加 `complete_task` 函数

```move
public entry fun complete_task(account: &signer, task_id: u64) acquires TodoList {
  // gets the signer address
  let signer_address = signer::address_of(account);
  // gets the TodoList resource
  let todo_list = borrow_global_mut<TodoList>(signer_address);
  // gets the task matches the task_id
  let task_record = table::borrow_mut(&mut todo_list.tasks, task_id);
  // update task as completed
  task_record.completed = true;
}
```

让我们来理解这段代码。

和我们之前的创建列表函数一样，我们通过签名者地址检索 `TodoList` 结构体，这样我们就可以获得存储所有账户任务的任务表（tasks table）。
然后，我们在 `todo_list.tasks` 表上查找提供的任务 ID（task_id）对应的任务。
最后，我们将那个任务的 `completed` 属性更新为 `true`。

### 编译代码

```bash
aptos move compile
```

你一定会遇到一个错误

```bash
Compiling, may take a little while to download git dependencies...
UPDATING GIT DEPENDENCY https://github.com/aptos-labs/aptos-core.git
INCLUDING DEPENDENCY AptosFramework
INCLUDING DEPENDENCY AptosStdlib
INCLUDING DEPENDENCY MoveStdlib
BUILDING todo-list
error[E03002]: unbound module
   ┌─ /Users/caoyang/Desktop/GitHub/aptos_mvoe-learning/Dapp/todo_list/move/sources/todolist.move:23:20
   │
23 │             set_task_event: account::new_event_handle<Task>(account),
   │                             ^^^^^^^ Unbound module alias 'account'

{
  "Error": "Move compilation failed: Compilation error"
}
```

这是错误是因为没有引入 `account` 模块，我们只需要在 `todo_list.move` 文件中引入 `account` 模块即可解决

```move
use aptos_framework::account;
```

### 验证检查

为了让这个函数更安全，我们添加一个检查的步骤，以确保签名者账户有一个列表：

```move
public entry fun create_task(account: &signer, content: String) acquires TodoList {
  // 获取签名者地址
  let signer_address = signer::address_of(account);

  // 断言签名者已创建列表
  assert!(exists<TodoList>(signer_address), 1);

  ...
}
```

确保：

- 签名者已创建列表。
- 任务存在。
- 任务未完成。

```move
public entry fun complete_task(account: &signer, task_id: u64) acquires TodoList {
  // gets the signer address
  let signer_address = signer::address_of(account);
  // assert signer has created a list
  assert!(exists<TodoList>(signer_address), 1);
  // gets the TodoList resource
  let todo_list = borrow_global_mut<TodoList>(signer_address);
  // assert task exists
  assert!(table::contains(&todo_list.tasks, task_id), 2);
  // gets the task matched the task_id
  let task_record = table::borrow_mut(&mut todo_list.tasks, task_id);
  // assert task is not completed
  assert!(task_record.completed == false, 3);
  // update task as completed
  task_record.completed = true;
}
```

---

## 创建 React 项目

```bash
npx create-react-app client --template typescript
```

这里创建了一个名为 client 的 React 项目。

# 配置

```bash
npm install --save-dev @babel/preset-react
```

# 运行

```bash
npm start
```

---

# 完整代码

## 合约部分

- Move

```rust title="todo_list/move/source/todolist.move"
module todolist_addr::todolist {

    use aptos_framework::account;
    use std::signer;
    use aptos_framework::event;
    use std::string::String;
    use aptos_std::table::{Self, Table};
    #[test_only]
    use std::string;

    // Errors
    const E_NOT_INITIALIZED: u64 = 1;
    const ETASK_DOESNT_EXIST: u64 = 2;
    const ETASK_IS_COMPLETED: u64 = 3;

    struct TodoList has key {
        tasks: Table<u64, Task>,
        task_counter: u64
    }

    #[event]
    struct Task has store, drop, copy {
        task_id: u64,
        address: address,
        content: String,
        completed: bool,
    }

    public entry fun create_list(account: &signer) {
        let todo_list = TodoList {
            tasks: table::new(),
            task_counter: 0
        };
        // move the TodoList resource under the signer account
        move_to(account, todo_list);
    }

    public entry fun create_task(account: &signer, content: String) acquires TodoList {
        // gets the signer address
        let signer_address = signer::address_of(account);
        // assert signer has created a list
        assert!(exists<TodoList>(signer_address), E_NOT_INITIALIZED);
        // gets the TodoList resource
        let todo_list = borrow_global_mut<TodoList>(signer_address);
        // increment task counter
        let counter = todo_list.task_counter + 1;
        // creates a new Task
        let new_task = Task {
            task_id: counter,
            address: signer_address,
            content,
            completed: false
        };
        // adds the new task into the tasks table
        table::upsert(&mut todo_list.tasks, counter, new_task);
        // sets the task counter to be the incremented counter
        todo_list.task_counter = counter;
        // fires a new task created event
        event::emit(new_task);
    }

    public entry fun complete_task(account: &signer, task_id: u64) acquires TodoList {
        // gets the signer address
        let signer_address = signer::address_of(account);
        // assert signer has created a list
        assert!(exists<TodoList>(signer_address), E_NOT_INITIALIZED);
        // gets the TodoList resource
        let todo_list = borrow_global_mut<TodoList>(signer_address);
        // assert task exists
        assert!(table::contains(&todo_list.tasks, task_id), ETASK_DOESNT_EXIST);
        // gets the task matched the task_id
        let task_record = table::borrow_mut(&mut todo_list.tasks, task_id);
        // assert task is not completed
        assert!(task_record.completed == false, ETASK_IS_COMPLETED);
        // update task as completed
        task_record.completed = true;
    }

    #[test(admin = @0x123)]
    public entry fun test_flow(admin: signer) acquires TodoList {
        // creates an admin @todolist_addr account for test
        account::create_account_for_test(signer::address_of(&admin));
        // initialize contract with admin account
        create_list(&admin);

        // creates a task by the admin account
        create_task(&admin, string::utf8(b"New Task"));
        let todo_list = borrow_global<TodoList>(signer::address_of(&admin));
        assert!(todo_list.task_counter == 1, 5);
        let task_record = table::borrow(&todo_list.tasks, todo_list.task_counter);
        assert!(task_record.task_id == 1, 6);
        assert!(task_record.completed == false, 7);
        assert!(task_record.content == string::utf8(b"New Task"), 8);
        assert!(task_record.address == signer::address_of(&admin), 9);

        // updates task as completed
        complete_task(&admin, 1);
        let todo_list = borrow_global<TodoList>(signer::address_of(&admin));
        let task_record = table::borrow(&todo_list.tasks, 1);
        assert!(task_record.task_id == 1, 10);
        assert!(task_record.completed == true, 11);
        assert!(task_record.content == string::utf8(b"New Task"), 12);
        assert!(task_record.address == signer::address_of(&admin), 13);
    }

    #[test(admin = @0x123)]
    #[expected_failure(abort_code = E_NOT_INITIALIZED)]
    public entry fun account_can_not_update_task(admin: signer) acquires TodoList {
        // creates an admin @todolist_addr account for test
        account::create_account_for_test(signer::address_of(&admin));
        // account can not toggle task as no list was created
        complete_task(&admin, 2);
    }
}
```

## 前端部分

- app 配置

```ts title="todo_list/client/src/App.tsx"
import { WalletSelector } from '@aptos-labs/wallet-adapter-ant-design'
import { Layout, Row, Col, Button, Spin, List, Checkbox, Input } from 'antd'

import React, { useEffect, useState } from 'react'
import {
  useWallet,
  InputTransactionData,
} from '@aptos-labs/wallet-adapter-react'

import '@aptos-labs/wallet-adapter-ant-design/dist/index.css'
import { CheckboxChangeEvent } from 'antd/es/checkbox'
import { Aptos } from '@aptos-labs/ts-sdk'

type Task = {
  address: string
  completed: boolean
  content: string
  task_id: string
}

export const aptos = new Aptos()
// change this to be your module account address
export const moduleAddress =
  '0xffdd4464e5debe9249822d821b3c796c0e9bd02aa44bd99cb91e57b0671370d6'

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState<string>('')
  const { account, signAndSubmitTransaction } = useWallet()
  const [accountHasList, setAccountHasList] = useState<boolean>(false)
  const [transactionInProgress, setTransactionInProgress] =
    useState<boolean>(false)

  const onWriteTask = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setNewTask(value)
  }

  const fetchList = async () => {
    if (!account) return []
    try {
      const todoListResource = await aptos.getAccountResource({
        accountAddress: account?.address,
        resourceType: `${moduleAddress}::todolist::TodoList`,
      })
      setAccountHasList(true)
      // tasks table handle
      const tableHandle = (todoListResource as any).data.tasks.handle
      // tasks table counter
      const taskCounter = (todoListResource as any).data.task_counter

      let tasks = []
      let counter = 1
      while (counter <= taskCounter) {
        const tableItem = {
          key_type: 'u64',
          value_type: `${moduleAddress}::todolist::Task`,
          key: `${counter}`,
        }
        const task = await aptos.getTableItem<Task>({
          handle: tableHandle,
          data: tableItem,
        })
        tasks.push(task)
        counter++
      }
      // set tasks in local state
      setTasks(tasks)
    } catch (e: any) {
      setAccountHasList(false)
    }
  }

  const addNewList = async () => {
    if (!account) return []
    setTransactionInProgress(true)

    const transaction: InputTransactionData = {
      data: {
        function: `${moduleAddress}::todolist::create_list`,
        functionArguments: [],
      },
    }
    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction(transaction)
      // wait for transaction
      await aptos.waitForTransaction({ transactionHash: response.hash })
      setAccountHasList(true)
    } catch (error: any) {
      setAccountHasList(false)
    } finally {
      setTransactionInProgress(false)
    }
  }

  const onTaskAdded = async () => {
    // check for connected account
    if (!account) return
    setTransactionInProgress(true)

    const transaction: InputTransactionData = {
      data: {
        function: `${moduleAddress}::todolist::create_task`,
        functionArguments: [newTask],
      },
    }

    // hold the latest task.task_id from our local state
    const latestId =
      tasks.length > 0 ? parseInt(tasks[tasks.length - 1].task_id) + 1 : 1

    // build a newTaskToPush objct into our local state
    const newTaskToPush = {
      address: account.address,
      completed: false,
      content: newTask,
      task_id: latestId + '',
    }

    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction(transaction)
      // wait for transaction
      await aptos.waitForTransaction({ transactionHash: response.hash })

      // Create a new array based on current state:
      let newTasks = [...tasks]

      // Add item to the tasks array
      newTasks.push(newTaskToPush)
      // Set state
      setTasks(newTasks)
      // clear input text
      setNewTask('')
    } catch (error: any) {
      console.log('error', error)
    } finally {
      setTransactionInProgress(false)
    }
  }

  const onCheckboxChange = async (
    event: CheckboxChangeEvent,
    taskId: string
  ) => {
    if (!account) return
    if (!event.target.checked) return
    setTransactionInProgress(true)

    const transaction: InputTransactionData = {
      data: {
        function: `${moduleAddress}::todolist::complete_task`,
        functionArguments: [taskId],
      },
    }

    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction(transaction)
      // wait for transaction
      await aptos.waitForTransaction({ transactionHash: response.hash })

      setTasks((prevState) => {
        const newState = prevState.map((obj) => {
          // if task_id equals the checked taskId, update completed property
          if (obj.task_id === taskId) {
            return { ...obj, completed: true }
          }

          // otherwise return object as is
          return obj
        })

        return newState
      })
    } catch (error: any) {
      console.log('error', error)
    } finally {
      setTransactionInProgress(false)
    }
  }

  useEffect(() => {
    fetchList()
  }, [account?.address])

  return (
    <>
      <Layout>
        <Row align="middle">
          <Col span={10} offset={2}>
            <h1>Our todolist</h1>
          </Col>
          <Col span={12} style={{ textAlign: 'right', paddingRight: '200px' }}>
            <WalletSelector />
          </Col>
        </Row>
      </Layout>
      <Spin spinning={transactionInProgress}>
        {!accountHasList ? (
          <Row gutter={[0, 32]} style={{ marginTop: '2rem' }}>
            <Col span={8} offset={8}>
              <Button
                disabled={!account}
                block
                onClick={addNewList}
                type="primary"
                style={{ height: '40px', backgroundColor: '#3f67ff' }}
              >
                Add new list
              </Button>
            </Col>
          </Row>
        ) : (
          <Row gutter={[0, 32]} style={{ marginTop: '2rem' }}>
            <Col span={8} offset={8}>
              <Input.Group compact>
                <Input
                  onChange={(event) => onWriteTask(event)}
                  style={{ width: 'calc(100% - 60px)' }}
                  placeholder="Add a Task"
                  size="large"
                  value={newTask}
                />
                <Button
                  onClick={onTaskAdded}
                  type="primary"
                  style={{ height: '40px', backgroundColor: '#3f67ff' }}
                >
                  Add
                </Button>
              </Input.Group>
            </Col>
            <Col span={8} offset={8}>
              {tasks && (
                <List
                  size="small"
                  bordered
                  dataSource={tasks}
                  renderItem={(task: Task) => (
                    <List.Item
                      actions={[
                        <div>
                          {task.completed ? (
                            <Checkbox defaultChecked={true} disabled />
                          ) : (
                            <Checkbox
                              onChange={(event) =>
                                onCheckboxChange(event, task.task_id)
                              }
                            />
                          )}
                        </div>,
                      ]}
                    >
                      <List.Item.Meta
                        title={task.content}
                        description={
                          <a
                            href={`https://explorer.aptoslabs.com/account/${task.address}/`}
                            target="_blank"
                          >{`${task.address.slice(0, 6)}...${task.address.slice(
                            -5
                          )}`}</a>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Col>
          </Row>
        )}
      </Spin>
    </>
  )
}

export default App
```

- index 配置

```ts title="todo_list/client/src/index.tsx"
import { PetraWallet } from 'petra-plugin-wallet-adapter'
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import reportWebVitals from './reportWebVitals'

const wallets = [new PetraWallet()]

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
      <App />
    </AptosWalletAdapterProvider>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
```
