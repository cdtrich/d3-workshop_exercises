import * as d3 from "d3";

const createChart = async () => {
	const data = await d3.json("./washington_dc_weather.json");
	console.log(data[0]);

	const yAccessor = (d) => d["temperatureMax"];
	const dateParser = d3.timeParse("%Y-%m-%d");
	const xAccessor = (d) => dateParser(d["date"]);

	let dimensions = {
		width: window.innerWidth * 0.9,
		height: 400,
		margin: {
			top: 15,
			right: 15,
			bottom: 20,
			left: 60
		}
	};
	dimensions.boundedWidth =
		dimensions.width - dimensions.margin.right - dimensions.margin.left;
	dimensions.boundedHeight =
		dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

	const wrapper = d3
		.select("#wrapper")
		.append("svg")
		.attr("width", dimensions.width)
		.attr("height", dimensions.height)
		.style("border", "1px solid");

	const bounds = wrapper
		.append("g")
		.style(
			"transform",
			`translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
		);

	const yScale = d3
		.scaleLinear()
		.domain(d3.extent(data, yAccessor))
		.range([dimensions.boundedHeight, 0]);
	console.log(yScale(50));

	const freezingTemperatures = bounds
		.append("rect")
		.attr("x", 0)
		.attr("y", yScale(50))
		.attr("width", dimensions.boundedWidth)
		.attr("height", dimensions.boundedHeight - yScale(50))
		.attr("fill", "skyblue");

	const xScale = d3
		.scaleTime()
		.domain(d3.extent(data, xAccessor))
		.range([0, dimensions.boundedWidth]);

	const lineGenerator = d3
		.line()
		.x((d) => xScale(xAccessor(d)))
		.y((d) => yScale(yAccessor(d)));
	const dAttribute = lineGenerator(data);
	console.log(dAttribute);

	const line = bounds
		.append("path")
		.attr("d", dAttribute)
		.attr("fill", "none")
		.attr("stroke", "green")
		.attr("stroke-width", "2");

	const yAxisGenerator = d3.axisLeft().scale(yScale);

	const yAxis = bounds.append("g").call(yAxisGenerator);

	const xAxisGenerator = d3.axisBottom().scale(xScale);

	const xAxis = bounds
		.append("g")
		.call(xAxisGenerator)
		.style("transform", `translate(0, ${dimensions.boundedHeight}px)`);
};

createChart();
