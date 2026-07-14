import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { Box } from '@mui/material';

export const LineChartComponent = ({ data, dataKey = 'value', xKey = 'name', title = 'Line Chart' }) => {
  const muiTheme = useMuiTheme();

  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
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
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={muiTheme.palette.primary.main}
            strokeWidth={2}
            dot={{ fill: muiTheme.palette.primary.main }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};
