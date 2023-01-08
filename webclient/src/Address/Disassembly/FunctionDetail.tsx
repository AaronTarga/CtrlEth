import { FunctionOverview, FunctionSummary } from '../../types/assembly';
import CardContent from '@mui/material/CardContent';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Function from '../../Components/Function';
import TextField from '@mui/material/TextField';
import { prettyFunctionName } from '../../lib/formatting';
import { Dispatch, useEffect, useState } from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import { FunctionFilter } from '../../types/types';

export type FunctionDetailProps = {
  functions: Array<FunctionOverview>;
  functionFilter: FunctionFilter;
  setFunctionFilter: Dispatch<FunctionFilter>;
};

const types = ['Selfdestructs', 'Calls', 'Delegates', 'Creates', 'Logs', 'Reads', 'Writes'];

function typeConditionCheck(setTypes: Array<string>, summary: FunctionSummary): boolean {
  if (setTypes.includes('Selfdestructs') && !summary.has_selfdestructs) {
    return false;
  }

  if (setTypes.includes('Calls') && !summary.has_calls) {
    return false;
  }

  if (setTypes.includes('Delegates') && !summary.has_delegate) {
    return false;
  }

  if (setTypes.includes('Creates') && !summary.has_creates && !summary.has_create2s) {
    return false;
  }

  if (setTypes.includes('Logs') && !summary.has_logs) {
    return false;
  }

  if (setTypes.includes('Reads') && !summary.has_reads) {
    return false;
  }

  if (setTypes.includes('Writes') && !summary.has_writes) {
    return false;
  }

  return true;
}

export default function FunctionDetail({ functions, functionFilter, setFunctionFilter }: FunctionDetailProps) {
  const [currentFunctions, setCurrentFunction] = useState<Array<FunctionOverview>>(functions);

  const filterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFunctionFilter({
      ...functionFilter,
      name: event.target.value,
    });
  };

  const handleTypeChange = (event: SelectChangeEvent<typeof functionFilter.types>) => {
    const {
      target: { value },
    } = event;
    setFunctionFilter({
      ...functionFilter,
      types: typeof value === 'string' ? value.split(',') : value,
    });
  };

  useEffect(() => {
    var newFunctions = functions.filter((_function: FunctionOverview) =>
      _function.function.name.toLowerCase().includes(functionFilter.name.toLowerCase())
    );

    newFunctions = newFunctions.filter((_function: FunctionOverview) =>
      typeConditionCheck(functionFilter.types, _function.function)
    );

    setCurrentFunction(newFunctions);
  }, [functionFilter, functions]);

  return (
    <>
      <TextField
        style={{ margin: '2em' }}
        id="name-filter"
        label="Name Filter"
        variant="outlined"
        value={functionFilter.name}
        onChange={filterChange}
      />
      <FormControl sx={{ m: '2em', width: 300 }}>
        <InputLabel id="types-filter">Types Filter</InputLabel>
        <Select
          labelId="multi-type-label"
          id="multi-type-select"
          multiple
          value={functionFilter.types}
          onChange={handleTypeChange}
          input={<OutlinedInput id="select-multiple-chip" label="Types Filter" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
        >
          {types.map((name) => (
            <MenuItem key={name} value={name}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <List style={{ alignItems: 'center' }}>
        {currentFunctions.map((_function: FunctionOverview) => {
          const shortName = prettyFunctionName(_function.function.name);

          return (
            <ListItem
              key={shortName}
              style={{ textAlign: 'center', maxWidth: '500px', width: '70%', margin: '0 auto' }}
            >
              <Card elevation={3} style={{ margin: '1em', padding: '1em', width: '100%' }}>
                {shortName !== _function.function.name && (
                  <Function shortFunction={shortName} fullFunction={_function.function.name} title={true} />
                )}
                {shortName === _function.function.name && <h2>{_function.function.name}</h2>}
                <CardContent>
                  {_function.entrypoint && (
                    <Typography marginBottom={'2em'}>Starting Block: {_function.entrypoint?.block}</Typography>
                  )}
                  <Stack direction="row" spacing={1} justifyContent="center">
                    {_function.function.has_selfdestructs && <Chip label="Selfdestructs" />}
                    {_function.function.has_calls && <Chip label="Calls" />}
                    {_function.function.has_delegate && <Chip label="Delegate" />}
                    {_function.function.has_creates && <Chip label="Creates" />}
                    {_function.function.has_create2s && <Chip label="Creates" />}
                    {_function.function.has_logs && <Chip label="Logs" />}
                    {_function.function.has_reads && <Chip label="Reads" />}
                    {_function.function.has_writes && <Chip label="Writes" />}
                  </Stack>
                </CardContent>
              </Card>
            </ListItem>
          );
        })}
      </List>
    </>
  );
}
