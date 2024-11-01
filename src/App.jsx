import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Box,
  Grid,
  Container,
  TextField,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';

function App() {
  const initialData = [
    { vendors: 1, zone1: 40, zone2: 24, zone3: 32 },
    { vendors: 2, zone1: 54, zone2: 47, zone3: 46 },
    { vendors: 3, zone1: 78, zone2: 63, zone3: 70 },
    { vendors: 4, zone1: 99, zone2: 78, zone3: 84 }
  ];

  const [data, setData] = useState(initialData);
  const [results, setResults] = useState(null);
  const [stageResults, setStageResults] = useState({
    stage3: [],
    stage2: [],
    stage1: [],
    optimalSolutions: []
  });

  const handleInputChange = (rowIndex, field) => (event) => {
    const value = event.target.value;
    const newValue = value === '' ? 0 : Math.max(0, parseInt(value, 10));
    
    setData(prevData => {
      const newData = [...prevData];
      newData[rowIndex] = {
        ...newData[rowIndex],
        [field]: newValue || 0
      };
      return newData;
    });
    
    // Limpiar resultados cuando se modifican los datos
    setStageResults({
      stage3: [],
      stage2: [],
      stage1: [],
      optimalSolutions: []
    });
    setResults(null);
  };

  const getSales = (zone, vendors) => {
    if (vendors <= 0) return 0;
    if (vendors > data.length) vendors = data.length;
    return data[vendors - 1][`zone${zone}`];
  };

  // Stage 3: Zona Sur
  const solveStage3 = (remainingVendors) => {
    const stage3Results = [];

    for (let vendors = 1; vendors <= Math.min(4, remainingVendors); vendors++) {
      const sales = getSales('3', vendors);
      const resultRow = {
        vendors,
        sales1: null,
        sales2: null,
        sales3: null,
        sales4: null,
        f: sales,
        decision: vendors
      };

      resultRow[`sales${vendors}`] = sales;

      stage3Results.push(resultRow);
    }

    return stage3Results;
  };

  // Stage 2: Zona Centro
  const solveStage2 = (remainingVendors, stage3Results) => {
    const stage2Results = [];

    for (let totalVendors = 2; totalVendors <= Math.min(5, remainingVendors); totalVendors++) {
      const resultRow = {
        vendors: totalVendors,
        sales1: null,
        sales2: null,
        sales3: null,
        sales4: null,
        f: 0,
        decision: 0
      };

      let maxSales = -1;

      for (let vendors = 1; vendors <= Math.min(4, totalVendors - 1); vendors++) {
        const centerSales = getSales('2', vendors);
        const remainingForSouth = totalVendors - vendors;

        if (remainingForSouth >= 1 && remainingForSouth <= 4) {
          const southResult = stage3Results.find(r => r.vendors === remainingForSouth);
          const totalSales = centerSales + southResult.f;

          resultRow[`sales${vendors}`] = totalSales;

          if (totalSales > maxSales) {
            maxSales = totalSales;
            resultRow.f = maxSales;
            resultRow.decision = vendors;
          }
        }
      }

      stage2Results.push(resultRow);
    }

    return stage2Results;
  };

  // Stage 1: Zona Norte (Final)
  const solveStage1 = (totalVendors, stage2Results) => {
    const stage1Row = {
      vendors: totalVendors,
      sales1: null,
      sales2: null,
      sales3: null,
      sales4: null,
      f: 0,
      decision: 0
    };

    let maxSales = -1;
    let bestSolutions = [];

    for (let vendors = 1; vendors <= 4; vendors++) {
      const northSales = getSales('1', vendors);
      const remainingVendors = totalVendors - vendors;

      if (remainingVendors >= 2 && remainingVendors <= 5) {
        const stage2Result = stage2Results.find(r => r.vendors === remainingVendors);
        const totalSales = northSales + stage2Result.f;

        stage1Row[`sales${vendors}`] = totalSales;

        if (totalSales > maxSales) {
          maxSales = totalSales;
          stage1Row.f = maxSales;
          stage1Row.decision = vendors;
          bestSolutions = [{
            maxSales: totalSales,
            distribution: [vendors, stage2Result.decision, totalVendors - vendors - stage2Result.decision]
          }];
        } else if (totalSales === maxSales) {
          bestSolutions.push({
            maxSales: totalSales,
            distribution: [vendors, stage2Result.decision, totalVendors - vendors - stage2Result.decision]
          });
        }
      }
    }

    return { stage1Row, bestSolutions };
  };

  const solveDistribution = () => {
    const totalVendors = 6;

    const stage3Results = solveStage3(totalVendors);
    const stage2Results = solveStage2(totalVendors, stage3Results);
    const { stage1Row, bestSolutions } = solveStage1(totalVendors, stage2Results);

    setStageResults({
      stage3: stage3Results,
      stage2: stage2Results,
      stage1: [stage1Row],
      optimalSolutions: bestSolutions
    });
    setResults(bestSolutions);
  };

  const renderStageTable = (stageData, stageName) => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        {stageName}
      </Typography>
      <TableContainer component={Paper} elevation={2}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white' }}>Etapa</TableCell>
              <TableCell sx={{ color: 'white' }}>1</TableCell>
              <TableCell sx={{ color: 'white' }}>2</TableCell>
              <TableCell sx={{ color: 'white' }}>3</TableCell>
              <TableCell sx={{ color: 'white' }}>4</TableCell>
              <TableCell sx={{ color: 'white' }}>F(*)</TableCell>
              <TableCell sx={{ color: 'white' }}>D</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stageData.map((row, index) => (
              <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                <TableCell>{row.vendors}</TableCell>
                <TableCell>{row.sales1 || ''}</TableCell>
                <TableCell>{row.sales2 || ''}</TableCell>
                <TableCell>{row.sales3 || ''}</TableCell>
                <TableCell>{row.sales4 || ''}</TableCell>
                <TableCell>{row.f}</TableCell>
                <TableCell>{row.decision}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderOptimalSolutions = (solutions) => (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      {solutions.map((solution, index) => (
        <Grid item xs={12} md={6} key={index}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom align="center">
              Solución Óptima {solutions.length > 1 ? `#${index + 1}` : ''}
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Decisión</TableCell>
                  <TableCell>Vendedores</TableCell>
                  <TableCell>Ventas</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>D1</TableCell>
                  <TableCell>{solution.distribution[0]}</TableCell>
                  <TableCell>{getSales('1', solution.distribution[0])}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>D2</TableCell>
                  <TableCell>{solution.distribution[1]}</TableCell>
                  <TableCell>{getSales('2', solution.distribution[1])}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>D3</TableCell>
                  <TableCell>{solution.distribution[2]}</TableCell>
                  <TableCell>{getSales('3', solution.distribution[2])}</TableCell>
                </TableRow>
                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                  <TableCell>Z*</TableCell>
                  <TableCell colSpan={2} align="right">{solution.maxSales}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          Optimizador de Distribución de Vendedores
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Tabla de Incremento de Ventas
          </Typography>
          <TableContainer component={Paper} elevation={2}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white' }}>Vendedores</TableCell>
                  <TableCell sx={{ color: 'white' }}>Zona Norte</TableCell>
                  <TableCell sx={{ color: 'white' }}>Zona Centro</TableCell>
                  <TableCell sx={{ color: 'white' }}>Zona Sur</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, rowIndex) => (
                  <TableRow key={rowIndex} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                    <TableCell>{row.vendors}</TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={row.zone1}
                        onChange={handleInputChange(rowIndex, 'zone1')}
                        InputProps={{ inputProps: { min: 0 } }}
                        sx={{ width: '100px' }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={row.zone2}
                        onChange={handleInputChange(rowIndex, 'zone2')}
                        InputProps={{ inputProps: { min: 0 } }}
                        sx={{ width: '100px' }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={row.zone3}
                        onChange={handleInputChange(rowIndex, 'zone3')}
                        InputProps={{ inputProps: { min: 0 } }}
                        sx={{ width: '100px' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<CalculateIcon />}
            onClick={solveDistribution}
          >
            Calcular Distribución Óptima
          </Button>
        </Box>

        {stageResults.stage3.length > 0 && (
          <>
            {renderStageTable(stageResults.stage3, 'Etapa 3: Zona Sur')}
            {renderStageTable(stageResults.stage2, 'Etapa 2: Zona Centro')}
            {renderStageTable(stageResults.stage1, 'Etapa 1: Zona Norte')}
            {renderOptimalSolutions(stageResults.optimalSolutions)}
          </>
        )}
      </Paper>
    </Container>
  );
}

export default App;