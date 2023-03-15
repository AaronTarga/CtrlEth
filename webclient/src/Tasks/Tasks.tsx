import TasksHeader from './TasksHeader';
import { ApiError, ApiResult, Task, TaskResponse } from '../types/types';
import { ApiController, mapStatusToMessage } from '../lib/api';
import {
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { BASIC_HEADER_HEIGHT } from '../lib/constant';
import styled from '@emotion/styled';

export const CenterDiv = styled.div`
  text-align: center;
  height: calc(100% - ${BASIC_HEADER_HEIGHT});
`;

export default function Tasks() {
  const [tasks, setTasks] = useState<Array<Task>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    const apiController = new ApiController();
    let controller = new AbortController();
    const signal = controller.signal;

    apiController.getActiveTasks(signal).then((taskResponse: ApiResult<TaskResponse>) => {
      if (taskResponse.data !== null) {
        setTasks(taskResponse.data.tasks);
        setError(taskResponse.error);
      } else {
        setError(taskResponse.error);
      }

      // 299 means task is aborted and states are reset to default state
      if (taskResponse.error?.status === 299) {
        setError(null);
        setLoading(true);
      } else {
        setLoading(false);
      }
    });

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <>
      <TasksHeader />

      <CenterDiv>
        {loading && <CircularProgress color="secondary" sx={{ mt: '2em' }} />}
        {!loading && error && <Typography sx={{ pt: '2em' }}>{mapStatusToMessage(error)}</Typography>}

        {tasks.length === 0 && !loading && !error && (
          <Typography sx={{ pt: '2em' }}>No tasks running at the moment!</Typography>
        )}

        {tasks.length > 0 && !loading && (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Contract</TableCell>
                  <TableCell>Arguments</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Started at</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.contract} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row">
                      {task.contract}
                    </TableCell>
                    <TableCell>{JSON.stringify(task.args)}</TableCell>
                    <TableCell>{task.status}</TableCell>
                    <TableCell>{task.timestamp}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CenterDiv>
    </>
  );
}

