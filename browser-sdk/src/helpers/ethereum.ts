import { Contract, Signer, providers, utils } from "ethers";

const tokenAbi = [
  "function decimals() public view returns (uint8)",
  "function mint(address _to, uint256 _value) returns (bool success)",
  "function transfer(address _to, uint256 _value) returns (bool success)",
  "function balanceOf(address account) view returns (uint256)",
];

export const isValidAddress = (address?: string) => {
  if (!address) {
    return false;
  } else if (address.toLowerCase().substring(0, 2) !== "0x") {
    return false;
  } else if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
    return false;
  } else if (/^(0x)?[0-9a-fA-F]{40}$/.test(address)) {
    return true;
  } else {
    return address === utils.getAddress(address);
  }
};

export async function getEthBalance(
  address: string,
  ethProvider: providers.Provider | Signer
): Promise<string> {
  return (ethProvider as Signer)._isSigner
    ? (await (ethProvider as Signer).getBalance()).toString()
    : (await ethProvider.getBalance(address)).toString();
}

export async function getTokenDecimals(
  ethProvider: providers.Provider | Signer,
  assetId: string
): Promise<number> {
  let decimals = 18;
  try {
    decimals = (
      await new Contract(assetId, tokenAbi, ethProvider).functions.decimals()
    ).toNumber();
  } catch (e) {
    // do nothing
  }
  return decimals;
}

export async function getTokenBalance(
  address: string,
  ethProvider: providers.Provider | Signer,
  assetId: string
): Promise<string> {
  return (
    await new Contract(assetId, tokenAbi, ethProvider).functions.balanceOf(
      address
    )
  ).toString();
}
