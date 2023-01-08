from utils.source import categorize_abi_names
import json

# TODO basically just one or two test cases mocking get_analysis

abi = json.loads('''[
    {
    "constant": false,
    "inputs": [
      {
        "name": "punkIndex",
        "type": "uint256"
      }
    ],
    "name": "enterBidForPunk",
    "outputs": [],
    "payable": true,
    "type": "function"
  },
   {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "punkIndex",
        "type": "uint256"
      }
    ],
    "name": "Assign",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "punkIndex",
        "type": "uint256"
      }
    ],
    "name": "PunkNoLongerForSale",
    "type": "event"
  }
    ]''')

invalid_abi = json.loads('''[
   {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "punkIndex",
        "type": "uint256"
      }
    ],
    "name": "Assign",
    "type": "eventer"
  }
    ]''')

def test_abi_categorization_none():
    assert categorize_abi_names(None) == ([], [])

def test_wrong_type_abi_categorization():
    assert categorize_abi_names("This is no abi") == ([],[])

def test_invalid_entry_abi_categorization():
    assert categorize_abi_names(invalid_abi) == ([], ["totalSupply()"])

def test_valid_abi_categorization():
    assert categorize_abi_names(abi) == (["Assign(address,uint256)","PunkNoLongerForSale(uint256)"], ["enterBidForPunk(uint256)","totalSupply()"])
