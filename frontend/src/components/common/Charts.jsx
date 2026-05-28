import React from "react";
import Chart from "react-apexcharts";
import { chartColorSchemes, getChartColors } from "../../utils/colorUtils";

// Professional color schemes - Now using centralized color system
const professionalColors = {
  primary: chartColorSchemes.default.slice(0, 3),
  secondary: chartColorSchemes.default.slice(3, 6),
  accent: chartColorSchemes.default.slice(6, 9),
  danger: [chartColorSchemes.default[3]],
  purple: [chartColorSchemes.default[4]],
  gray: [chartColorSchemes.default[5]],
};

// Base chart options for consistency
const baseOptions = {
  chart: {
    toolbar: {
      show: false,
    },
    animations: {
      enabled: true,
      easing: "easeinout",
      speed: 800,
    },
    fontFamily: "Inter, system-ui, sans-serif",
  },
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: {
          width: "100%",
        },
        legend: {
          position: "bottom",
        },
      },
    },
  ],
  colors: professionalColors.primary,
  fill: {
    type: "gradient",
    gradient: {
      shade: "dark",
      type: "vertical",
      shadeIntensity: 0.15,
      opacityFrom: 0.95,
      opacityTo: 0.75,
      stops: [0, 90, 100],
    },
  },
  stroke: {
    curve: "smooth",
    width: 2,
  },
  dataLabels: {
    enabled: false,
  },
  grid: {
    borderColor: "#e5e7eb",
    strokeDashArray: 3,
  },
  theme: {
    mode: "light",
  },
};

// Bar Chart Component
export const BarChart = ({
  data,
  title = "Chart",
  height = 350,
  customOptions = {},
}) => {
  const options = {
    ...baseOptions,
    ...customOptions,
    chart: {
      ...baseOptions.chart,
      type: "bar",
      height: height,
    },
    fill: {
      type: "solid", // Use solid colors for doughnut charts instead of gradient
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        endingShape: "rounded",
        borderRadius: 4,
      },
    },
    colors: customOptions.colors || professionalColors.primary,
    title: {
      text: title,
      align: "center",
      style: {
        fontSize: "16px",
        fontWeight: "600",
        color: "#1f2937",
      },
    },
    xaxis: {
      categories: data.categories || [],
      labels: {
        style: {
          colors: "#6b7280",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#6b7280",
          fontSize: "12px",
        },
      },
    },
    tooltip: {
      theme: "light",
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 h-full flex flex-col">
      <Chart
        options={options}
        series={data.series || []}
        type="bar"
        height={height}
        width="100%"
      />
    </div>
  );
};

// Line Chart Component
export const LineChart = ({ data, title = "Chart", height = 350 }) => {
  const options = {
    ...baseOptions,
    chart: {
      ...baseOptions.chart,
      type: "area",
      height: height,
    },
    colors: professionalColors.primary,
    title: {
      text: title,
      align: "center",
      style: {
        fontSize: "16px",
        fontWeight: "600",
        color: "#1f2937",
      },
    },
    xaxis: {
      categories: data.categories || [],
      labels: {
        style: {
          colors: "#6b7280",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#6b7280",
          fontSize: "12px",
        },
      },
    },
    tooltip: {
      theme: "light",
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 h-full flex flex-col">
      <Chart
        options={options}
        series={data.series || []}
        type="area"
        height={height}
        width="100%"
      />
    </div>
  );
};

// Doughnut Chart Component
export const DoughnutChart = ({
  data,
  title = "Chart",
  height = 350,
  customOptions = {},
}) => {
  const options = {
    ...baseOptions,
    ...customOptions,
    chart: {
      ...baseOptions.chart,
      type: "donut",
      height: height,
    },
    colors: customOptions.colors || [
      professionalColors.primary[0],
      professionalColors.secondary[0],
      professionalColors.accent[0],
      professionalColors.danger[0],
      professionalColors.purple[0],
    ],
    plotOptions: {
      pie: {
        donut: {
          size: "60%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
              fontWeight: 600,
              color: "#1f2937",
            },
            value: {
              show: true,
              fontSize: "18px",
              fontWeight: 700,
              color: "#1f2937",
            },
          },
        },
      },
    },
    title: {
      text: title,
      align: "center",
      style: {
        fontSize: "16px",
        fontWeight: "600",
        color: "#1f2937",
      },
    },
    labels: data.labels || [],
    legend: {
      position: "bottom",
      fontSize: "12px",
    },
    tooltip: {
      theme: "light",
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 h-full flex flex-col">
      <Chart
        options={options}
        series={data.series || []}
        type="donut"
        height={height}
        width="100%"
      />
    </div>
  );
};

