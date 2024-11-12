import React from 'react';
import {
  Paper,
  Typography,
  Grid,
  Avatar,
  Box,
  Container,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

const DeveloperCard = ({ name, program, course, semester, imageUrl }) => (
  <Paper
    elevation={3}
    sx={{
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      transition: 'box-shadow 0.3s',
      '&:hover': {
        boxShadow: 6,
      },
    }}
  >
    <Avatar
      src={imageUrl}
      sx={{
        width: 96,
        height: 96,
        mb: 2,
        bgcolor: 'grey.200',
      }}
    >
      {!imageUrl && <PersonIcon sx={{ width: 48, height: 48, color: 'grey.400' }} />}
    </Avatar>
    <Typography variant="h6" component="h3" gutterBottom align="center">
      {name}
    </Typography>
    <Typography variant="body1" color="text.secondary" align="center" gutterBottom>
      {program}
    </Typography>
    <Typography variant="body1" color="text.secondary" align="center" gutterBottom>
      {course}
    </Typography>
    <Typography variant="body1" color="text.secondary" align="center">
      {semester}
    </Typography>
  </Paper>
);

const DevelopersSection = () => {
  const developers = [
    {
      name: "Janer Fabian Muñoz",
      program: "Ingeniería de sistemas",
      course: "Modelos Determinísticos",
      semester: "Semestre 2024-II",
      imageUrl: "/JanerMunoz.png"
    },
    {
      name: "Daniel Fernando Sánchez",
      program: "Ingeniería de sistemas",
      course: "Modelos Determinísticos",
      semester: "Semestre 2024-II",
      imageUrl: "/DanielChux.jpg"
    }
  ];

  return (
    <Box sx={{ mt: 4, mb: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom align="center" color="primary">
        Equipo de Desarrollo
      </Typography>
      <Container maxWidth="lg">
        <Grid container spacing={3} justifyContent="center">
          {developers.map((dev, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <DeveloperCard {...dev} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default DevelopersSection;