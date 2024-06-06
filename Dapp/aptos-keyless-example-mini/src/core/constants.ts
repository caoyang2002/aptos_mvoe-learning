// Copyright © Aptos
// SPDX-License-Identifier: Apache-2.0

// require('dotenv').config();
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
// require('dotenv').config();
// 存储无钥匙账户
export const LocalStorageKeys = {
  keylessAccounts: "@aptos-connect/keyless-accounts",
};
// 创建一个新的 Aptos 客户端实例，配置为连接到 Aptos 的开发网络 
export const devnetClient = new Aptos(
  new AptosConfig({ network: Network.DEVNET })
);

/// FIXME: 在此处填写您的客户端 ID
// 用于 Google OAuth 认证流程的 Google 客户端ID
// export const GOOGLE_CLIENT_ID = "40609952844-qe39u8kf3jeprrm21r0nahqce5bn5g90.apps.googleusercontent.com";
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

console.log("google client id: ", GOOGLE_CLIENT_ID);