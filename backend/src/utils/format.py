import datetime
from eth_utils import from_wei
from web3 import Web3

def str_timestamp_to_date(timestamp):
    int_timestamp = timestamp
    if not isinstance(timestamp,int):
        try:
            int_timestamp = int(timestamp,base=0)
        except TypeError:
            return "-"
    try:
        formatted_date = datetime.datetime.fromtimestamp(int_timestamp).strftime('%d-%m-%Y %H:%M:%S')
        return formatted_date + " UTC"
    except TypeError as error:
        print(error)
        return "-"
    
def format_transactions(transactions):
    for transaction in transactions:
        if ('gasPrice' in transaction):
            transaction['gasPrice'] = int(transaction['gasPrice'])
        else:
            transaction['gasPrice'] = None
        transaction['gasUsed'] = int(transaction['gasUsed'])
        if (transaction['gasPrice'] == None):
            transaction['fee'] = None
        else:
            transaction['fee'] =  Web3.fromWei(transaction['gasUsed'] * transaction['gasPrice'],'ether')
            transaction['gasPrice'] = Web3.fromWei(transaction['gasPrice'],'gwei')
        transaction['value'] = Web3.fromWei(int(transaction['value']),'ether')
        transaction['timeStamp'] = str_timestamp_to_date(transaction['timeStamp'])
        
    return transactions
        