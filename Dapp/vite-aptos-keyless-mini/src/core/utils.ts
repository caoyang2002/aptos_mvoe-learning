// 定义一个函数，用于将长地址缩短显示
export const collapseAddress = (address: string): string => {
  // 使用字符串切片方法来截取地址的前6个字符和后4个字符
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
