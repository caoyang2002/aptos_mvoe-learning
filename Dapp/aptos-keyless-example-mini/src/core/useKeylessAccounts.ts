// Copyright © Aptos
// SPDX-License-Identifier: Apache-2.0

import {
  EphemeralKeyPair,
  KeylessAccount,
  ProofFetchStatus,
} from "@aptos-labs/ts-sdk";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { LocalStorageKeys, devnetClient } from "./constants";
import { validateIdToken } from "./idToken";
import {
  EphemeralKeyPairEncoding,
  isValidEphemeralKeyPair,
  validateEphemeralKeyPair,
} from "./ephemeral";
import { EncryptedScopedIdToken } from "./types";
import { KeylessAccountEncoding, validateKeylessAccount } from "./keyless";

// 定义状态接口，包含账户信息和操作
interface KeylessAccountsState {
  accounts: {
    idToken: { decoded: EncryptedScopedIdToken; raw: string };
    pepper: Uint8Array;
  }[];
  activeAccount?: KeylessAccount;
  ephemeralKeyPair?: EphemeralKeyPair;
}

// 定义操作接口，包含添加临时密钥对、断开连接、获取临时密钥对和切换账户
interface KeylessAccountsActions {
  /**
   * Add an Ephemeral key pair to the store. If the account is invalid, an error is thrown.
   *
   * @param account - The Ephemeral key pair to add to the store.
   */
  // 添加临时密钥对到存储中。如果账户无效，抛出错误。
  // account - 要添加到存储的临时密钥对。
  commitEphemeralKeyPair: (account: EphemeralKeyPair) => void;
  /**
   * Disconnects the active account from the store.
   */
  // 断开当前活动的无密钥账户。
  disconnectKeylessAccount: () => void;
  /**
   * Retrieve the Ephemeral key pair from the store.
   *
   * @returns The Ephemeral key pair if found, otherwise undefined.
   */
  // 从存储中检索临时密钥对。
  getEphemeralKeyPair: () => EphemeralKeyPair | undefined;
  /**
   * Switches the active account to the one associated with the provided idToken. If no account is found,
   * undefined is returned. The following conditions must be met for the switch to be successful:
   *
   * 1. The idToken must be valid and contain a nonce.
   * 2. An Ephemeral key pair with the same nonce must exist in the store.
   * 3. The idToken and Ephemeral key pair must both be valid.
   *
   * @param idToken - The idToken of the account to switch to.
   * @returns The active account if the switch was successful, otherwise undefined.
   */
  // 切换到与提供的 idToken 相关联的账户。如果找不到账户，则返回 undefined。
  // 切换成功需要满足以下条件：
  // 1. idToken 必须有效且包含 nonce。
  // 2. 存储中必须存在具有相同 nonce 的临时密钥对。
  // 3. idToken 和临时密钥对都必须有效。
  // idToken - 要切换到的账户的 idToken。
  // 如果切换成功，则返回活动账户，否则返回 undefined。
  switchKeylessAccount: (
    idToken: string
  ) => Promise<KeylessAccount | undefined>;
}
// 创建存储，使用 JSON 存储并自定义序列化和反序列化逻辑
const storage = createJSONStorage<KeylessAccountsState>(() => localStorage, {
  replacer: (_, e) => {
    if (typeof e === "bigint") return { __type: "bigint", value: e.toString() };
    if (e instanceof Uint8Array)
      return { __type: "Uint8Array", value: Array.from(e) };
    if (e instanceof EphemeralKeyPair)
      return EphemeralKeyPairEncoding.encode(e);
    if (e instanceof KeylessAccount) return KeylessAccountEncoding.encode(e);
    return e;
  },
  reviver: (_, e: any) => {
    if (e && e.__type === "bigint") return BigInt(e.value);
    if (e && e.__type === "Uint8Array") return new Uint8Array(e.value);
    if (e && e.__type === "EphemeralKeyPair")
      return EphemeralKeyPairEncoding.decode(e);
    if (e && e.__type === "KeylessAccount")
      return KeylessAccountEncoding.decode(e);
    return e;
  },
});

// 使用 zustand 创建一个持久化的状态管理器
export const useKeylessAccounts = create<
  KeylessAccountsState & KeylessAccountsActions
