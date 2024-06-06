// Copyright © Aptos
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from "react";
import { createEphemeralKeyPair } from "./ephemeral";
import { useKeylessAccounts } from "./useKeylessAccounts";
// 默认导出函数，用于获取临时密钥对
export default function useEphemeralKeyPair() {
  // 从 useKeylessAccounts 钩子中解构出 commitEphemeralKeyPair 和 getEphemeralKeyPair 函数
  const { commitEphemeralKeyPair, getEphemeralKeyPair } = useKeylessAccounts();
  // 使用 useMemo 钩子来缓存临时密钥对
  const ephemeralKeyPair = useMemo(() => {
    let keyPair = getEphemeralKeyPair();

    // If no key pair is found, create a new one and commit it to the store
    // 如果没有找到密钥对，则创建一个新的密钥对并将其提交到存储中
    if (!keyPair) {
      keyPair = createEphemeralKeyPair();
      commitEphemeralKeyPair(keyPair);
    }
    // 返回找到或创建的密钥对
    return keyPair;
  }, [commitEphemeralKeyPair, getEphemeralKeyPair]);
  // 返回临时密钥对
  return ephemeralKeyPair;
}
