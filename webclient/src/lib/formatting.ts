import {
    BaseAnnotation,
    Call,
    ReachAnnotation,
    StorageLoad,
    StorageWrite,
    MemoryLoad,
    MemoryWrite,
    Log,
    Return,
    Revert,
    Selfdestruct,
    Calldataload,
    Calldatacopy,
    UnconditionalJump,
    ConditionalJump,
    Push,
    SenderConstraintFunction,
    JumpTarget,
    ConstantSummary,
    FunctionEntrypoint,
    MetaDataString,
} from '../types/assembly';

export const prettyFunctionName = (functionName: string): string => {
    const names: Array<string> = functionName.split(" or ");
    let shortest: string = names[0];
    names.forEach((name: string) => {
        if (name.length < shortest.length) {
            shortest = name;
        }
    })

    return shortest;
}

export type AnnotationValue = {
    title: string;
    content: any;
};

export type FormattedSubAnnotation = {
    title: string;
    content: string;
}

export type FormattedAnnotation = {
    title: string,
    annotations: Array<FormattedSubAnnotation>
}


const createAnnotation = (title: string, values: Array<AnnotationValue>): FormattedAnnotation | null => {
    const items = values
        .map((value: AnnotationValue) => {
            const content = contentToString(value.content);
            if (content === '') {
                return null;
            }
            return { title: value.title, content: content } as FormattedSubAnnotation
        })
        .filter((item) => item) as Array<FormattedSubAnnotation>;

    if (items.length === 0) {
        return null;
    }

    return {
        title: title,
        annotations: items
    };
}

const contentToString = (content: any): string => {
    var stringContent = 'None';

    if (content) {
        if (typeof content === 'object') {
            stringContent = JSON.stringify(content);

            if (Object.keys(content).length === 0) {
                stringContent = '';
            }
        } else if (typeof content === 'number') {
            stringContent = String(Math.round(content * 100) / 100);
        } else {
            stringContent = content.toString();
        }
    }

    return stringContent;
};


