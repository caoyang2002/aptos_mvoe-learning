# Aptos 无钥匙示例

此模板提供了一个最小的设置，以便在 Vite 中使用一些 ESLint 规则来启用无钥匙功能。

## 配置 Google

以下是获取 Google OAuth 凭据的逐步说明：

1. 转到 [Google Cloud 控制台](https://console.cloud.google.com/welcome) 并登录到您的账户。
2. 登录后，点击页面顶部导航栏中的项目下拉菜单，选择或创建您要用于 OAuth 凭据的项目。
3. 点击页面顶部的搜索栏，搜索 **"OAuth 同意屏幕"**。
4. 如果您之前没有完成过 **"配置同意屏幕"** 指令，请完成它。
5. 在左侧，点击 **"凭据"**。在屏幕顶部点击 **"创建凭据"** 下拉菜单，并选择 **"OAuth 客户端 ID"**。
6. 选择 **"Web 应用程序"** 应用类型。
7. 为您的 OAuth 客户端 ID 输入一个名称，例如 **"本地开发"**。
8. 在 **"授权 JavaScript 起源"** 字段中，输入您的 Web 应用程序的起源：`http://localhost:5173`
9. 在 **"授权重定向 URIs"** 字段中，输入 Google 应该在用户授权您的应用程序后重定向用户到的 URI。这应该是：`http://localhost:5173/callback`。
10. 点击 **"创建"** 按钮来创建您的 OAuth 客户端 ID。
11. 创建 OAuth 客户端 ID 后，您应该在 **"凭据"** 页面上看到 **"客户端 ID"** 和 **"客户端密钥"**。复制 **"客户端 ID"** 并粘贴到 `src/core/constants.ts` 中。

就是这样！您现在应该能够在应用程序中使用 Google 进行身份验证。

如果您需要更多关于配置 Google OAuth 应用程序的帮助，请查看他们的文档 [这里](https://support.google.com/cloud/answer/6158849)。

## 使用方法

确保您已将上述的 Google 客户端 ID 复制到 `src/core/constants.ts` 文件中

```bash
bun i
bun dev
```

这将启动一个位于 `http://localhost:5173` 的开发服务器。

---

# Aptos Keyless Example

This template provides a minimal setup to get Keyless working on Vite with some ESLint rules.

## Configuring Google

Here are the step-by-step instructions for obtaining OAuth credentials for Google:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/welcome) and sign in to your account.
2. Once you’re signed in, click on the project dropdown menu in the top navigation bar and select or create the project you want to use for your OAuth credentials.
3. Click the search bar at the top of the page and search for **"OAuth consent screen"**.
4. Complete the **"Configure Consent Screen"** instructions if you haven’t completed this before.
5. On the left, click **"Credentials"**. Towards the top of the screen click the **"Create Credentials"** dropdown and select **"OAuth client ID"**.
6. Select the **"Web application"** application type.
7. Enter a name for your OAuth client ID, such as **"Local Development"**.
8. In the **"Authorized JavaScript origins"** field, enter the origin of your web application: `http://localhost:5173`
9. In the **"Authorized redirect URIs"** field, enter the URI that Google should redirect users to after they authorize your application. This should be: `http://localhost:5173/callback`.
10. Click the **"Create"** button to create your OAuth client ID.
11. After creating your OAuth client ID, you should see a **"Client ID"** and **"Client Secret"** on the **"Credentials"** page. Copy the **"Client ID"** and paste it into `src/core/constants.ts`

That's it! You should now be able to authenticate with Google in your application.

If you need more help with configuring the Google OAuth App check their docs [here](https://support.google.com/cloud/answer/6158849).

## Usage

Ensure you have copied your google client id above into the `src/core/constants.ts` file

```bash
bun i
bun dev
```

This will start a development server at `http://localhost:5173`.
