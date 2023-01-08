import Code from '../../Components/Code';
import ExpandableItem from '../../Components/ExpandableItem';
import Function from '../../Components/Function';
import { generate_block_data } from '../../lib/disassembly';
import { FunctionDict } from '../../types/types';
import { Annotation, BaseAnnotation, Block } from '../../types/assembly';
import AnnotationText, { AnnotationProps } from './AnnotationText';
import { useState, useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { CenteredItem } from '../../Components/Layout';
import { formatAnnotation, FormattedAnnotation } from '../../lib/formatting';
import TextField from '@mui/material/TextField';

export type BlockDetailProps = {
  blockDetail: Block | undefined;
  setBlockDetail: React.Dispatch<React.SetStateAction<Block | undefined>>;
  functionColors: FunctionDict;
};

export default function BlockDetail({ blockDetail, setBlockDetail, functionColors }: BlockDetailProps) {
  const [filteredAnnotations, setFilteredAnnotations] = useState<Array<AnnotationProps>>();
  const [code, setCode] = useState<string>('');
  const [descriptions, setDescriptions] = useState<any[]>([]);
  const [formattedAnnotations, setFormattedAnnotations] = useState<AnnotationProps[]>([]);
  const [filterText, setFilterText] = useState<string>('');

  const filterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterText(event.target.value);
  };

  useEffect(() => {
    setFilteredAnnotations(
      formattedAnnotations.filter((annotation: AnnotationProps) =>
        `${annotation.pc} ${annotation.name}`.toLowerCase().includes(filterText.toLowerCase())
      )
    );
  }, [filterText, formattedAnnotations]);

  useEffect(() => {
    if (blockDetail !== undefined) {
      const {
        code: tempCode,
        descriptions: tempDescriptions,
        annotations: tempAnnotations,
      } = generate_block_data(blockDetail.instructions);

      const tempFormattedAnnotations: Array<AnnotationProps> = tempAnnotations
        .map((wrappedAnnotation: Annotation) => {
          const formattedAnnotations = wrappedAnnotation.annotations
            .map((annotation: BaseAnnotation) => formatAnnotation(annotation))
            .filter((item) => item) as Array<FormattedAnnotation>;
          return {
            pc: wrappedAnnotation.header.pc,
            name: wrappedAnnotation.header.name,
            annotations: formattedAnnotations,
          };
        })
        .filter((item) => item.annotations.length > 0);

      setCode(tempCode);
      setDescriptions(tempDescriptions);
      setFormattedAnnotations(tempFormattedAnnotations);
      setFilteredAnnotations(tempFormattedAnnotations);
    }
  }, [blockDetail]);

  if (blockDetail === undefined) {
    return <p>Select a node to display information</p>;
  }

  const noFunction = '0';

  const functionKey: string = blockDetail.function !== undefined ? blockDetail.function : noFunction;

  const shortFunction = functionColors[functionKey] ? functionColors[functionKey].name : undefined;

  let fullFunction: any = undefined;
  if (functionKey !== noFunction && blockDetail.function !== shortFunction) {
    fullFunction = blockDetail.function;
  }

  return (
    <>
      <h1>{blockDetail.i}</h1>
      {fullFunction !== undefined && shortFunction !== undefined ? (
        <Function shortFunction={shortFunction} fullFunction={fullFunction} title={true} />
      ) : (
        <h2>{shortFunction}</h2>
      )}
      <ExpandableItem title="Code">
        <Code code={code} language="assembly" />
      </ExpandableItem>
      <ExpandableItem title="Descriptions">
        <List>
          {descriptions.map((description: any) => (
            <ListItem key={description.pc}>
              <CenteredItem primary={`${description.pc} ${description.text}`} />
            </ListItem>
          ))}
        </List>
      </ExpandableItem>
      {formattedAnnotations && filteredAnnotations && formattedAnnotations.length > 0 && (
        <ExpandableItem title="Annotations">
          <TextField
            style={{ margin: '1em' }}
            id="outlined-basic"
            label="Filter"
            value={filterText}
            variant="outlined"
            onChange={filterChange}
          />
          {filteredAnnotations.map((annotationProp: AnnotationProps) => {
            return (
              <AnnotationText
                key={`${annotationProp.pc}-${annotationProp.name}`}
                pc={annotationProp.pc}
                name={annotationProp.name}
                annotations={annotationProp.annotations}
              />
            );
          })}
        </ExpandableItem>
      )}
    </>
  );
}
