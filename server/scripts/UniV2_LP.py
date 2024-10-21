from web3 import Web3
from dotenv import load_dotenv
from prettytable import PrettyTable
from decimal import Decimal

import os
import json

# Load environment variables from .env file
load_dotenv()

# Replace these with your actual values
provider_url = os.getenv("POLYGON_RPC_URL")
private_key = os.getenv("PRIVATE_KEY")
wallet_address = "0x807061DF657A7697c04045dA7d16D941861cAABc"
contract_address = "0x4b63765e107eaca42789ce972c02bE9E3fE2cd51"

# Load the ABI from the provided ABI structure
with open("./server/abis/UniV2_LP.json") as f:
    abi = json.load(f)

# ERC20 ABI for DAI and BEAN (If needed for token-specific functions)
with open('./server/abis/erc20_abi.json') as f:
    erc20_abi = json.load(f)


# Connect to the Ethereum provider
web3 = Web3(Web3.HTTPProvider(provider_url))
assert web3.is_connected(), "Failed to connect to provider"
print("Connected to provider")

# Load your contract
contract = web3.eth.contract(address=contract_address, abi=abi)
print("Contract loaded")

# DAI contract 
dai_contract_address = os.getenv("DAI_TOKEN_CONTRACT_ADDRESS")
dai_contract = web3.eth.contract(address=dai_contract_address, abi=erc20_abi)

# BEAN contract
bean_contract_address = os.getenv("BEANLB_TOKEN_CONTRACT_ADDRESS")
bean_contract = web3.eth.contract(address=bean_contract_address, abi=erc20_abi)

# print out the bean contract to help debug it's functionality
print(bean_contract)


# Function to get token addresses
def get_token_addresses():
    try:
        token0 = contract.functions.token0().call()  # Fetch token0 address
        token1 = contract.functions.token1().call()  # Fetch token1 address
        print(f"Token 0 Address: {token0}")
        print(f"Token 1 Address: {token1}")
    except Exception as e:
        print(f"Error fetching token addresses: {e}")

# Function to get reserves
def get_reserves():
    try:
        reserves = contract.functions.getReserves().call()  # Fetch pool reserves
        reserve0 = web3.from_wei(reserves[0], 'ether')  # Assuming this is DAI
        reserve1 = reserves[1]  # This is BEAN, which has no decimals
        print(f"Reserve Token 0: {reserve0}")
        print(f"Reserve Token 1: {reserve1}")
    except Exception as e:
        print(f"Error fetching reserves: {e}")
    return reserve0, reserve1

def get_total_supply():
    try:
        total_supply = contract.functions.totalSupply().call()
        total_supply_ether = web3.from_wei(total_supply, 'ether')
        print(f"Total Supply of LP Tokens: {total_supply_ether}")
    except Exception as e:
        print(f"Error fetching total supply: {e}")

def get_lp_token_balance():
    try:
        balance = contract.functions.balanceOf(wallet_address).call()
        print(f"Your LP Token Balance: {balance}")
    except Exception as e:
        print(f"Error fetching LP token balance: {e}")

def printContractFuntions():
    # Create a prettytable instance
    table = PrettyTable()
    table.field_names = ["Function Name", "Inputs", "Outputs"]

    # Iterate through all contract functions and gather details
    available_functions = contract.all_functions()

    for func in available_functions:
        func_name = func.fn_name  # Function name
        inputs = ", ".join([f"{i['type']} {i['name']}" for i in func.abi['inputs']])  # Input types and names
        outputs = ", ".join([f"{o['type']}" for o in func.abi['outputs']])  # Output types
        
        table.add_row([func_name, inputs, outputs])

    # Print the table
    print(table)

# get symbol
def get_symbol():
    try:
        symbol = contract.functions.symbol().call()
        print(f"Symbol: {symbol}")
    except Exception as e:
        print(f"Error fetching symbol: {e}")
#get name
def get_name():
    try:
        name = contract.functions.name().call()
        print(f"Name: {name}")
    except Exception as e:
        print(f"Error fetching name: {e}")

