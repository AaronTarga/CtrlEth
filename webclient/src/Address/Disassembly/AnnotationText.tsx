import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItemText';
import { CenteredItem } from '../../Components/Layout';
import CardContent from '@mui/material/CardContent';
import Card from '@mui/material/Card';
import styled from '@emotion/styled';
import { FormattedAnnotation, FormattedSubAnnotation } from '../../lib/formatting';
import { Fragment } from 'react';

const BlockCard = styled(Card)((props) => ({
  margin: '1em',
  elevation: 2,
  overflowWrap: 'anywhere',
}));

export type AnnotationProps = {
  pc: number;
  name: string;
  annotations: Array<FormattedAnnotation>;
};

export default function AnnotationText({ pc, name, annotations }: AnnotationProps) {
  const elementAnnotations = annotations.map((annotation: FormattedAnnotation, index: number) => {
    const items = annotation.annotations.map((subAnnotation: FormattedSubAnnotation) => {
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
      </Fragment>
    );
  });

  return (
    <BlockCard>
      <CardContent>
        <Typography gutterBottom variant="h5">
          {pc} {name}
        </Typography>
        {elementAnnotations}
      </CardContent>
    </BlockCard>
  );
}
