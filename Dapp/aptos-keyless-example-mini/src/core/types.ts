// Copyright © Aptos
// SPDX-License-Identifier: Apache-2.0

import { z } from "zod";

// 定义 idTokenSchema，用于验证 ID Token 的基本结构
export const idTokenSchema = z.object({
  // aud: 代表受众，通常是接收 ID Token 的应用的唯一标识符
  aud: z.string(),
  // exp: 代表过期时间，是一个 Unix 时间戳，表示 ID Token 过期的时间
  exp: z.number(),
  // iat: 代表颁发时间，是一个 Unix 时间戳，表示 ID Token 颁发的时间
  iat: z.number(),
  // iss: 代表颁发者，通常是认证服务器的唯一标识符
  iss: z.string(),
  // sub: 代表主题，通常是用户或实体的唯一标识符
  sub: z.string(),
});
// 扩展 idTokenSchema，添加 nonce 字段，用于验证加密 ID Token
export const nonceEncryptedIdTokenSchema = idTokenSchema.extend({
  nonce: z.string(),
});
// 扩展 nonceEncryptedIdTokenSchema，添加可选的用户个人信息字段
export const profileScopedPayloadSchema = nonceEncryptedIdTokenSchema.extend({
   // family_name: 用户的姓氏
   family_name: z.string().optional(),
   // given_name: 用户的名
   given_name: z.string().optional(),
   // locale: 用户的地区设置
   locale: z.string().optional(),
   // name: 用户的全名
   name: z.string(),
   // picture: 用户的头像链接
   picture: z.string().optional(),
});

// 扩展 nonceEncryptedIdTokenSchema，添加可选的电子邮件信息字段
export const emailScopedPayloadSchema = nonceEncryptedIdTokenSchema.extend({
  email: z.string().optional(),
  email_verified: z.boolean(),
});
// 合并 profileScopedPayloadSchema 和 emailScopedPayloadSchema，创建一个包含所有字段的 schema
export const scopedPayloadSchema = profileScopedPayloadSchema.merge(
  emailScopedPayloadSchema
);
// 从 idTokenSchema 推导出 IDToken 类型
export type IDToken = z.infer<typeof idTokenSchema>;
// 从 nonceEncryptedIdTokenSchema 推导出 NonceEncryptedIdToken 类型
export type NonceEncryptedIdToken = z.infer<typeof nonceEncryptedIdTokenSchema>;
// 从 profileScopedPayloadSchema 推导出 ProfileScopedPayloadSchema 类型
export type ProfileScopedPayloadSchema = z.infer<
  typeof profileScopedPayloadSchema
>;
// 从 emailScopedPayloadSchema 推导出 EmailScopedPayloadSchema 类型
export type EmailScopedPayloadSchema = z.infer<typeof emailScopedPayloadSchema>;
// 从 scopedPayloadSchema 推导出 EncryptedScopedIdToken 类型
export type EncryptedScopedIdToken = z.infer<typeof scopedPayloadSchema>;
