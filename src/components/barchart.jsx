// // File: src/components/BarChart.jsx
// import React, { useEffect, useRef, useState } from 'react';
// import * as echarts from 'echarts';
// import dayjs from 'dayjs';

// const generateMockData = (days) => {
//     const data = [];
//     const today = dayjs();
//     for (let i = 0; i < days; i++) {
//         const date = today.subtract(i, 'day').format('YYYY-MM-DD');
//         data.unshift({
//             date,
//             EC2: Math.floor(Math.random() * 100) + 100,
//             S3: Math.floor(Math.random() * 40) + 60,
//             Lambda: Math.floor(Math.random() * 20) + 30,
//             RDS: Math.floor(Math.random() * 60) + 70,
//             CloudFront: Math.floor(Math.random() * 30) + 20,
//         });
//     }
//     return data;
// };

// const BarChart = () => {
//     const chartRef = useRef(null);
//     const modalChartRef = useRef(null);
//     const [range, setRange] = useState('3M');
//     const [chartInstance, setChartInstance] = useState(null);
//     const [modalChartInstance, setModalChartInstance] = useState(null);
//     const [showModal, setShowModal] = useState(false);
//     const serviceColors = {
//         EC2: '#3B82F6',
//         S3: '#A3E635',
//         Lambda: '#6366F1',
//         RDS: '#F97316',
//         CloudFront: '#0EA5E9',
//         VPC: '#10B981',
//         EBS: '#F43F5E',
//         ECS: '#7C3AED',
//         EKS: '#22D3EE',
//         DynamoDB: '#14B8A6',
//         Redshift: '#8B5CF6',
//         ElastiCache: '#F59E0B',
//         'Route 53': '#4B5563',
//         SNS: '#E11D48',
//         SQS: '#A855F7',
//         IAM: '#6D28D9',
//         CloudWatch: '#1D4ED8',
//         Kinesis: '#DB2777',
//         Glue: '#2563EB',
//         'Step Functions': '#059669',
//         'API Gateway': '#D97706'
//     };


//     const getDays = (range) => {
//         if (range === '3M') return 90;
//         if (range === '6M') return 180;
//         if (range === 'YTD') return dayjs().diff(dayjs().startOf('year'), 'day') + 1;
//         return 30;
//     };

//     const updateChart = (range, ref, setInstance, isModal = false) => {
//         const days = getDays(range);
//         const mockData = generateMockData(days);
//         const dates = mockData.map(d => d.date);

//         const services = [
//             'EC2', 'S3', 'Lambda', 'RDS', 'CloudFront', 'VPC',
//             'EBS', 'ECS', 'EKS', 'DynamoDB', 'Redshift', 'ElastiCache',
//             'Route 53', 'SNS', 'SQS', 'IAM', 'CloudWatch', 'Kinesis',
//             'Glue', 'Step Functions', 'API Gateway'
//         ];

//         const option = isModal
//             ? {
//                 backgroundColor: '#fff',
//                 tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
//                 grid: {
//                     top: '10%',
//                     left: '5%',
//                     right: '5%',
//                     bottom: '10%',  
//                     containLabel: true,
//                 },
//                 xAxis: {
//                     type: 'value',
//                     name: 'USD ($)',
//                     axisLabel: {
//                         formatter: (val) => `$${val}`,
//                     },
//                 },
//                 yAxis: {
//                     type: 'category',
//                     data: services,
//                 },
//                 dataZoom: [
//                     {
//                         type: 'slider',
//                         yAxisIndex: 0,
//                         start: 0,
//                         end: 50,
//                     },
//                     {
//                         type: 'inside',
//                         yAxisIndex: 0,
//                         start: 0,
//                         end: 50,
//                     },
//                 ],
//                 series: dates.map(date => ({
//                     name: date,
//                     type: 'bar',
//                     stack: 'total',
//                     emphasis: { focus: 'series' },
//                     label: {
//                         show: false,
//                         position: 'insideRight',
//                         formatter: '{c}',
//                     },
//                     data: services.map(service => {
//                         const dayData = mockData.find(d => d.date === date);
//                         return dayData?.[service] || 0;
//                     }),
//                 })),
//                 legend: {
//                     type: 'scroll',
//                     top: '10%',
//                     data: services
//                 },

//                 // toolbox: {
//                 //     show: true,
//                 //     orient: 'horizontal',
//                 //     left: 'center',
//                 //     top: 'bottom', // ECharts will place it at the bottom
//                 //     feature: {
//                 //         saveAsImage: { show: false },
//                 //     },
//                 // },


