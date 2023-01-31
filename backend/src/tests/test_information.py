from unittest.mock import Mock, MagicMock, patch
from utils.information import etherscan_contract_creation, etherscan_transactions, retrieve_events


@patch('utils.information.requests')
def test_basic_information_malformed(request_mock):
    eth = Mock()
    hash = "0x581a39e160575f3beed955f7185dd9302e56e1822b8f8946c81c9f29d9ff3430"
    creator = "0xaf64d797f9c2364ad614476188d5ac9443812f99"
    timestamp = "1673175191"
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        'txhash': hash,
        'contractCreator': creator,
    }

    eth.get_proxy_transaction_by_hash = Mock(return_value=16361554)
    eth.get_proxy_block_by_number = Mock(return_value={"timestamp": timestamp})
    request_mock.get.return_value = mock_response
    address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"

    assert etherscan_contract_creation(address, eth) == (None, None, None)


@patch('utils.information.requests')
def test_basic_information_valid(request_mock):
    eth = Mock()
    hash = "0x581a39e160575f3beed955f7185dd9302e56e1822b8f8946c81c9f29d9ff3430"
    creator = "0xaf64d797f9c2364ad614476188d5ac9443812f99"
    timestamp = "1673175191"
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "message": "OK",
        "result": [{
            'txHash': hash,
            'contractCreator': creator,
        }
        ]

    }

    eth.get_proxy_transaction_by_hash = Mock(
        return_value={"blockNumber": 16361554})
    eth.get_proxy_block_by_number = Mock(return_value={"timestamp": timestamp})
    request_mock.get.return_value = mock_response
    address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"

    assert etherscan_contract_creation(
        address, eth) == (eth.get_proxy_transaction_by_hash(), creator, timestamp)


def test_empty_transaction_retrieval():
    address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
    eth = Mock()
    eth.get_normal_txs_by_address = Mock(return_value=[])
    eth.get_internal_txs_by_address = Mock(return_value=[])
    eth.get_proxy_block_number = Mock(return_value="16361554")
    assert etherscan_transactions(address, eth, 100000) == ([], [])


def test_random_transaction_data_retrieval():
    address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
    normal = ["sent 1 eth", "sent 2 eth"]
    internal = ["sent internal 0.3 eth", "sent internal 3.2 eth"]
    eth = Mock()
    eth.get_normal_txs_by_address = Mock(return_value=normal)
    eth.get_internal_txs_by_address = Mock(return_value=internal)
    eth.get_proxy_block_number = Mock(return_value="16361554")
    assert etherscan_transactions(address, eth, 100000) == (normal, internal)


@patch('utils.information.web3prov')
def test_empty_event_retrieval(web3_mock):
    mock_response = Mock(return_value=[])
    address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
    eth = Mock()
    web3_mock.eth.get_logs = mock_response
    eth.get_proxy_block_number = Mock(return_value="16361554")
    assert retrieve_events(address, eth, 100000, 10000) == []


@patch('utils.information.web3prov')
def test_random_event_data_retrieval(web3_mock):
    test_events = ["loggin some transfer",
                   "logging another transfer", "another one"]
    reverse_events = test_events
    reverse_events.reverse()
    mock_response = Mock(return_value=test_events)
    address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
    eth = Mock()
    web3_mock.eth.get_logs = mock_response
    eth.get_proxy_block_number = Mock(return_value="16361554")

    assert retrieve_events(address, eth, 100000, 10000) == reverse_events
