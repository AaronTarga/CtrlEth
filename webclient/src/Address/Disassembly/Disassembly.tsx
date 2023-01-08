import { ApiController, mapStatusToMessage } from '../../lib/api';
import {
  DisassemblyResponse,
  FunctionDict,
  FunctionFilter,
  GraphFilter,
  NodeType,
  GraphLibNode,
  ApiResult,
  isDisassemblyState,
  DisassemblyState,
} from '../../types/types';
import { Block, FunctionOverview } from '../../types/assembly';
import React, { useEffect, useRef, useState, useContext } from 'react';
import styled from '@emotion/styled';
import { CenterDiv, DrawerView, ErrorText } from '../../Components/Layout';
import { extractTypeCount, generate_visualization, GraphData, nodesFilter } from '../../lib/disassembly';
import Legend from './Legend';
import { useAddress } from '../Address';
import GraphBar from './GraphBar';
import { HSLToRGB, RGBToHex } from '../../lib/colors';
import BlockDetail from './BlockDetail';
import { TopRightButton } from '../../Components/Layout';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { Tab, Tabs, CircularProgress, Alert, Snackbar, Typography, Button } from '@mui/material';
import { prettyFunctionName } from '../../lib/formatting';
import Paper from '@mui/material/Paper';
import theme from '../../themes/theme';
import { SelectContext } from '../../Context';
import Filter from './Filter';
import { DRAWER_TOP_HEIGHT } from '../../lib/constant';
import FunctionDetail from './FunctionDetail';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

cytoscape.use(dagre);

const GraphDiv = styled.div`
  width: 100%;
  height: 100%;
  text-align: left;
  z-index: 0;
`;

const BottomLegend = styled(Legend)`
  height: 20%;
`;

const DisassemblyContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: stretch;
  height: 100%;
  position: relative;
`;

const GraphView = styled.div`
  width: 100%;
`;

const TopBar = styled(Paper)`
  width: 100%;
  height: ${DRAWER_TOP_HEIGHT};
  background-color: ${theme.palette.secondary.main};
  color: ${theme.palette.secondary.contrastText};
  position: -webkit-sticky; /* Safari */
  position: sticky;
  top: 0;
  z-index: 10;
  vertical-align: middle;
`;

const StyledTopRightButton = styled(TopRightButton)`
  background-color: ${theme.palette.secondary.main};
  color: ${theme.palette.secondary.contrastText};

  :hover {
    background-color: ${theme.palette.secondary.main};
  }
