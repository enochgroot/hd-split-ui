// This address points to a dummy ERC20 contract deployed on Ethereum Mainnet,
// Goerli, Kovan, Rinkeby and Ropsten. Replace it with your smart contracts.
const addresses = {
  //
  // mainnet
  //
  dai: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  // HDSplit with tell() (darknode)
  // split: "0x2860f149aC57CDF02b8229046057656b7D86d928",
  // HDSplit with tell() (mining)
  // split: "0x794373dCdB024216018D59132E723031Fc0D7c2D",
  // HDSplit with DAI set to 0x0 (Tulip 1637)
  split: "0x3Aaf35C4160baA41b906c4E10AD13c91239584B9",
  //
  // kovan
  //
  // dai: "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa",
  // kovan HDSplit with DAI set to 0x0
  // split: "0x9A25A7D7EeEb37EDcD8dE6AdCAb3eb8303c7619D",
  // kovan HDSplit with tell() enabled
  // split: "0x48ac534Df1DF357e421b7d2f30652F9D1f1400c8",
};

export default addresses;
