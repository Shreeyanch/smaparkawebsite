import React, { useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const GoogleStockChart = ({ 
  data = [], 
  dataKey = 'date', 
  valueKey = 'value', 
  color = '#4285f4',
  height = 300,
  width = '100%',
  showTooltip = true,
  gradientOpacity = 0.2
}) => {
  const { isDarkMode } = useTheme();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  const animationRef = useRef(null);

  const drawChart = (ctx, rect, hoveredIndex = -1) => {
    if (!data || data.length === 0) return;

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, height);

    // Margins
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = rect.width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Get min/max values
    const values = data.map(d => d[valueKey]);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1;
    const padding = valueRange * 0.1;

    // Create scales
    const xScale = (index) => margin.left + (index / Math.max(1, data.length - 1)) * chartWidth;
    const yScale = (value) => margin.top + chartHeight - ((value - minValue + padding) / (valueRange + 2 * padding)) * chartHeight;

    // Create gradient
    const gradient = ctx.createLinearGradient(0, margin.top, 0, margin.top + chartHeight);
    const hexOpacity = Math.round(gradientOpacity * 255).toString(16).padStart(2, '0');
    gradient.addColorStop(0, color + hexOpacity);
    gradient.addColorStop(1, color + '00');

    // Draw subtle grid lines
    ctx.strokeStyle = isDarkMode ? '#374151' : '#f1f5f9';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = margin.top + (i / 4) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + chartWidth, y);
      ctx.stroke();
    }

    // Create smooth path
    if (data.length > 0) {
      // Area path
      ctx.beginPath();
      ctx.moveTo(xScale(0), margin.top + chartHeight);
      ctx.lineTo(xScale(0), yScale(data[0][valueKey]));

      // Create smooth curve with more rounded points
      for (let i = 1; i < data.length; i++) {
        const x = xScale(i);
        const y = yScale(data[i][valueKey]);
        const prevX = xScale(i - 1);
        const prevY = yScale(data[i - 1][valueKey]);
        
        // Use bezier curve for smoother, more rounded transitions
        const cp1X = prevX + (x - prevX) * 0.33;
        const cp2X = prevX + (x - prevX) * 0.66;
        ctx.bezierCurveTo(cp1X, prevY, cp2X, y, x, y);
      }

      ctx.lineTo(xScale(data.length - 1), margin.top + chartHeight);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Line path with smooth rounded curves
      ctx.beginPath();
      ctx.moveTo(xScale(0), yScale(data[0][valueKey]));
      
      for (let i = 1; i < data.length; i++) {
        const x = xScale(i);
        const y = yScale(data[i][valueKey]);
        const prevX = xScale(i - 1);
        const prevY = yScale(data[i - 1][valueKey]);
        
        // Use bezier curve for smoother, more rounded transitions
        const cp1X = prevX + (x - prevX) * 0.33;
        const cp2X = prevX + (x - prevX) * 0.66;
        ctx.bezierCurveTo(cp1X, prevY, cp2X, y, x, y);
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    // Draw Y-axis labels
    ctx.fillStyle = isDarkMode ? '#d1d5db' : '#6b7280';
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= 4; i++) {
      const value = minValue + (i / 4) * valueRange;
      const y = margin.top + chartHeight - (i / 4) * chartHeight;
      const formattedValue = Math.round(value).toLocaleString();
      ctx.fillText(formattedValue, margin.left - 10, y);
    }

    // Draw X-axis labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = isDarkMode ? '#d1d5db' : '#6b7280';
    
    const maxLabels = Math.min(6, data.length);
    const labelStep = Math.max(1, Math.floor(data.length / maxLabels));
    
    for (let i = 0; i < data.length; i += labelStep) {
      const x = xScale(i);
      const label = data[i][dataKey];
      ctx.fillText(label, x, margin.top + chartHeight + 15);
    }

    // Draw hover point if hovering
    if (hoveredIndex >= 0 && hoveredIndex < data.length) {
      const pointX = xScale(hoveredIndex);
      const pointY = yScale(data[hoveredIndex][valueKey]);
      
      // Draw vertical line
      ctx.strokeStyle = color + '40';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(pointX, margin.top);
      ctx.lineTo(pointX, margin.top + chartHeight);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw point
      ctx.beginPath();
      ctx.arc(pointX, pointY, 4, 0, 2 * Math.PI);
      ctx.fillStyle = isDarkMode ? '#1f2937' : '#ffffff';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  useEffect(() => {
    if (!data || data.length === 0) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    
    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = height + 'px';
      
      ctx.scale(dpr, dpr);
      drawChart(ctx, rect);
    };

    // Clear any existing animation frame
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Use animation frame for smooth updates
    animationRef.current = requestAnimationFrame(updateCanvasSize);

    // Mouse interaction
    let currentHoveredIndex = -1;

    const handleMouseMove = (e) => {
      if (!showTooltip) return;
      
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const margin = { top: 20, right: 20, bottom: 40, left: 60 };
      const chartWidth = rect.width - margin.left - margin.right;
      
      if (mouseX >= margin.left && mouseX <= margin.left + chartWidth &&
          mouseY >= margin.top && mouseY <= margin.top + height - margin.bottom) {
        
        // Find closest data point
        const relativeX = mouseX - margin.left;
        const dataIndex = Math.round((relativeX / chartWidth) * Math.max(0, data.length - 1));
        
        if (dataIndex >= 0 && dataIndex < data.length && dataIndex !== currentHoveredIndex) {
          currentHoveredIndex = dataIndex;
          
          // Update tooltip
          const tooltip = tooltipRef.current;
          if (tooltip) {
            const point = data[dataIndex];
            tooltip.style.display = 'block';
            tooltip.style.left = `${Math.min(mouseX + 10, rect.width - 120)}px`;
            tooltip.style.top = `${Math.max(mouseY - 50, 10)}px`;
            tooltip.innerHTML = `
              <div class="font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}">${point[dataKey]}</div>
              <div class="text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}">${point[valueKey].toLocaleString()}</div>
            `;
          }
          
          // Redraw chart with hover point
          drawChart(ctx, rect, currentHoveredIndex);
        }
      } else {
        if (currentHoveredIndex !== -1) {
          currentHoveredIndex = -1;
          const tooltip = tooltipRef.current;
          if (tooltip) {
            tooltip.style.display = 'none';
          }
          drawChart(ctx, rect);
        }
      }
    };

    const handleMouseLeave = () => {
      currentHoveredIndex = -1;
      const tooltip = tooltipRef.current;
      if (tooltip) {
        tooltip.style.display = 'none';
      }
      drawChart(ctx, canvas.getBoundingClientRect());
    };

    const handleResize = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      animationRef.current = requestAnimationFrame(updateCanvasSize);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [data, dataKey, valueKey, color, height, gradientOpacity, showTooltip, isDarkMode]);

  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-[300px] rounded-xl ${
        isDarkMode
          ? 'text-gray-400 bg-gray-900 border border-gray-700'
          : 'text-gray-500 bg-gray-50'
      }`}>
        <p className="text-sm">No data available</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative w-full rounded-lg transition-colors ${
      isDarkMode ? 'bg-gray-900' : 'bg-white'
    }`} style={{ height: `${height}px` }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair"
        style={{ width: '100%', height: `${height}px` }}
      />
      {showTooltip && (
        <div
          ref={tooltipRef}
          className={`absolute border rounded-lg px-3 py-2 shadow-lg text-sm pointer-events-none z-20 transition-opacity duration-200 ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600' 
              : 'bg-white border-gray-300'
          }`}
          style={{ display: 'none' }}
        />
      )}
    </div>
  );
};

export default GoogleStockChart;