>()(
  persist(
    // 使用 persist 中间件来持久化状态
    (set, get, store) => ({
      ...({ accounts: [] } satisfies KeylessAccountsState),
      ...({
        // 添加临时密钥对到状态
        commitEphemeralKeyPair: (keyPair) => {
          const valid = isValidEphemeralKeyPair(keyPair);
          if (!valid)
            throw new Error(
              "addEphemeralKeyPair: Invalid ephemeral key pair provided"
            );
          set({ ephemeralKeyPair: keyPair });
        },
        // 断开当前活动的无密钥账户
        disconnectKeylessAccount: () => set({ activeAccount: undefined }),
        // 从状态中获取临时密钥对
        getEphemeralKeyPair: () => {
          const account = get().ephemeralKeyPair;
          return account ? validateEphemeralKeyPair(account) : undefined;
        },
        // 切换到与提供的 idToken 相关联的账户
        switchKeylessAccount: async (idToken: string) => {
          set({ ...get(), activeAccount: undefined }, true);

          // If the idToken is invalid, return undefined
          // 验证 idToken
          const decodedToken = validateIdToken(idToken);
          if (!decodedToken) {
            throw new Error(
              "switchKeylessAccount: Invalid idToken provided, could not decode"
            );
          }

          // If a corresponding Ephemeral key pair is not found, return undefined
          // 检查是否存在对应的临时密钥对
          const ephemeralKeyPair = get().getEphemeralKeyPair();
          if (
            !ephemeralKeyPair ||
            ephemeralKeyPair?.nonce !== decodedToken.nonce
          ) {
            throw new Error(
              "switchKeylessAccount: Ephemeral key pair not found"
            );
          }

          // Create a handler to allow the proof to be computed asynchronously.
          const proofFetchCallback = async (res: ProofFetchStatus) => {
            if (res.status === "Failed") {
              get().disconnectKeylessAccount();
            } else {
              store.persist.rehydrate();
            }
          };

          // Derive and store the active account
          // 异步获取证明
          const storedAccount = get().accounts.find(
            (a) => a.idToken.decoded.sub === decodedToken.sub
          );
          let activeAccount: KeylessAccount | undefined;
          try {
            activeAccount = await devnetClient.deriveKeylessAccount({
              ephemeralKeyPair,
              jwt: idToken,
              proofFetchCallback,
            });
          } catch (error) {
            // If we cannot derive an account using the pepper service, attempt to derive it using the stored pepper
            if (!storedAccount?.pepper) throw error;
            activeAccount = await devnetClient.deriveKeylessAccount({
              ephemeralKeyPair,
              jwt: idToken,
              pepper: storedAccount.pepper,
              proofFetchCallback,
            });
          }

          // Store the account and set it as the active account
          // 存储账户并设置为活动账户
          const { pepper } = activeAccount;
          set({
            accounts: storedAccount
              ? // If the account already exists, update it. Otherwise, append it.
              // 如果账户已存在，则更新它。否则，添加它。
                get().accounts.map((a) =>
                  a.idToken.decoded.sub === decodedToken.sub
                    ? {
                        idToken: { decoded: decodedToken, raw: idToken },
                        pepper,
                      }
                    : a
                )
              : [
                  ...get().accounts,
                  { idToken: { decoded: decodedToken, raw: idToken }, pepper },
                ],
            activeAccount,
          });

          return activeAccount;
        },
      } satisfies KeylessAccountsActions),
    }),
    {
      // 自定义合并逻辑
      merge: (persistedState, currentState) => {
        const merged = { ...currentState, ...(persistedState as object) };
        return {
          ...merged,
          activeAccount:
            merged.activeAccount &&
            validateKeylessAccount(merged.activeAccount),
          ephemeralKeyPair:
            merged.ephemeralKeyPair &&
            validateEphemeralKeyPair(merged.ephemeralKeyPair),
        };
      },
      // 设置存储名称
      name: LocalStorageKeys.keylessAccounts,
      // 自定义部分状态
      partialize: ({ activeAccount, ephemeralKeyPair, ...state }) => ({
        ...state,
        activeAccount: activeAccount && validateKeylessAccount(activeAccount),
        ephemeralKeyPair:
          ephemeralKeyPair && validateEphemeralKeyPair(ephemeralKeyPair),
      }),
      // 使用自定义存储
      storage,
      // 设置版本号
      version: 1,
    }
  )
);