//             }
//             : {
//                 backgroundColor: '#fff',
//                 tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
//                 legend: {
//                     type: 'scroll',
//                     orient: 'horizontal',
//                     left: 'right',
//                     top: '4%',
//                     bottom: '30%',
//                     pageButtonGap: 5,
//                     pageIconSize: 12,
//                     data: services
//                 },
//                 // toolbox: {
//                 //     show: true,
//                 //     feature: {
//                 //         dataView: { show: true, readOnly: false },
//                 //         magicType: { show: true, type: ['line', 'bar'] },
//                 //         restore: { show: true },
//                 //         saveAsImage: { show: true },
//                 //     },
//                 // },
//                 grid: {
//                     top: '25%',
//                     left: '3%',
//                     right: '3%',
//                     bottom: '15%',
//                     containLabel: true,
//                 },
//                 xAxis: {
//                     type: 'category',
//                     data: dates,
//                     axisLabel: {
//                         rotate: 45,
//                         formatter: (value) => dayjs(value).format('MMM D'),
//                     },
//                 },
//                 yAxis: {
//                     type: 'value',
//                     name: 'USD ($)',
//                     axisLabel: {
//                         formatter: (val) => `$${val}`,
//                     },
//                 },
//                 dataZoom: [
//                     { type: 'slider', start: 80, end: 100 },
//                     { type: 'inside', start: 80, end: 100 },
//                 ],
//                 series: services.map(service => ({
//                     name: service,
//                     type: 'bar',
//                     stack: 'total',
//                     emphasis: { focus: 'series' },
//                     label: {
//                         show: false,
//                         position: 'insideBottom',
//                         formatter: '{c}',
//                     },
//                     itemStyle: {
//                         color: serviceColors[service] || '#ccc', // fallback color
//                     },
//                     data: mockData.map(d => d[service] || 0),
//                 }))
//             };

//         let chart = echarts.getInstanceByDom(ref.current);
//         if (chart) {
//             chart.setOption(option);
//             chart.resize();
//             setInstance(chart);
//         } else {
//             const newChart = echarts.init(ref.current);
//             newChart.setOption(option);
//             setInstance(newChart);
//             window.addEventListener('resize', () => newChart.resize());
//         }
//     };


//     useEffect(() => {
//         updateChart(range, chartRef, setChartInstance);
//         return () => {
//             chartInstance?.dispose();
//         };
//     }, [range]);

//     useEffect(() => {
//         if (showModal) {
//             updateChart(range, modalChartRef, setModalChartInstance);
//         } else {
//             modalChartInstance?.dispose();
//         }
//     }, [showModal, range]);

//     return (
//         <>
//             {/* Main chart container */}
//             <div
//                 style={{
//                     width: '100%',
//                     padding: '0.5rem',
//                     backgroundColor: '#ffffff',
//                     borderRadius: '8px',
//                     boxShadow: '0 0 10px rgba(0,0,0,0.1)',
//                     boxSizing: 'border-box',
//                     border: '1px solid #e0e0e0', 
//                 }}
//             >
//                 <div style={{
//                     display: 'flex',
//                     justifyContent: 'space-between',
//                     alignItems: 'center',
//                     flexWrap: 'wrap',
//                     gap: '1rem',
//                 }}>
//                     <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Daily Cost</h2>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//                         <label htmlFor="filter" style={{ fontWeight: 500 }}>Filter:</label>
//                         <select
//                             id="filter"
//                             value={range}
//                             onChange={(e) => setRange(e.target.value)}
//                             style={{
//                                 padding: '0.25rem 0.5rem',
//                                 fontSize: '1rem',
//                                 borderRadius: '4px',
//                                 border: '1px solid #ccc',
//                             }}
//                         >
//                             <option value="3M">Last 3 Months</option>
//                             <option value="6M">Last 6 Months</option>
//                             <option value="YTD">Year to Date</option>
//                         </select>
//                         <button
//                             onClick={() => setShowModal(true)}
//                             style={{
//                                 padding: '0.4rem 0.75rem',
//                                 borderRadius: '4px',
//                                 border: 'none',
//                                 backgroundColor: '#2B6CB0',
//                                 color: '#fff',
//                                 cursor: 'pointer',
//                             }}
//                         >
//                             Expand View
//                         </button>
//                     </div>
//                 </div>
//                 <div
//                     ref={chartRef}
//                     style={{ width: '100%', height: '450px', marginTop: '0.3rem' }}
//                 />
//             </div>

//             {/* Modal Overlay */}
//             {showModal && (
//                 <div
//                     style={{
//                         position: 'fixed',
//                         top: 0,
//                         left: 0,
//                         right: 0,
//                         bottom: 0,
//                         backgroundColor: 'rgba(0,0,0,0.7)',
//                         zIndex: 9999,
//                         display: 'flex',
//                         justifyContent: 'center',
//                         alignItems: 'center',
//                         padding: '2rem',
//                     }}
//                 >
//                     <div
//                         style={{
//                             width: '100%',
//                             maxWidth: '1200px',
//                             backgroundColor: '#fff',
//                             borderRadius: '8px',
//                             padding: '1rem',
//                             position: 'relative',
//                         }}
//                     >
//                         <button
//                             onClick={() => setShowModal(false)}
//                             style={{
//                                 position: 'absolute',
//                                 top: '10px',
//                                 padding: '0.5rem 1rem',
//                                 backgroundColor: '#dc3545',
//                                 color: '#fff',
//                                 border: 'none',
//                                 borderRadius: '4px',
//                                 cursor: 'pointer',
//                                 zIndex: 10000,
//                             }}
//                         >
//                             Close
//                         </button>
//                         <div
//                             ref={modalChartRef}
//                             style={{ width: '100%', height: '90vh', }}
//                         />
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// };

// export default BarChart;