`;

const PHI = (1 + Math.sqrt(5)) / 2;

type DrawerMode = 'detail' | 'legend' | 'filter' | 'function' | 'empty';

const drawerModes: Array<{ display: string; name: DrawerMode }> = [
  { display: 'Detail', name: 'detail' },
  { display: 'Legend', name: 'legend' },
  { display: 'Function', name: 'function' },
  { display: 'Filter', name: 'filter' },
];

export default function Disassembly() {
  const { address } = useAddress();
  const [error, setError] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<string | null>();
  const { select, setSelect } = useContext(SelectContext);
  const [filter, setFilter] = useState<GraphFilter>({ function: null, type: null });
  const [functionFilter, setFunctionFilter] = useState<FunctionFilter>({ name: '', types: [] });
  const containerRef = useRef<HTMLDivElement>(null);
  const [blockDetail, setBlockDetail] = useState<Block | undefined>(undefined);
  const [container, setContainer] = useState<any>();
  const [blockId, setBlockId] = useState<string>();
  const [functionColors, setFunctionColors] = useState<FunctionDict>({});
  const [drawerView, setDrawerView] = useState<DrawerMode>('legend');
  const [disassemblyAddress, setDisassemblyAddress] = useState<DisassemblyResponse | DisassemblyState | null>();
  const blockRef = useRef<any>();
  const [graphData, setGraphData] = useState<GraphData[]>();
  const [types, setTypes] = useState<{ [key in NodeType]: number }>();
  const [graphBarAlert, setGraphBarAlert] = useState(false);

  const startTask = () => {
    let apiController = new ApiController();
    const controller = new AbortController();
    const signal = controller.signal;
    if (address != null) {
      apiController.getAddressDisassembly(address,signal).then((result: ApiResult<DisassemblyState>) => {
        if (result.data !== null) {
          setDisassemblyAddress(result.data)
        }
      })
      
    }
     
  }

  const closeAlert = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setGraphBarAlert(false);
  };

  useEffect(() => {
    setCurrentAddress(address);
    //reset global states (filtering etc.) before loading new contract
    setFilter({ function: null, type: null });
    setSelect(false);
    setBlockDetail(undefined)
  }, [address, setSelect]);

  useEffect(() => {
    if (disassemblyAddress && !isDisassemblyState(disassemblyAddress) && disassemblyAddress.blocks !== undefined) {
      const numberId = Number(blockId);
      if (numberId && !isNaN(numberId) && numberId >= 0 && numberId < disassemblyAddress.blocks.length) {
        setBlockDetail(disassemblyAddress.blocks[numberId]);
        setDrawerView('detail');
      }
    }
  }, [blockId, disassemblyAddress]);

  const closeDrawer = () => {
    setDrawerView('empty');
  };

  const openDrawer = () => {
    setDrawerView('legend');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: DrawerMode) => {
    setDrawerView(newValue);
  };

  useEffect(() => {
    blockRef.current = disassemblyAddress;
  }, [disassemblyAddress]);

  useEffect(() => {
    if (!currentAddress) {
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    setLoading(true);
    setDisassemblyAddress(undefined);
    let apiController = new ApiController();

    apiController.getCachedDisassembly(currentAddress, signal).then((response: ApiResult<DisassemblyResponse | DisassemblyState>) => {
      if (response.data !== null) {
        setLoading(false);
        setDisassemblyAddress(response.data);
        setError(response.error)
      } else {
        setLoading(false);
        setDisassemblyAddress(response.data)
        setError(response.error)
      }
    });

    return () => {
      controller.abort();
      setDisassemblyAddress(undefined);
      setError(undefined);
    };
  }, [currentAddress, setLoading]);

  useEffect(() => {
    if (
      disassemblyAddress &&
      !isDisassemblyState(disassemblyAddress) &&
      disassemblyAddress.blocks &&
      disassemblyAddress.links
    ) {
      let nodes = disassemblyAddress.blocks.map(function (block: Block) {
        let id = block.i;
        return {
          id: id,
          icon: block.types[0],
          function: block.function,
          types: block.types,
        } as GraphLibNode;
      });

      if (nodes !== undefined) {
        var rawData = { nodes: nodes, links: disassemblyAddress['links'], functions: disassemblyAddress['functions'] };
        let newFunctionColors: FunctionDict = {};
        rawData.functions.forEach((dataFunction: FunctionOverview, index: number) => {
          // https://stackoverflow.com/questions/1168260/algorithm-for-generating-unique-colors
          if (dataFunction.function) {
            const n = index * PHI - Math.floor(index * PHI);
            const { r, g, b } = HSLToRGB(n * 255, 100, 50);
            const color = RGBToHex(r, g, b);
            const name = prettyFunctionName(dataFunction.function.name);
            newFunctionColors[dataFunction.function.name] = { name: name, color: color };
          }
        });

        const functionLength = rawData.functions.length;
        const defaultN = functionLength * PHI - Math.floor(functionLength * PHI);
        const { r, g, b } = HSLToRGB(defaultN * 255, 100, 50);
        newFunctionColors['0'] = { name: 'No Function', color: RGBToHex(r, g, b) };

        setFunctionColors(newFunctionColors);

        const data = generate_visualization(rawData, newFunctionColors);

        setGraphData(data);
      }
    }
  }, [disassemblyAddress]);

  // displaying the graph depending on filter settings
  useEffect(() => {
    if (containerRef.current && graphData && blockRef.current && blockRef.current['blocks']) {
      //https://github.com/cytoscape/cytoscape.js-dagre
      const layoutOptions = {
        name: 'dagre',
        // dagre algo options, uses default value on undefined
        nodeSep: 50, // the separation between adjacent nodes in the same rank
        edgeSep: undefined, // the separation between adjacent edges in the same rank
        rankSep: 100, // the separation between each rank in the layout
        rankDir: 'TB', // 'TB' for top to bottom flow, 'LR' for left to right,
        align: 'DL', // alignment for rank nodes. Can be 'UL', 'UR', 'DL', or 'DR', where U = up, D = down, L = left, and R = right
        acyclicer: undefined, // If set to 'greedy', uses a greedy heuristic for finding a feedback arc set for a graph.
        // A feedback arc set is a set of edges that can be removed to make a graph acyclic.
        ranker: 'network-simplex', // Type of algorithm to assign a rank to each node in the input graph. Possible values: 'network-simplex', 'tight-tree' or 'longest-path'
        minLen: function () {
          return 1;
        }, // number of ranks to keep between the source and target of the edge
        edgeWeight: function () {
          return 1;
        }, // higher weight edges are generally made shorter and straighter than lower weight edges
      };

      var cy = cytoscape({
        container: containerRef.current, // container to render in

        elements: graphData,

        style: [
          // the stylesheet for the graph
          {
            selector: 'node',
            style: {
              'background-color': '#666',
              label: 'data(label)',
              'background-image': 'data(image)',
              backgroundColor: 'data(color)',
            },
          },

          {
            selector: 'edge',
            style: {
              width: 3,
              'line-color': 'data(color)',
              'target-arrow-color': 'data(color)',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
            },
          },

          {
            selector: 'node.highlight',
            style: {
              'border-color': '#000',
              'border-width': '2px',
            },
          },
          {
            selector: 'node.contained',
            style: {
              'background-color': '#E9D61E',
            },
          },
          {
            selector: 'node.omitted',
            style: {
              'background-color': '#CBC3C1',
            },
          },
        ],

        minZoom: 0.1,
        maxZoom: 5,
        wheelSensitivity: 0.5,

        layout: layoutOptions,
      });

      // removing type from filter to avoid only showing functions as filter options
      const filterFunctionsRemoved = {
        ...filter,
        type: null,
      };

      const typeNodes = cy.nodes().filter(nodesFilter(filterFunctionsRemoved));

      setTypes(extractTypeCount(typeNodes));

      //retrieving elements matching filters and then all the others to add classes to them
      const filteredElements = cy.nodes().filter(nodesFilter(filter));
      const notMatchingElements = cy.nodes().diff(filteredElements).left;

      if (notMatchingElements.length > 0) {
        if (select) {
          notMatchingElements.forEach((ele) => {
            const nodeId = ele.id();
            cy.remove("edge[source='" + nodeId + "']");
            cy.remove("edge[target='" + nodeId + "']");
            cy.remove('#' + nodeId);
          });
          const layout = cy.makeLayout(layoutOptions);
          layout.run()
        } else {
          notMatchingElements.addClass('omitted');
          filteredElements.addClass('contained');
        }
      }

      cy.on('select', (event) => {
        const id = event.target.data()['id'];
        if (id !== null) {
          setBlockDetail(blockRef.current['blocks'][id]);
        }
        cy.$(`#${id}`).addClass('highlight');
      });

      cy.on('unselect', (event) => {
        const id = event.target.data()['id'];
        if (id !== null) {
          setBlockDetail(undefined);
        }
        cy.$(`#${id}`).removeClass('highlight');
      });

      setContainer(cy);
    }
  }, [graphData, filter, select]);

  var errorText = undefined;

  if (loading) {
    errorText = (
      <>
        <CircularProgress color="secondary" sx={{ mt: '2em' }} />
        <ErrorText>Loading data and building graph</ErrorText>
      </>
    );
  }
  var graph = undefined;
  if (!loading && !error && disassemblyAddress && !isDisassemblyState(disassemblyAddress) ) {
    graph = (
      <DisassemblyContainer>
        <GraphView style={drawerView !== 'empty' ? { width: '50%' } : {}}>
          {container && (
            <GraphBar
              container={container}
              setBlockId={setBlockId}
              closeAlert={closeAlert}
              setAlertShown={setGraphBarAlert}
            />
          )}
          <GraphDiv ref={containerRef} />
        </GraphView>
        {drawerView === 'empty' && (
          <StyledTopRightButton onClick={openDrawer} aria-label="close view" color="inherit">
            <MenuIcon />
          </StyledTopRightButton>
        )}
        {drawerView !== 'empty' && (
          <DrawerView elevation={10} square>
            <TopBar elevation={5} square>
              <TopRightButton onClick={closeDrawer} aria-label="close view" color="inherit">
                <CloseIcon />
              </TopRightButton>
              <Tabs
                value={drawerView}
                TabIndicatorProps={{
                  style: {
                    background: theme.palette.secondary.contrastText,
                  },
                }}
                textColor="inherit"
                onChange={handleTabChange}
                aria-label="Menu Tabs"
                centered
              >
                {drawerModes.map((mode: any) => (
                  <Tab className="tab" key={mode['name']} label={mode['display']} value={mode['name']} />
                ))}
              </Tabs>
            </TopBar>
            {drawerView === 'legend' && container && <BottomLegend functionColors={functionColors} />}
            {drawerView === 'detail' && container && (
              <BlockDetail blockDetail={blockDetail} setBlockDetail={setBlockDetail} functionColors={functionColors} />
            )}
            {drawerView === 'function' && container && (
              <FunctionDetail
                functions={disassemblyAddress.functions}
                functionFilter={functionFilter}
                setFunctionFilter={setFunctionFilter}
              ></FunctionDetail>
            )}
            {drawerView === 'filter' && container && (
              <Filter filter={filter} setFilter={setFilter} functions={disassemblyAddress.functions} types={types} />
            )}
          </DrawerView>
        )}
        <Snackbar open={graphBarAlert} autoHideDuration={6000} onClose={closeAlert}>
          <Alert onClose={closeAlert} severity="error" sx={{ width: '100%' }}>
            Could not find node with the specified id ...
          </Alert>
        </Snackbar>
      </DisassemblyContainer>
    );
  } else if (!error && isDisassemblyState(disassemblyAddress)) { 
    if (disassemblyAddress.state === 1) {
      return (
        <CenterDiv>
          <Typography padding="2em">
            No analysis result available yet
          </Typography>
          <Button variant="contained" color="secondary" onClick={startTask}>Start Task</Button>
        </CenterDiv>
      )
    }

    if (disassemblyAddress.state === 2) {
      return (
        <CenterDiv>
          <Typography padding="2em">
            An analysis task for this contract is already running, wait a bit for it to finish!
          </Typography>
        </CenterDiv>
      )
    }

    if (disassemblyAddress.state === 3) {
      return (
        <CenterDiv>
          <Typography padding="2em">
            An analysis for this contract task has been started!
          </Typography>
        </CenterDiv>
      )
    }
   
  } 
  else if (typeof error === 'string' && error.toLowerCase().includes('error')) {
    errorText = <ErrorText>{error}</ErrorText>;
  } else if (error && !isNaN(error) && disassemblyAddress === null) {
    errorText = <ErrorText>{mapStatusToMessage(error)}</ErrorText>;
  }

  return (
    <>
      <CenterDiv>
        {errorText}
        {!error && graph}
      </CenterDiv>
    </>
  );
}
