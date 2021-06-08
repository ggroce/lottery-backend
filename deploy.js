const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');
const CONTRACT_WALLET_PRIVATE_KEY = process.env.CONTRACT_WALLET_PRIVATE_KEY;
const INFURA_RINKEBY_API_KEY = process.env.INFURA_RINKEBY_API_KEY;

const provider = new HDWalletProvider(
  CONTRACT_WALLET_PRIVATE_KEY, 
  INFURA_RINKEBY_API_KEY
);

const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account: ', accounts[0]);

  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ gas: '1000000', from: accounts[0] });

  console.log(interface);
  console.log('Contract deployed to: ', result.options.address);
}
deploy();
