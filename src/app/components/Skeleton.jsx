import * as React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Avatar, Grid, Skeleton } from '@mui/material';

function SkeletonChildrenDemo({ loading = false }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: 300,
        margin: 2,
        padding: 4,
        borderRadius: '10px',
        backgroundColor: '#1e293b', // slate-800
        boxShadow: 3,
        marginTop:8,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
        <Box>
          {loading ? (
            <Skeleton variant="circular" width={40} height={40}>
              <Avatar />
            </Skeleton>
          ) : (
            <Avatar />
          )}
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          {loading ? (
            <Skeleton width="100%">
              <Typography>.</Typography>
            </Skeleton>
          ) : (
            <Typography variant="body2">Placeholder Name</Typography>
          )}
        </Box>
      </Box>
      <Box sx={{ width: '100%', mt: 2 }}>
        {loading ? (
          <Skeleton variant="rectangular" width="100%" height={100} />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: 100,
              borderRadius: '10px',
              backgroundColor: '#334155', // slate-700
            }}
          />
        )}
      </Box>
    </Box>
  );
}

SkeletonChildrenDemo.propTypes = {
  loading: PropTypes.bool,
};

export default function SkeletonChildren() {
  return (
    <Grid container spacing={2} justifyContent="center" sx={{ flexWrap: 'wrap' }}>
      <Grid item>
        <SkeletonChildrenDemo loading />
      </Grid>
      <Grid item>
        <SkeletonChildrenDemo loading />
      </Grid>
    </Grid>
  );
}
