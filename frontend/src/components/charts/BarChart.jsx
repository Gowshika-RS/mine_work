import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { Box } from '@mui/material';

export const BarChartComponent = ({ data, dataKey = 'value', xKey = 'name' }) => {
  const muiTheme = useMuiTheme();

  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={muiTheme.palette.divider}
          />
          <XAxis 
            dataKey={xKey}
            stroke={muiTheme.palette.text.secondary}
          />
          <YAxis 
            stroke={muiTheme.palette.text.secondary}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: muiTheme.palette.background.paper,
              border: `1px solid ${muiTheme.palette.divider}`,
            }}
          />
          <Legend />
          <Bar
            dataKey={dataKey}
            fill={muiTheme.palette.primary.main}
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};
