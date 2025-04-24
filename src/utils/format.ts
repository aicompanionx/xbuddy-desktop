export const shortenAddress = (address: string, frontCount = 4, backCount = 4) => {
  if (!address || address.length < frontCount + backCount) return address
  return `${address.substring(0, frontCount)}...${address.substring(address.length - backCount)}`
}

export const shortenName = (name: string, backCount = 10) => {
  if (!name || name.length < backCount) return name
  return `${name.substring(0, backCount)}...`
}
