import React from "react";
import { View, StyleSheet } from "react-native";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { COLORS } from "@/styles/constants";

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
);

interface WeightChartProps {
	data: {
		labels: string[];
		datasets: {
			data: number[];
		}[];
	};
	isDark: boolean;
}

const WeightChart = ({ data, isDark }: WeightChartProps) => {
	const chartData = {
		labels: data.labels,
		datasets: [
			{
				label: "Weight (kg)",
				data: data.datasets[0].data,
				borderColor: COLORS.primary,
				backgroundColor: COLORS.primary + "40",
				tension: 0.4,
				fill: true,
			},
		],
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: true,
				position: "top" as const,
				labels: {
					color: isDark ? COLORS.white : COLORS.black,
					font: {
						size: 14,
						weight: "bold" as const,
					},
				},
			},
			tooltip: {
				mode: "index" as const,
				intersect: false,
				backgroundColor: isDark ? COLORS.darkCard : COLORS.white,
				titleColor: isDark ? COLORS.white : COLORS.black,
				bodyColor: isDark ? COLORS.white : COLORS.black,
				borderColor: COLORS.border,
				borderWidth: 1,
			},
		},
		scales: {
			y: {
				beginAtZero: false,
				grid: {
					color: isDark ? COLORS.border + "40" : COLORS.border + "20",
				},
				ticks: {
					color: isDark ? COLORS.white : COLORS.black,
					font: {
						size: 12,
					},
				},
			},
			x: {
				grid: {
					display: false,
				},
				ticks: {
					color: isDark ? COLORS.white : COLORS.black,
					font: {
						size: 12,
					},
				},
			},
		},
		interaction: {
			mode: "nearest" as const,
			axis: "x" as const,
			intersect: false,
		},
	};

	return (
		<View style={styles.container}>
			<div style={{ width: "100%", height: "300px" }}>
				<Line data={chartData} options={chartOptions} />
			</div>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginVertical: 8,
	},
});

export default WeightChart;
