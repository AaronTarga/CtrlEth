import { Grid, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { edgeColors, edgeNames, FunctionDict, iconImages, NodeType } from '../../types/types';
import CircleIcon from '@mui/icons-material/Circle';
import Function from '../../Components/Function';

const icons = Object.keys(iconImages).map((key: string) => (
  <ListItem key={key}>
    <ListItemIcon>{<img alt={key} src={iconImages[key as NodeType]} />}</ListItemIcon>
    <ListItemText>{key.at(0)?.toUpperCase() + key.slice(1)}</ListItemText>
  </ListItem>
));
const edgeTypes = Object.keys(edgeColors).map((key: string) => (
  <ListItem key={key}>
    <ListItemIcon>
      <CircleIcon style={{ color: edgeColors[key] }} />
    </ListItemIcon>
    <ListItemText>{edgeNames[key]}</ListItemText>
  </ListItem>
));

export type LegendProps = {
  functionColors: FunctionDict;
};

export default function Legend({ functionColors }: LegendProps) {
  const functionTypes = Object.keys(functionColors).map((key: string) => {
    const noFunction = '0';

    const shortFunction = functionColors[key].name;

    let fullFunction: any = undefined;
    if (key !== noFunction && key !== shortFunction) {
      fullFunction = key;
    }

    return (
      <ListItem key={key}>
        <ListItemIcon>
          <CircleIcon style={{ color: functionColors[key].color }} />
        </ListItemIcon>
        <ListItemText>
          {fullFunction !== undefined ? (
            <Function shortFunction={shortFunction} fullFunction={fullFunction} />
          ) : (
            <p>{shortFunction}</p>
          )}
        </ListItemText>
      </ListItem>
    );
  });

  return (
    <Grid container spacing={2} direction="row" justifyContent="space-evenly">
      <Grid item>
        <h4>Icons</h4>
        <List>
          <>{icons}</>
        </List>
      </Grid>
      {Object.keys(functionColors).length > 0 && (
        <Grid item>
          <h4>Function</h4>
          <List>
            <>{functionTypes}</>
          </List>
        </Grid>
      )}
      <Grid item>
        <List>
          <h4>Edges</h4>
          <>{edgeTypes}</>
        </List>
      </Grid>
    </Grid>
  );
}
