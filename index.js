const { Provider, Contract, Account } = require('starknet')

const config = require('./config.json')

const fs = require('fs')

const provider = new Provider({
    network: 'mainnet',
    rpc: {
        nodeUrl: 'https://starknet-mainnet.public.blastapi.io/rpc/v0.5'
    }
})


const jedi_abi = [
    {
        "name": "swap_exact_tokens_for_tokens",
        "type": "function",
        "inputs": [
            {
                "name": "amountIn",
                "type": "core::integer::u256"
            },
            {
                "name": "amountOutMin",
                "type": "core::integer::u256"
            },
            {
                "name": "path",
                "type": "felt*"
            },
            {
                "name": "path_len",
                "type": "felt"
            },
            {
                "name": "to",
                "type": "felt"
            },
            {
                "name": "deadline",
                "type": "felt"
            }
        ],
        "outputs": [
            {
                "name": "amounts_len",
                "type": "felt"
            },
            {
                "name": "amounts",
                "type": "core::integer::u256*"
            }
        ]
    },
    {
        "inputs": [
            {
                "name": "amountIn",
                "type": "core::integer::u256"
            },
            {
                "name": "path_len",
                "type": "felt"
            },
            {
                "name": "path",
                "type": "core::array::Array::<core::felt252>"
            }
        ],
        "name": "get_amounts_in",
        "outputs": [
            {
                "name": "amounts_len",
                "type": "felt"
            },
            {
                "name": "amounts",
                "type": "Uint256*"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },]

async function swap_jedi(wallet, { amount, tokenSend, tokenRecive } = {}) {
    try {
        const jedi = new Contract(jedi_abi, config.JEDI_ROUTER, wallet)
        let path = [tokenRecive, tokenSend]
        const deadline = Date.now() + 1000000
        const amountOut = await jedi.get_amounts_in(amount, path)
        const min_out = amountOut.amounts[0] * BigInt(config.Slipage) / 100n
        path = [tokenSend, tokenRecive]
        const tx = await jedi.swap_exact_tokens_for_tokens(amount, min_out, path, wallet.address, deadline)
        console.log('https://starkscan.co/tx/' + tx.transaction_hash)
    } catch (e) {
        console.log('Ошбика при покупке, кошелек ' + wallet.address)
        console.log(e)
    }
}

const wallets = JSON.parse(fs.readFileSync('./wallets.json'))

function start(amount, tokenSend, tokenRecive) {
    for (const address in wallets) {
        const wallet = new Account(provider, address, wallets[address])
        swap_jedi(wallet, { amount: amount, tokenSend: tokenSend, tokenRecive: tokenRecive })
    }
}
const decimals = 10 ** config.tokenDecimals

const amount = config.tokenSendAmount * decimals

start(BigInt(amount), config.tokenSend, config.tokenRecive)
