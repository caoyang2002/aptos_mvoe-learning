import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
 
export function getAptosClient() {
  // 或者 Network.DEVNET（确保你的网络在应用程序中保持一致）
  const config = new AptosConfig({ network: Network.TESTNET });
  return new Aptos(config);
}
