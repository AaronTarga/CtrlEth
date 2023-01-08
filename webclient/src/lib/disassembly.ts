import { GraphNode, NodeLink, edgeColors, iconImages, FunctionDict, NodeType, GraphFilter } from "../types/types";
import { AnnotatedInstruction, Annotation } from "../types/assembly"
import { NodeCollection, NodeSingular } from 'cytoscape';


export type NetworkGraph = {
    nodes: any;
    edges: any;
}

export type GraphData = {
    data: object;
}


export const nodesFilter = (filterValue: GraphFilter) => {
    if (filterValue) {
        // to avoid multiple combinations of filters just compare if empty value is said(filter disabled)
        return (item: NodeSingular) => ((filterValue.function === null || filterValue.function === item.data('function'))
            && (filterValue.type === null || (item.data('types') !== undefined && item.data('types').includes(filterValue.type as NodeType))))

    }

    return (item: any) => true;

};

const mapStringToNodeType = (strType: string): NodeType | null => {
    return Object.values(NodeType).map((nodeType) => String(nodeType)).includes(strType) ? NodeType[strType as keyof typeof NodeType] : NodeType.default;
}

function countTypesInNode(node: GraphNode): Array<NodeType> {
    var nodeTypes: Array<NodeType> = [];

    if (!node.types || node.types.length === 0) {
        nodeTypes.push(NodeType.default)
    } else {
        node.types.forEach(type => {
            const mappedType = mapStringToNodeType(type);
            if (mappedType) {
                nodeTypes.push(mappedType);
            }
        })

    }

    return nodeTypes;
}

export function extractTypeCount(nodes: NodeCollection): { [key in NodeType]: number } {
    let countedTypes: { [key in NodeType]: number } = {
        [NodeType.selfdestructs]: 0,
        [NodeType.revert]: 0,
        [NodeType.returns]: 0,
        [NodeType.calls]: 0,
        [NodeType.storageReads]: 0,
        [NodeType.storageWrites]: 0,
        [NodeType.memoryReads]: 0,
        [NodeType.memoryWrites]: 0,
        [NodeType.push]: 0,
        [NodeType.logs]: 0,
        [NodeType.calldataloads]: 0,
        [NodeType.calldatacopies]: 0,
        [NodeType.creates]: 0,
        [NodeType.default]: 0

    };


    nodes.forEach((node: NodeSingular) => {
        // look in the types array of the node for all mapped types and increment the amount of the type for filter option
        // if a node has no types the default types get increased and it gets added to the node
        const types = countTypesInNode(node.data());

        types.forEach((nodeType: NodeType) => {
            countedTypes[nodeType]++
        })

    })

    return countedTypes;
}

function get_nodes(nodes: Array<any>, functionToColor: FunctionDict): GraphData[] {
    const generatedNodes = Array.from(
        nodes.map(function (node: GraphNode) {
            const color = node.function !== undefined ? functionToColor[node.function].color : functionToColor['0'].color;

            const tempNodeType = mapStringToNodeType(node.icon);
            const nodeType: NodeType = (
                tempNodeType != null ? tempNodeType : NodeType.default
            )

            const types = countTypesInNode(node);

            return {
                data: {
                    id: node.id,
                    label: String(node.id),
                    color: color,
                    function: node.function,
                    image: iconImages[nodeType],
                    imagePadding: 10,
                    type: nodeType,
                    types: types,
                }
            };
        })
    )
    return generatedNodes;
}

function get_links(links: Array<any>): GraphData[] {
    return Array.from(
        links.map(function (link: NodeLink) {
            const color = link.condition !== undefined ? edgeColors["falseCondition"] : edgeColors["trueCondition"]
            return {
                data: {
                    id: link.id,
                    source: link.source,
                    target: link.target,
                    color: color,
                }
            }
        })
    )
}

export function generate_block_data(instructions: any) {
    let code_string = '';
    let descriptions: Array<any> = []
    let annotations: Array<Annotation> = [];
    instructions.forEach((annotatedInstruction: AnnotatedInstruction) => {
        let instruction_name = annotatedInstruction.instruction._name;
        let pc = annotatedInstruction.instruction._pc;
        let operand = annotatedInstruction.instruction._operand;
        // generate code block
        code_string = `${code_string} ${pc} ${instruction_name}`;
        if (operand !== null) {
            code_string = `${code_string} ${operand} `;
        }

        code_string = `${code_string} \n`;

        // load descriptions
        let description = annotatedInstruction.instruction._description;
        descriptions.push({ text: description, pc: pc });

        // load all annotations
        annotations.push({ header: { pc: pc, name: instruction_name }, annotations: annotatedInstruction.annotations })
    });

    return {
        code: code_string, descriptions: descriptions, annotations: annotations
    }
}

export function generate_visualization(data: any, functionColors: any): GraphData[] {

    const nodes = get_nodes(data.nodes, functionColors);
    const edges = get_links(data.links)

    return nodes.concat(edges);
}