export const formatAnnotation = (annotation: BaseAnnotation): FormattedAnnotation | null => {
    switch (annotation._class) {
        case 'ReachDef':
            const reaches = (annotation as ReachAnnotation).data.reaches;
            return createAnnotation('Reaches', [{ title: 'pcs', content: reaches }]);
        case 'JumpTarget':
            const target = (annotation as JumpTarget).data;
            return createAnnotation('Jump Target', [
                { title: 'Tags', content: target.tags },
                { title: 'Value', content: target.target },
            ]);
        case 'ConstantSummary':
            const constant = (annotation as ConstantSummary).data;
            return createAnnotation('Constant Summary', [
                { title: 'Tags', content: constant.tags },
                { title: 'Length', content: constant.length },
                { title: 'Value', content: constant.value },
                { title: 'Introduced at', content: constant.introduced_at },
            ]);
        case 'FunctionEntrypoint':
            const _function = (annotation as FunctionEntrypoint).data;
            return createAnnotation('Function Entrypoint', [
                { title: 'Tags', content: _function.tags },
                { title: 'Name', content: _function.function_name },
            ]);
        case 'MetaDataString':
            const metaData = (annotation as MetaDataString).data;
            return createAnnotation('Meta Data', [
                { title: 'Tags', content: metaData.tags },
                { title: 'Raw', content: metaData.raw },
                { title: 'Index', content: metaData.index },
                { title: 'Data', content: metaData.data },
                { title: 'url', content: metaData.url },
            ]);
        case 'Call':
            const call = (annotation as Call).data;
            return createAnnotation('Call', [
                { title: 'Tags', content: call.tags },
                { title: 'To', content: call.to },
                { title: 'Gas', content: call.gas },
                { title: 'Type', content: call.type },
                { title: 'Data', content: call.data },
                { title: 'Value', content: call.value },
            ]);
        case 'StorageLoad':
            const sload = (annotation as StorageLoad).data;
            return createAnnotation('Storage Load', [
                { title: 'Tags', content: sload.tags },
                { title: 'Slot', content: sload.slot },
            ]);
        case 'StorageWrite':
            const swrite = (annotation as StorageWrite).data;
            return createAnnotation('Storage Write', [
                { title: 'Tags', content: swrite.tags },
                { title: 'Slot', content: swrite.slot },
                { title: 'Value', content: swrite.value },
            ]);
        case 'MemoryWrite':
            const mwrite = (annotation as MemoryWrite).data;
            return createAnnotation('Memory Write', [
                { title: 'Tags', content: mwrite.tags },
                { title: 'Slot', content: mwrite.slot },
                { title: 'Value', content: mwrite.value },
            ]);
        case 'MemoryLoad':
            const mload = (annotation as MemoryLoad).data;
            return createAnnotation('Memory Load', [
                { title: 'Tags', content: mload.tags },
                { title: 'Slot', content: mload.slot },
            ]);
        case 'Log':
            const log = (annotation as Log).data;
            var topics: Array<AnnotationValue> = []

            if (log.topic0) {
                topics.push({ title: 'Topic 0', content: log.topic0 })
            }

            if (log.topic1) {
                topics.push({ title: 'Topic 1', content: log.topic1 })
            }

            if (log.topic2) {
                topics.push({ title: 'Topic 2', content: log.topic2 })
            }

            if (log.topic3) {
                topics.push({ title: 'Topic 3', content: log.topic3 })
            }

            return createAnnotation('Log', topics.concat([
                { title: 'Tags', content: log.tags },
                { title: 'Count', content: log.n },
                { title: 'Data', content: log.data },
            ]));
        case 'Return':
            const _return = (annotation as Return).data;
            return createAnnotation('Return', [
                { title: 'Tags', content: _return.tags },
                { title: 'Data', content: _return.data },
            ]);
        case 'Revert':
            const revert = (annotation as Revert).data;
            return createAnnotation('Revert', [
                { title: 'Tags', content: revert.tags },
                { title: 'Data', content: revert.data },
            ]);
        case 'Selfdestruct':
            const selfdestruct = (annotation as Selfdestruct).data;
            return createAnnotation('Selfdestruct', [
                { title: 'Tags', content: selfdestruct.tags },
                { title: 'Address', content: selfdestruct.address },
            ]);
        case 'Calldataload':
            const cload = (annotation as Calldataload).data;
            return createAnnotation('Calldataload', [
                { title: 'Tags', content: cload.tags },
                { title: 'Offset', content: cload.offset },
            ]);
        case 'Calldatacopy':
            const ccopy = (annotation as Calldatacopy).data;
            return createAnnotation('Calldatacopy', [
                { title: 'Tags', content: ccopy.tags },
                { title: 'Length', content: ccopy.length },
                { title: 'Memory Address', content: ccopy.mem_addr },
                { title: 'Offset', content: ccopy.offset },
            ]);
        case 'UnconditionalJump':
            const jump = (annotation as UnconditionalJump).data;
            return createAnnotation('Unconditional Jump', [
                { title: 'Tags', content: jump.tags },
                { title: 'Target', content: jump.to },
            ]);
        case 'ConditionalJump':
            const cjump = (annotation as ConditionalJump).data;
            return createAnnotation('Conditional Jump', [
                { title: 'Tags', content: cjump.tags },
                { title: 'Target', content: cjump.to },
                { title: 'Condition', content: cjump.condition },
            ]);
        case 'Push':
            const push = (annotation as Push).data;
            return createAnnotation('Push', [
                { title: 'Tags', content: push.tags },
                { title: 'Value', content: push.value },
            ]);
        case 'SenderConstraintFunction':
            const constraint = (annotation as SenderConstraintFunction).data;
            // TODO: add booleans maybe chips
            return createAnnotation('SenderConstraintFunction', [
                { title: 'Tags', content: constraint.tags },
                { title: 'Address', content: constraint.address },
                { title: 'Condition', content: constraint.condition },
                { title: 'Model', content: constraint.model },
            ]);
        default:
            return createAnnotation(
                annotation._class,
                Object.keys(annotation.data).map((value) => ({
                    title: value,
                    content: annotation.data[value as keyof typeof annotation.data],
                }))
            );
    }
};

export type AnnotationProps = {
    pc: number;
    name: string;
    annotations: Array<BaseAnnotation>;
};