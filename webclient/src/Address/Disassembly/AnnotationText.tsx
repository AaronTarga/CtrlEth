import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItemText';
import { CenteredItem } from '../../Components/Layout';
import CardContent from '@mui/material/CardContent';
import Card from '@mui/material/Card';
import styled from '@emotion/styled';
import { FormattedAnnotation, FormattedSubAnnotation } from '../../lib/formatting';
import React, { Fragment } from 'react';
import { Button } from '@mui/material';

const BlockCard = styled(Card)((props) => ({
  margin: '1em',
  elevation: 2,
  overflowWrap: 'anywhere',
}));

export type AnnotationProps = {
  pc: number;
  name: string;
  annotations: Array<FormattedAnnotation>;
  eventLookup: (event: string | undefined) => void;
};

export default function AnnotationText({ pc, name, annotations, eventLookup }: AnnotationProps) {
  // const [storageTitle,setStorageTitle] = useState('')

  const elementAnnotations = annotations.map((annotation: FormattedAnnotation, index: number) => {
    var lookupValue: string = '';

    const items = annotation.annotations.map((subAnnotation: FormattedSubAnnotation) => {
      if (subAnnotation.title === 'Topic 0') {
        lookupValue = subAnnotation.content;
      }
      if (subAnnotation.title === 'Slot') {
        lookupValue = subAnnotation.content;
      }
      return (
        <ListItem key={`${annotation.title}-${subAnnotation.title}`}>
          <CenteredItem primary={subAnnotation.title} secondary={subAnnotation.content} />
        </ListItem>
      );
    });

    return (
      <Fragment key={`${annotation.title}-${index})`}>
        <Typography variant="h6">{annotation.title}</Typography>
        <List>{items}</List>
        {annotation.title === 'Log' && (
          <Button onClick={() => eventLookup(lookupValue)} variant="contained" color="secondary">
            Event Name Lookup
          </Button>
        )}
        {annotation.title === 'Storage Load' && (
          <Button variant="contained" color="secondary">
            Storage Lookup
          </Button>
        )}
      </Fragment>
    );
  });

  return (
    <>
      <BlockCard>
        <CardContent>
          <Typography gutterBottom variant="h5">
            {pc} {name}
          </Typography>
          {elementAnnotations}
        </CardContent>
      </BlockCard>
    </>
  );
}

