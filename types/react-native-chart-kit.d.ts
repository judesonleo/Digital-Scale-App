declare module "react-native-chart-kit" {
	import { ViewStyle } from "react-native";

	export interface ChartConfig {
		backgroundColor?: string;
		backgroundGradientFrom?: string;
		backgroundGradientTo?: string;
		decimalPlaces?: number;
		color?: (opacity?: number) => string;
		labelColor?: (opacity?: number) => string;
		style?: ViewStyle;
		propsForDots?: {
			r?: string;
			strokeWidth?: string;
			stroke?: string;
		};
	}

	export interface ChartData {
		labels: string[];
		datasets: {
			data: number[];
			color?: (opacity?: number) => string;
			strokeWidth?: number;
		}[];
	}

	export interface LineChartProps {
		data: ChartData;
		width: number;
		height: number;
		chartConfig: ChartConfig;
		bezier?: boolean;
		style?: ViewStyle;
	}

	export class LineChart extends React.Component<LineChartProps> {}
}
