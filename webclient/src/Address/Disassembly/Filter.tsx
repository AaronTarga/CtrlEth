import { Dispatch, useState, useContext } from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import styled from '@emotion/styled';
import theme from '../../themes/theme';
import { Grid, Switch } from '@mui/material';
import { DRAWER_TOP_HEIGHT } from '../../lib/constant';
import { GraphFilter, NodeType } from '../../types/types';
import { SelectContext } from '../../Context';
import Typography from '@mui/material/Typography';
import { FunctionOverview } from '../../types/assembly';
import TextField from '@mui/material/TextField';
import Autocomplete, { AutocompleteChangeDetails, AutocompleteChangeReason } from '@mui/material/Autocomplete';

export type FilterProps = {
  filter: GraphFilter;
  setFilter: Dispatch<GraphFilter>;
  functions: Array<FunctionOverview>;
  types: { [key in NodeType]: number } | undefined;
};

const BottomBar = styled.footer`
  flex-shrink: 0;
  background-color: ${theme.palette.primary.main};
  height: ${DRAWER_TOP_HEIGHT};
`;

const nodeTypes = ['', ...Object.values(NodeType)];

export default function Filter({ filter, setFilter, functions, types }: FilterProps) {
  const handleFunctionChange = (
    event: any,
    value: unknown,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<unknown> | undefined
  ) => {
    changeFunction(value as string);
  };

  const changeFunction = (value: string) => {
    setFunctionFilter(value);
    setFilter({ ...filter, function: value });
  };

  const handleTypeChange = (
    event: any,
    value: unknown,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<unknown> | undefined
  ) => {
    changeType(value as string);
  };

  const changeType = (value: string) => {
    setTypeFilter(value);
    setFilter({ ...filter, type: value });
  };

  const clearAll = async () => {
    setFilter({ function: null, type: null });
    setFunctionFilter(null);
    setTypeFilter(null);
  };

  const [functionFilter, setFunctionFilter] = useState<string | null>(filter.function);
  const [typeFilter, setTypeFilter] = useState<string | null>(filter.type);
  const { select, setSelect } = useContext(SelectContext);

  const nodeFunctions = [
    { entrypoint: { functionName: '', block: -1 }, function: { name: '', pcs: [] } } as FunctionOverview,
    ...functions,
  ];

  const functionOptions = nodeFunctions.map((currentFunction: FunctionOverview) => {
    return currentFunction.function.name;
  });

  const getLabel = (value: string | null) => {
    if (!value) {
      return '';
    }

    var amount = 0;

    if (types) {
      amount = types[value as keyof typeof types];
    }

    return `${value} (${amount})`;
  };

  const typeOptions = nodeTypes
    .map((currentType: string): string | null => {
      const currentNodeType = NodeType[currentType as keyof typeof NodeType];
      if (types === undefined) {
        return null;
      }
      if (currentType === undefined || currentType === '') {
        return null;
      }

      if (types[currentNodeType] === 0) {
        return null;
      }

      return currentType;
    })
    .filter((item) => item);

  return (
    <>
      {functions && functions.length > 0 && (
        <>
          <Grid
            container
            direction="column"
            sx={{ height: `calc(100% - ${DRAWER_TOP_HEIGHT})`, gridAutoFlow: 'column' }}
          >
            <Grid
              container
              flexGrow={1}
              direction="column"
              alignItems="center"
              sx={{ overflow: 'auto', maxHeight: `calc(100% - ${DRAWER_TOP_HEIGHT})` }}
            >
              <Grid item>
                <h3>Function Filter</h3>
                <Autocomplete
                  id="function-select"
                  value={functionFilter}
                  options={functionOptions}
                  defaultValue={''}
                  sx={{ width: 300, mb: '1em' }}
                  onChange={handleFunctionChange}
                  renderInput={(params) => <TextField {...params} label="Function" />}
                />
                <h3>Type Filter</h3>
              </Grid>
              <Autocomplete
                id="function-select"
                options={typeOptions}
                value={typeFilter}
                getOptionLabel={(value) => getLabel(value)}
                defaultValue={''}
                sx={{ width: 300, mb: '1em' }}
                onChange={handleTypeChange}
                renderInput={(params) => <TextField {...params} label="Type" />}
              />
            </Grid>
            <Grid item alignItems="center" flexShrink={0}>
              <BottomBar>
                <FormGroup
                  sx={{ alignItems: 'center', justifyContent: 'space-evenly', flexDirection: 'row', height: '100%' }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        onClick={() => setSelect(!select)}
                        inputProps={{ 'aria-label': 'Selection Filter Switch' }}
                        color="secondary"
                        checked={select}
                        id="select-switch"
                      />
                    }
                    label={<Typography color="common.white">Show only filtered blocks</Typography>}
                  />
                  <Button onClick={clearAll} variant="contained" color="secondary" size="small">
                    Clear
                  </Button>
                </FormGroup>
              </BottomBar>
            </Grid>
          </Grid>
        </>
      )}
      {(!functions || functions.length === 0) && <p>No Filters available</p>}
    </>
  );
}