#get kLast
def get_k_last():
    try:
        k_last = contract.functions.kLast().call()
        print(f"K Last: {k_last}")
    except Exception as e:
        print(f"Error fetching kLast: {e}")

# Function to sync the pool
def sync_pool():
    try:
        txn = contract.functions.sync().build_transaction({
            "chainId": 137,  # Polygon Mainnet
            "gas": 300000,   # Adjust gas limit if necessary
            "gasPrice": web3.to_wei('50', 'gwei'),  # Adjust gas price as necessary
            "nonce": web3.eth.get_transaction_count(wallet_address),
        })

        signed_txn = web3.eth.account.sign_transaction(txn, private_key=private_key)
        tx_hash = web3.eth.send_raw_transaction(signed_txn.raw_transaction)
        print(f"Sync Transaction Sent: {web3.to_hex(tx_hash)}")
        
        receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        print(f"Sync Transaction Confirmed: {receipt.transactionHash.hex()}")
    except Exception as e:
        print(f"Error calling sync: {e}")

# Function to skim excess balances
def skim_excess_balances():
    try:
        # Build the skim transaction
        txn = contract.functions.skim(wallet_address).build_transaction({
            "chainId": 137,  # Polygon Mainnet
            "gas": 500000,   # Adjust gas limit if necessary
            "gasPrice": web3.to_wei('50', 'gwei'),  # Adjust gas price if necessary
            "nonce": web3.eth.get_transaction_count(wallet_address),
        })

        # Sign the transaction with your private key
        signed_txn = web3.eth.account.sign_transaction(txn, private_key=private_key)

        # Send the transaction
        tx_hash = web3.eth.send_raw_transaction(signed_txn.raw_transaction)
        print(f"Skim Transaction Sent: {web3.to_hex(tx_hash)}")

        # Wait for the transaction receipt
        receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        print(f"Transaction Confirmed: {receipt.transactionHash.hex()}")
        print("Excess tokens skimmed to wallet address.")
    except Exception as e:
        print(f"Error during skim: {e}")

# Function to burn LP tokens
def burn_lp_tokens():
    # Fetch the balance of LP tokens
    lp_balance = contract.functions.balanceOf(wallet_address).call()
    print(f"LP Token Balance: {lp_balance}")
    # Fetch token reserves
    reserves = contract.functions.getReserves().call()
    reserve0 = web3.from_wei(reserves[0], 'ether')
    reserve1 = reserves[1]
    print(f"Reserves: {reserve0} Token 0, {reserve1} Token 1")

    # approve the contract to spend LP tokens
    approve_txn = contract.functions.approve(contract_address, lp_balance).build_transaction({
        "chainId": 137,  # Polygon Mainnet
        "gas": 300000,   # Adjust gas limit if necessary
        "gasPrice": web3.to_wei('50', 'gwei'),  # Adjust gas price if necessary
        "nonce": web3.eth.get_transaction_count(wallet_address),
    })
    # Sign the approval transaction
    signed_approve_txn = web3.eth.account.sign_transaction(approve_txn, private_key=private_key)
    print("Approving LP Tokens for Burn")

    # Send the approval transaction
    approve_tx_hash = web3.eth.send_raw_transaction(signed_approve_txn.raw_transaction)
    print(f"Approval Transaction Sent: {web3.to_hex(approve_tx_hash)}")

    # Wait for the approval transaction receipt
    approve_receipt = web3.eth.wait_for_transaction_receipt(approve_tx_hash)
    print(f"Approval Transaction Confirmed: {approve_receipt.transactionHash.hex()}")
    print("LP Tokens Approved for Burn")

    # Build the burn transaction
    txn = contract.functions.burn(wallet_address).build_transaction({
        "chainId": 137,  # Polygon Mainnet
        "gas": 1000000,   # Adjust gas limit if necessary
        "gasPrice": web3.to_wei('50', 'gwei'),  # Adjust gas price if necessary
        "nonce": web3.eth.get_transaction_count(wallet_address),
    })

    # Sign the transaction with your private key
    signed_txn = web3.eth.account.sign_transaction(txn, private_key=private_key)

    # Send the transaction to burn the LP tokens
    tx_hash = web3.eth.send_raw_transaction(signed_txn.raw_transaction)
    print(f"Burn Transaction Sent: {web3.to_hex(tx_hash)}")

    # Wait for the transaction receipt
    receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
    print(f"Receipt: {receipt}")
    print(f"Transaction Confirmed: {receipt.transactionHash.hex()}")
    print("LP Tokens Burned and Liquidity Removed")

