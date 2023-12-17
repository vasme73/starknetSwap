const { Provider, Contract, Account } = require('starknet')

const fs = require('fs')

const config = require('./config.json')

const provider = new Provider({
    network: 'mainnet',
    rpc: {
        nodeUrl: 'https://starknet-mainnet.public.blastapi.io/rpc/v0.5'
    }
})

const aprove_abi = [{
    "name": "approve",
    "type": "function",
    "inputs": [
        {
            "name": "spender",
            "type": "felt"
        },
        {
            "name": "amount",
            "type": "core::integer::u256"
        }
    ],
    "outputs": [
        {
            "name": "res",
            "type": "felt"
        }
    ]
}]

const wallets = JSON.parse(fs.readFileSync('./wallets.json'))

async function approve(amount, tokenSend) {
    for (const address in wallets) {
        try {
            const wallet = new Account(provider, address, wallets[address])
            const contract = new Contract(aprove_abi, tokenSend, wallet)
            const tx = await contract.approve(config.JEDI_ROUTER, amount)
            console.log('https://starkscan.co/tx/' + tx.transaction_hash)
        } catch (e) {
            console.log('Ошбика при апруве, кошелек ' + address)
            console.log(e)
        }
    }
}

const decimals = 10 ** config.tokenDecimals

const amount = config.tokenSendAmount * decimals

approve(BigInt(amount), config.tokenSend)