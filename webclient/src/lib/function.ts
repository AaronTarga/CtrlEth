import { Transaction, ContractEvent } from "../types/types";

export type Occurences = {
    [key: string]: number;
}

export type FormattedOccurences = {
    key: string;
    value: number;
}

export function extractFunctions(transactions: Array<Transaction>): Occurences {
    let functionOccurences: Occurences = {}
    transactions.forEach((transaction) => {
        if (functionOccurences[transaction.functionName] === undefined) {
            functionOccurences[transaction.functionName] = 1;
        } else {
            functionOccurences[transaction.functionName] += 1;
        }
    })

    return functionOccurences;

}

export function extractEvents(transactions: Array<ContractEvent>): Occurences {
    let functionOccurences: Occurences = {}
    transactions.forEach((contractEvent) => {
        if (functionOccurences[contractEvent.signature] === undefined) {
            functionOccurences[contractEvent.signature] = 1;
        } else {
            functionOccurences[contractEvent.signature] += 1;
        }
    })

    return functionOccurences;

}

export function sortOccurences(occurences: Occurences): Array<FormattedOccurences> {
    // Create items array
    var listOccurences = Object.keys(occurences).map(function (key: string) {
        return [key, occurences[key]];
    });
    // Sort the array based on the second element
    listOccurences.sort((first: Array<any>, second: Array<any>) => {
        return second[1] - first[1];
    });

    return listOccurences.map((value) => {
        return ({
            key: value[0] as string,
            value: value[1] as number
        })
    })
}