# Function to check DAI and BEAN balances in wallet
def check_balances():
    # Check DAI balance
    dai_balance = dai_contract.functions.balanceOf(wallet_address).call()
    print(f"DAI Balance: {web3.from_wei(dai_balance, 'ether')} DAI")
    
    # Check BEAN balance (no decimals)
    bean_balance = bean_contract.functions.balanceOf(wallet_address).call()
    print(f"BEAN Balance: {bean_balance} BEAN")

# Function to transfer DAI and BEAN to the contract to load it before minting LP tokens
def transfer_tokens_to_contract(dai_amount, bean_amount):
    # Transfer DAI to the contract
    dai_transfer_txn = dai_contract.functions.transfer(contract_address, dai_amount).build_transaction({
        "chainId": 137,
        "gas": 300000,
        "gasPrice": web3.to_wei('50', 'gwei'),
        "nonce": web3.eth.get_transaction_count(wallet_address),
    })
    signed_dai_txn = web3.eth.account.sign_transaction(dai_transfer_txn, private_key)
    web3.eth.send_raw_transaction(signed_dai_txn.raw_transaction)
    print("DAI sent to the contract.")

    # Transfer BEAN to the contract (direct integer value)
    bean_transfer_txn = bean_contract.functions.transfer(contract_address, bean_amount).build_transaction({
        "chainId": 137,
        "gas": 300000,
        "gasPrice": web3.to_wei('50', 'gwei'),
        "nonce": web3.eth.get_transaction_count(wallet_address),
    })
    signed_bean_txn = web3.eth.account.sign_transaction(bean_transfer_txn, private_key)
    web3.eth.send_raw_transaction(signed_bean_txn.raw_transaction)
    print("BEAN sent to the contract.")

# Add liquidity to the pool after loading the contract with funds and mint LP tokens
def mint_lp_tokens():
    try:
        # Call the mint function to create LP tokens
        mint_txn = contract.functions.mint(wallet_address).build_transaction({
            "chainId": 137,
            "gas": 500000,  # Adjust gas limit if necessary
            "gasPrice": web3.to_wei('50', 'gwei'),
            "nonce": web3.eth.get_transaction_count(wallet_address),
        })

        # Sign and send the transaction
        signed_mint_txn = web3.eth.account.sign_transaction(mint_txn, private_key)
        tx_hash = web3.eth.send_raw_transaction(signed_mint_txn.raw_transaction)
        print(f"Mint transaction sent: {web3.to_hex(tx_hash)}")

        # Wait for the transaction receipt
        receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        print(f"Mint transaction confirmed: {receipt.transactionHash.hex()}")
        print("receipt: ", receipt)
        print("LP tokens minted successfully.")
    except Exception as e:
        print(f"Error during minting: {e}")

# Rebalance the pool
def rebalance(dai_to_add, reserve_dai, reserve_bean):
    if reserve_dai == 0 or reserve_bean == 0:
        raise ValueError("Reserves must be non-zero to calculate the balance.")
    
    # Since BEAN has 0 decimals, return an integer value
    bean_to_add = int((reserve_bean / reserve_dai) * dai_to_add)
    return bean_to_add

# check balances loadec on contract not yet locked in LP tokens
def check_contract_balances():
    """
    Fetches and prints the DAI and BEAN balances held by the contract.
    """
    try:
        # Get the DAI balance held by the liquidity pool contract
        dai_balance = dai_contract.functions.balanceOf(contract_address).call()
        dai_balance_ether = web3.from_wei(dai_balance, 'ether')
        print(f"DAI Balance on Contract: {dai_balance_ether} DAI")
        
        # Get the BEAN balance held by the liquidity pool contract
        bean_balance = bean_contract.functions.balanceOf(contract_address).call()
        print(f"BEAN Balance on Contract: {bean_balance} BEAN")
    
    except Exception as e:
        print(f"Error fetching contract balances: {e}")

