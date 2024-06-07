// Copyright © Aptos
// SPDX-License-Identifier: Apache-2.0

import { jwtDecode } from "jwt-decode";
import { EncryptedScopedIdToken, scopedPayloadSchema } from "./types";

// 解码ID令牌的函数，将JWT转换为EncryptedScopedIdToken类型
export const decodeIdToken = (jwt: string): EncryptedScopedIdToken =>
  // 使用jwt-decode库解码JWT，并用scopedPayloadSchema解析
  scopedPayloadSchema.parse(jwtDecode(jwt));

  // 验证ID令牌是否有效的函数
export const isValidIdToken = (
  jwt: string | EncryptedScopedIdToken
): boolean => {
  // 如果传入的是字符串类型的JWT，则先解码该JWT
  if (typeof jwt === "string") return isValidIdToken(decodeIdToken(jwt));

  // Check whether the token has an expiration, nonce, and is not expired
  // 检查令牌是否有过期时间、nonce字段，并且没有过期
  // 如果令牌没有nonce字段，则返回false
  if (!jwt.nonce) return false;
  // 如果有nonce字段，则返回true，表示令牌有效
  return true;
};

// 验证ID令牌的函数，如果令牌有效则返回该令牌，否则返回null
export const validateIdToken = (
  jwt: string | EncryptedScopedIdToken
): EncryptedScopedIdToken | null => {
  // 如果传入的是字符串类型的JWT，则先解码该JWT
  if (typeof jwt === "string") return validateIdToken(decodeIdToken(jwt));
  // 使用isValidIdToken函数检查令牌是否有效
  // 如果令牌有效，则返回该令牌
  // 如果令牌无效，则返回null
  return isValidIdToken(jwt) ? jwt : null;
};