// Department Complaints Chart
export const DepartmentChart = ({ departmentStats = {}, height = 300 }) => {
  const departments = Object.keys(departmentStats);
  const counts = Object.values(departmentStats);

  const deptLabels = {
    road: "Roads & Transportation",
    water: "Water Supply",
    electricity: "Electricity",
    waste: "Waste Management",
    drainage: "Drainage & Sewerage",
    other: "Other",
  };

  const categories = departments.map(
    (dept) => deptLabels[dept] || dept.charAt(0).toUpperCase() + dept.slice(1)
  );

  const chartData = {
    categories: categories,
    series: [
      {
        name: "Complaints",
        data: counts,
      },
    ],
  };

  // Use department-specific colors
  const departmentColors = getChartColors("department", departments.length);

  const customOptions = {
    colors: departmentColors,
  };

  return (
    <BarChart
      data={chartData}
      title="Complaints by Department"
      height={height}
      customOptions={customOptions}
    />
  );
};

// Status Distribution Chart
export const StatusChart = ({ statusStats = {}, height = 300 }) => {
  const statuses = Object.keys(statusStats);
  const counts = Object.values(statusStats);

  const statusLabels = statuses.map((status) => {
    const statusMap = {
      pending: "Pending",
      assigned: "Assigned",
      "in-progress": "In Progress",
      resolved: "Resolved",
      closed: "Closed",
    };
    return statusMap[status] || status.replace("-", " ").toUpperCase();
  });

  const chartData = {
    labels: statusLabels,
    series: counts,
  };

  // Use status-specific colors
  const statusColors = getChartColors("status", statuses.length);

  const customOptions = {
    colors: statusColors,
  };

  return (
    <DoughnutChart
      data={chartData}
      title="Complaints by Status"
      height={height}
      customOptions={customOptions}
    />
  );
};

// Priority Distribution Chart
export const PriorityChart = ({ priorityStats = {}, height = 300 }) => {
  const priorities = Object.keys(priorityStats);
  const counts = Object.values(priorityStats);

  const priorityLabels = priorities.map((priority) => {
    const priorityMap = {
      emergency: "Emergency",
      high: "High",
      medium: "Medium",
      low: "Low",
    };
    return priorityMap[priority.toLowerCase()] || priority;
  });

  const chartData = {
    labels: priorityLabels,
    series: counts,
  };

  // Use priority-specific colors
  const priorityColors = getChartColors("priority", priorities.length);

  const customOptions = {
    colors: priorityColors,
  };

  return (
    <DoughnutChart
      data={chartData}
      title="Complaints by Priority"
      height={height}
      customOptions={customOptions}
    />
  );
};

// Trend Chart
export const TrendChart = ({ trendData = [], height = 300 }) => {
  const categories = trendData.map((item) => item.date);

  const chartData = {
    categories: categories,
    series: [
      {
        name: "New Complaints",
        data: trendData.map((item) => item.complaints),
      },
      {
        name: "Resolved",
        data: trendData.map((item) => item.resolved),
      },
    ],
  };

  return (
    <LineChart
      data={chartData}
      title="Complaints Trend Over Time"
      height={height}
    />
  );
};