def approve_bean_transfer(amount):
    try:
        # Approve the contract to spend BEAN tokens
        txn = bean_contract.functions.approve(contract_address, int(amount)).build_transaction({
            "chainId": 137,
            "gas": 300000,
            "gasPrice": web3.to_wei('50', 'gwei'),
            "nonce": web3.eth.get_transaction_count(wallet_address)
        })
        signed_txn = web3.eth.account.sign_transaction(txn, private_key=private_key)
        tx_hash = web3.eth.send_raw_transaction(signed_txn.raw_transaction)
        print(f"BEAN Approve Transaction Sent: {web3.to_hex(tx_hash)}")
        receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        print(f"BEAN Approve Transaction Confirmed: {receipt.transactionHash.hex()}")
    except Exception as e:
        print(f"Error approving BEAN transfer: {e}")

def approve_dai_transfer(amount):
    try:
        # Approve the contract to spend DAI tokens
        txn = dai_contract.functions.approve(contract_address, web3.to_wei(amount, 'ether')).build_transaction({
            "chainId": 137,
            "gas": 300000,
            "gasPrice": web3.to_wei('50', 'gwei'),
            "nonce": web3.eth.get_transaction_count(wallet_address),
        })
        signed_txn = web3.eth.account.sign_transaction(txn, private_key=private_key)
        tx_hash = web3.eth.send_raw_transaction(signed_txn.raw_transaction)
        print(f"DAI Approve Transaction Sent: {web3.to_hex(tx_hash)}")
        receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        print(f"DAI Approve Transaction Confirmed: {receipt.transactionHash.hex()}")
    except Exception as e:
        print(f"Error approving DAI transfer: {e}")

def transfer_bean_to_contract(amount):
    try:
        txn = bean_contract.functions.transfer(contract_address, int(amount)).build_transaction({
            "chainId": 137,
            "gas": 300000,
            "gasPrice": web3.to_wei('50', 'gwei'),
            "nonce": web3.eth.get_transaction_count(wallet_address),
        })
        signed_txn = web3.eth.account.sign_transaction(txn, private_key=private_key)
        tx_hash = web3.eth.send_raw_transaction(signed_txn.raw_transaction)
        print(f"BEAN Transfer Transaction Sent: {web3.to_hex(tx_hash)}")
        receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        print(f"BEAN Transfer Transaction Confirmed: {receipt}")
    except Exception as e:
        print(f"Error transferring BEAN: {e}")

def transfer_dai_to_contract(amount):
    try:
        txn = dai_contract.functions.transfer(contract_address, web3.to_wei(amount, 'ether')).build_transaction({
            "chainId": 137,
            "gas": 300000,
            "gasPrice": web3.toWei('50', 'gwei'),
            "nonce": web3.eth.get_transaction_count(wallet_address),
        })
        signed_txn = web3.eth.account.sign_transaction(txn, private_key=private_key)
        tx_hash = web3.eth.send_raw_transaction(signed_txn.raw_transaction)
        print(f"DAI Transfer Transaction Sent: {web3.to_hex(tx_hash)}")
        receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        print(f"DAI Transfer Transaction Confirmed: {receipt.transactionHash.hex()}")
    except Exception as e:
        print(f"Error transferring DAI: {e}")

def check_LPcontract_bean_approval():
    try:
        allowance = bean_contract.functions.allowance(wallet_address, contract_address).call()
        print(f"LP Contract Approved BEAN for contract: {web3.from_wei(allowance, 'ether')} BEAN")
    except Exception as e:
        print(f"Error checking BEAN approval: {e}")

def check_LPcontract_dai_approval():
    try:
        allowance = dai_contract.functions.allowance(wallet_address, contract_address).call()
        print(f"LP Contract Approved DAI for contract: {web3.from_wei(allowance, 'ether')} DAI")
    except Exception as e:
        print(f"Error checking DAI approval: {e}")

def check_wallet_bean_approval():
    try:
        allowance = bean_contract.functions.allowance(wallet_address, contract_address).call()
        print(f"Wallet Approved BEAN for contract: {web3.from_wei(allowance, 'ether')} BEAN")
    except Exception as e:
        print(f"Error checking BEAN approval: {e}")

