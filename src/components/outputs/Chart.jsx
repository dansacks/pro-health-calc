// src/components/outputs/Chart.jsx
import React, { useState } from 'react';
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Scatter, Area
} from 'recharts';
import { calculateBreakEvenOffsetAt } from '../../calculations';

const Chart = ({ inputs, outputs }) => {
  const [activePoint, setActivePoint] = useState(null);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Ensure only showing tooltip for the Breakeven Line
      const breakevenData = payload.find(p => p.name === 'Breakeven Line');
      if (breakevenData) {
        setActivePoint({ x: label, y: breakevenData.value });
        return (
          <div className="custom-tooltip-content" style={{ backgroundColor: 'white', padding: '0 10px', border: '1px solid black', color: 'black' }}>
            <p className="label">{`Panel Size: ${label.toFixed(0)}`}</p>
            <p className="intro">{`Offset: ${breakevenData.value}%`}</p>
          </div>
        );
      }
    } else {
      setActivePoint(null);
    }

    return null;
  };

  const calculateOffset = (x) => calculateBreakEvenOffsetAt(x, inputs, outputs);

  const newBreakevenLine = [
    { x: inputs.panelSizeProactive,       y: calculateOffset(inputs.panelSizeProactive / inputs.panelSizeBaseline)},
    { x: inputs.panelSizeBaseline * 0.25, y: calculateOffset(0.25) },
    { x: inputs.panelSizeBaseline * 0.5,  y: calculateOffset(0.5)  },
    { x: inputs.panelSizeBaseline * 2/3,  y: calculateOffset(2/3)  },
    { x: inputs.panelSizeBaseline,        y: calculateOffset(1)    },
    { x: inputs.panelSizeBaseline * 1.5,  y: calculateOffset(1.5)  },
    { x: inputs.panelSizeBaseline * 2,    y: calculateOffset(2)    },
    { x: inputs.panelSizeBaseline * 4,    y: calculateOffset(4)    },
  ];

  // Sort the breakeven line data by the x value
  newBreakevenLine.sort((a, b) => a.x - b.x);

  const inputSizeAndOffset = [
    { x: inputs.panelSizeProactive, y: inputs.hospitalCostOffset }
  ];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart margin={{ top: 15, right: 30, left: 20, bottom: 20 }} >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="x" type="number" stroke="white"
               label={{
                 value: 'Panel Size',
                 position: 'insideBottom',
                 offset: -10,
                 style: { fontSize: '20px', fontWeight: 'bold', fill: '#F7F7F7' },
               }}
        />
        <YAxis stroke="white"
               label={{
                 value: 'Offset%',
                 angle: -90,
                 position: 'insideLeft',
                 dy: 30,
                 style: { fontSize: '20px', fontWeight: 'bold', fill: '#F7F7F7' },
               }}
        />
        <Tooltip content={<CustomTooltip />} position={{ x: '90%', y: 30 }} />
        <Legend
            layout="horizontal"
            align="center"
            verticalAlign="top"
            wrapperStyle={{ paddingBottom: 20 }}
        />
        <Line
          type="monotone"
          data={newBreakevenLine}
          dataKey="y"
          name="Breakeven Line"
          stroke="white"
          strokeWidth={3}
          dot={(dotProps) => {
            const { cx, cy, payload } = dotProps;
            const isActive = activePoint && activePoint.x === payload.x && activePoint.y === payload.y;
            return (
              <circle
                cx={cx}
                cy={cy}
                r={isActive ? 8 : 4}
                stroke={isActive ? 'black' : 'white'}
                strokeWidth={isActive ? 2 : 1}
                fill="white"
              />
            );
          }}
        />
        {/*Shade area below BreakevenLine*/}
        <Area
            type="monotone"
            data={newBreakevenLine}
            dataKey="y"
            fill="#ef5350"
            stroke="none"
            baseValue="dataMin"
            legendType="none"
            isAnimationActive={true}
        />
        {/*Shade area above BreakevenLine*/}
        <Area
            type="monotone"
            data={newBreakevenLine}
            dataKey="y"
            fill="#9fdbff"
            stroke="none"
            baseValue="dataMax"
            legendType="none"
            isAnimationActive={true}
        />

        <Scatter
          name="Input Size and Offset"
          data={inputSizeAndOffset}
          dataKey="y"
          fill="#927b86"
          stroke={'black'}
          strokeWidth={2}
          shape={(dotProps) => {
            const { cx, cy, payload } = dotProps;
            const isActive = activePoint && activePoint.x === payload.x && activePoint.y === payload.y;
            return (
              <circle
                cx={cx}
                cy={cy}
                r={isActive ? 8 : 4}
                stroke={'black'}
                strokeWidth={isActive ? 2 : 2}
                fill="#927b86"
              />
            );
          }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default Chart;
