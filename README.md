Ve Safe Contracts
=====================

Usage
-----
### Install requirements with yarn:

```bash
yarn
```

### Deploy

This will deploy the contracts deterministically and verify the contracts on etherscan using [Solidity 0.7.6](https://github.com/ethereum/solidity/releases/tag/v0.7.6) by default.


```bash
npx truffle migrate --network testnet  -f 2 --to 6
```

This will perform the following steps

```bash
# Deploy
npx truffle migrate --network testnet  -f 1 --to 1
# Deploy token test
npx truffle migrate --network testnet  -f 9 --to 9
# Transfer token test to SafeContract
npx truffle migrate --network testnet  -f 8 --to 8
```


Documentation
-------------
- [Error codes](docs/error_codes.md)
- [Coding guidelines](docs/guidelines.md)


License
-------
All smart contracts are released under LGPL-3.0
