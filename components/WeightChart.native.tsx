import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { COLORS } from "@/styles/constants";

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
	const chartConfig = {
		backgroundColor: "transparent",
		backgroundGradientFrom: isDark ? COLORS.darkBackground : COLORS.white,
		backgroundGradientTo: isDark ? COLORS.darkBackground : COLORS.white,
		decimalPlaces: 1,
		color: (opacity = 1) =>
			COLORS.primary +
			Math.round(opacity * 255)
				.toString(16)
				.padStart(2, "0"),
		labelColor: () => (isDark ? COLORS.white : COLORS.black),
		style: {
			borderRadius: 16,
		},
		propsForDots: {
			r: "6",
			strokeWidth: "2",
			stroke: COLORS.primary,
		},
	};

	return (
		<View style={styles.container}>
			<LineChart
				data={{
					labels: data.labels,
					datasets: [
						{
							data: data.datasets[0].data,
						},
					],
				}}
				width={Dimensions.get("window").width - 32}
				height={300}
				chartConfig={chartConfig}
				bezier
				style={styles.chart}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginVertical: 8,
	},
	chart: {
		borderRadius: 16,
	},
});

export default WeightChart;
