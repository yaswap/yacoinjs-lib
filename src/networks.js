'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.testnet = exports.regtest = exports.yacoin = void 0;
exports.yacoin = {
  messagePrefix: '\x18Yacoin Signed Message:\n',
  bech32: 'bc',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: 0x4d,
  scriptHash: 0x8b,
  wif: 0xcd,
};
exports.regtest = {
  messagePrefix: '\x18Yacoin Signed Message:\n',
  bech32: 'bcrt',
  bip32: {
    public: 0x043587cf,
    private: 0x04358394,
  },
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
};
exports.testnet = {
  messagePrefix: '\x18Yacoin Signed Message:\n',
  bech32: 'tb',
  bip32: {
    public: 0x043587cf,
    private: 0x04358394,
  },
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
};