def check_wallet_dai_approval():
    try:
        allowance = dai_contract.functions.allowance(wallet_address, contract_address).call()
        print(f"Wallet Approved DAI for contract: {web3.from_wei(allowance, 'ether')} DAI")
    except Exception as e:
        print(f"Error checking DAI approval: {e}")
        


def printMenu():
    #print a home menu of options for each of the functions
    print("1. Get Token Addresses")
    print("2. Get Reserves")
    print("3. Get Total Supply")
    print("4. Get LP Token Balance")
    print("5. Get Symbol")
    print("6. Get Name")
    print("7. Get K Last")
    print("8. Sync Pool")
    print("9. Skim Excess Balances")
    print("10. Burn LP Tokens")
    print("11. Check Balances")
    print("12. Transfer Tokens to Contract")
    print("13. Mint LP Tokens")
    print("14. Rebalance Pool")
    print("15. Check Contract Balances")
    print("88. Check Approvals")
    print("89. Approve Bean Transfer")
    print("90. transfer Bean to contract")
    print("91. Approve DAI Transfer")
    print("92. transfer DAI to contract")
    print("99. Print Contract Functions")
    print("0. Exit\n")




# Get user input
def get_user_input():
    while True:
        printMenu()
        try:
            option = int(input("Enter an option: "))
            if option == 1:
                get_token_addresses()
            elif option == 2:
                get_reserves()
            elif option == 3:
                get_total_supply()
            elif option == 4:
                get_lp_token_balance()
            elif option == 5:
                get_symbol()
            elif option == 6:
                get_name()
            elif option == 7:
                get_k_last()
            elif option == 8:
                sync_pool()
            elif option == 9:
                skim_excess_balances()
            elif option == 10:
                burn_lp_tokens()
            elif option == 11:
                check_balances()
            elif option == 12:
                dai_amount = float(input("Enter the amount of DAI to transfer: "))
                bean_amount = float(input("Enter the amount of BEAN to transfer: "))
                transfer_tokens_to_contract(web3.to_wei(dai_amount, 'ether'), web3.to_wei(bean_amount, 'ether'))
            elif option == 13:
                mint_lp_tokens()
            elif option == 14:
                dai_to_add = float(input("Enter the amount of DAI to add: "))
                reserve_dai, reserve_bean = get_reserves()
                # print data type of reserve_dai and reserve_bean
                print(type(reserve_dai), type(reserve_bean))
                print(f"Reserve DAI: {reserve_dai}, \nReserve BEAN: {reserve_bean}")
                bean_to_add = rebalance(Decimal(dai_to_add), reserve_dai, reserve_bean)
                print(f"Adding {bean_to_add} BEAN and {dai_to_add} to rebalance.")
                transfer_tokens_to_contract(web3.to_wei(dai_to_add, 'ether'), web3.to_wei(bean_to_add, 'ether'))
                mint_lp_tokens()
            elif option == 15:
                check_contract_balances()
            elif option == 88:
                print("Checking approvals...")
                check_LPcontract_bean_approval()
                check_LPcontract_dai_approval()
                check_wallet_bean_approval()
                check_wallet_dai_approval()
            elif option == 89:
                amount = float(input("Enter the amount of BEAN to approve: "))
                approve_bean_transfer(amount)
            elif option == 90:
                amount = float(input("Enter the amount of BEAN to transfer: "))
                transfer_bean_to_contract(amount)
            elif option == 91:
                amount = float(input("Enter the amount of DAI to approve: "))
                approve_dai_transfer(amount)
            elif option == 92:
                amount = float(input("Enter the amount of DAI to transfer: "))
                transfer_dai_to_contract(amount)
            elif option == 99:
                printContractFuntions()    
            elif option == 0:
                print("Exiting program.")
                break  # Exit the loop and terminate the program
            else:
                print("Invalid option. Please try again.")
                get_user_input()
        except ValueError:
            print("Invalid input. Please enter a number.")

# main wrapper
if __name__ == "__main__":
    get_user_input()    

