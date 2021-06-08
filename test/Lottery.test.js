const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const { interface, bytecode } = require('../compile.js');

let accounts;
let lottery;

beforeEach(async () => {
  // Get a list of all accounts
  accounts = await web3.eth.getAccounts();

  // Use one of those accounts to deploy the contract
  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: '1000000' });
});

describe('Lottery', () => {
  it('Deploys a contract', () => {
    assert.ok(lottery.options.address);
    console.log(lottery.options.address);
  });

  it('Add a single new player', async () => {
    await lottery.methods.enter().send({ 
      from: accounts[0], 
      value: web3.utils.toWei('0.02', 'ether')
    });

    const players = await lottery.methods.getPlayers().call({ 
      from: accounts[0]
    });

    assert.strictEqual(accounts[0], players[0]);
    assert.strictEqual(1, players.length);
  });

  it('Add multiple players', async () => {
    await lottery.methods.enter().send({ 
      from: accounts[0], 
      value: web3.utils.toWei('0.2', 'ether')
    });

    await lottery.methods.enter().send({ 
      from: accounts[1], 
      value: web3.utils.toWei('0.5', 'ether')
    });

    await lottery.methods.enter().send({ 
      from: accounts[2], 
      value: web3.utils.toWei('0.3', 'ether')
    });

    const players = await lottery.methods.getPlayers().call({ 
      from: accounts[0]
    });

    assert.strictEqual(accounts[0], players[0]);
    assert.strictEqual(accounts[1], players[1]);
    assert.strictEqual(accounts[2], players[2]);
    assert.strictEqual(3, players.length);
  });

  it('Submit player with insufficient amount of ether (<.01)', async () => {
    try {
      await lottery.methods.enter().send({ 
        from: accounts[0], 
        value: web3.utils.toWei('0.00001', 'ether')
      });
    } catch(err) {
      assert(err);
      return;
    }
    assert(false);
  });

  it('Regular user cannot pick winner', async () => {
    await lottery.methods.enter().send({ 
      from: accounts[1], 
      value: web3.utils.toWei('.02', 'ether')
    });

    try {
      await lottery.methods.pickWinner().send({ 
        from: accounts[1]
      });
    } catch(err) {
      assert(err);
      return;
    }
    assert(false);
  });
});
