// Copyright © Aptos
// SPDX-License-Identifier: Apache-2.0

import { KeylessAccount } from "@aptos-labs/ts-sdk";
import { isValidEphemeralKeyPair } from "./ephemeral";
import { decodeIdToken, isValidIdToken } from "./idToken";

/**
 * Encoding for the KeylessAccount class to be stored in localStorage
 */
// KeylessAccount类的编码规则，用于存储在localStorage中
export const KeylessAccountEncoding = {
  // 解码方法：将存储的数据转换回KeylessAccount实例
  decode: (e: any) => KeylessAccount.fromBytes(e.data),
  // If the account has a proof, it can be persisted, otherwise,
  // it should not be stored.
  // 编码方法：如果账户有proof，则可以持久化存储；否则，不应存储
  encode: (e: KeylessAccount) =>
    e.proof
      ? {
          __type: "KeylessAccount",
          // 将KeylessAccount实例转换为字节序列
          data: e.bcsToBytes(),
        }
      : undefined,
};

/**
 * If the account has an invalid Ephemeral key pair or idToken, the account needs toe be refreshed with either
 * a new nonce or idToken. If the account is valid, it is returned.
 *
 * @param account - The account to validate.
 * @returns The account if it is valid, otherwise undefined.
 */
// 如果账户的临时密钥对或idToken无效，则需要使用新的nonce或idToken刷新账户。如果账户有效，则返回该账户。
// account - 要验证的账户
// 如果账户有效则返回账户，否则返回undefined
export const validateKeylessAccount = (
  account: KeylessAccount
): KeylessAccount | undefined =>
  // Check the Ephemeral key pair expiration
  // // 检查临时密钥对是否过期
  isValidEphemeralKeyPair(account.ephemeralKeyPair) &&
  // Check the idToken for nonce
  // 检查 ID 令牌（idToken）中是否包含一个有效的 nonce（一次性随机数）值 
  isValidIdToken(account.jwt) &&
  // If the EphemeralAccount nonce algorithm changes, this will need to be updated
  // 如果临时账户的nonce算法发生变化，这将需要被更新。 
  decodeIdToken(account.jwt).nonce === account.ephemeralKeyPair.nonce
    ? account
    : undefined;
