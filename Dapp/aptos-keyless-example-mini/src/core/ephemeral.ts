// Copyright © Aptos
// SPDX-License-Identifier: Apache-2.0

import { Ed25519PrivateKey, EphemeralKeyPair } from "@aptos-labs/ts-sdk";

// 定义了与EphemeralKeyPair相关的编码和解码方法
export const EphemeralKeyPairEncoding = {
  // 解码方法：将字节数据转换为EphemeralKeyPair实例
  decode: (e: any) => EphemeralKeyPair.fromBytes(e.data),
  // 编码方法：将EphemeralKeyPair实例转换为JSON可序列化的格式
  encode: (e: EphemeralKeyPair) => ({
    __type: "EphemeralKeyPair",
    data: e.bcsToBytes(), // 将密钥对转换为字节序列
  }),
};

// 验证EphemeralKeyPair的函数，如果有效则返回该密钥对，否则返回undefined
export const validateEphemeralKeyPair = (
  keyPair: EphemeralKeyPair
): EphemeralKeyPair | undefined =>
  isValidEphemeralKeyPair(keyPair) ? keyPair : undefined;

export const isValidEphemeralKeyPair = (keyPair: EphemeralKeyPair): boolean => {
  if (keyPair.isExpired()) return false;
  return true;
};

/**
 * Create a new ephemeral key pair with a random private key and nonce.
 *
 * @param params Additional parameters for the ephemeral key pair
 */
// 检查EphemeralKeyPair是否有效的函数
// 如果密钥对已过期，则返回false；否则返回true
export const createEphemeralKeyPair = ({
  expiryDateSecs = BigInt(Math.floor(Date.now() / 1000)) + BigInt(24 * 60 * 60),
  privateKey = Ed25519PrivateKey.generate(),
  ...options
}: Partial<ConstructorParameters<typeof EphemeralKeyPair>[0]> = {}) =>
  new EphemeralKeyPair({ expiryDateSecs, privateKey, ...options });
