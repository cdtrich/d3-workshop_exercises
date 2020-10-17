import * as d3 from "d3";

/////////////////////////////////////////////////
// to do/////////////////////////////////////////
/////////////////////////////////////////////////

console.clear();

const createChart = async () => {
	/////////////////////////////////////////////////
	// read data ////////////////////////////////////
	/////////////////////////////////////////////////

	let data = await d3.json("./brussels_weather-metric.json");
	// console.log(data[1]);

	/////////////////////////////////////////////////
	// accessor functions ///////////////////////////
	/////////////////////////////////////////////////

	const dateParser = d3.timeParse("%Y-%m-%d");
	const xAccessor = (d) => d.dewPoint;
	const yAccessor = (d) => d.humidity;
	const cAccessor = (d) => dateParser(d.date);
	// const cAccessor = (d) => d.windSpeed;
	const rAccessor = (d) => d.temperatureMax;
	const oAccessor = (d) => d.temperatureMax;

	/////////////////////////////////////////////////
	// resize ///////////////////////////////////////
	/////////////////////////////////////////////////

	const wrapper = d3.select("#wrapper").append("svg");

	// if element already exists, return selection
	// if it doesn't exist, create it and give it class
	const selectOrCreate = (elementType, className, parent) => {
		const selection = parent.select("." + className);
		if (!selection.empty()) return selection;
		return parent.append(elementType).attr("class", className);
	};

	const resize = () => {
		/////////////////////////////////////////////////
		// dimensions ///////////////////////////////////
		/////////////////////////////////////////////////

		const size = d3.min([window.innerWidth * 0.9, window.innerHeight * 0.9]);

		let dimensions = {
			width: size,
			height: size,
			margin: {
				top: 15,
				right: 15,
				bottom: 60,
				left: 60
			}
		};

		dimensions.boundedWidth =
			dimensions.width - dimensions.margin.left - dimensions.margin.right;
		dimensions.boundedHeight =
			dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

		/////////////////////////////////////////////////
		// svg //////////////////////////////////////////
		/////////////////////////////////////////////////

		// tag = name; class = .name; id = #name;
		wrapper.attr("width", dimensions.width).attr("height", dimensions.height);

		// shifting
		const bounds = selectOrCreate("g", "wrapper", wrapper).style(
			"transform",
			`translate(${dimensions.margin.left}px,${dimensions.margin.top}px)`
		);

		/////////////////////////////////////////////////
		// scales ///////////////////////////////////////
		/////////////////////////////////////////////////

		const xScale = d3
			.scaleLinear()
			.domain(d3.extent(data, xAccessor))
			.range([0, dimensions.boundedWidth])
			.nice();

		const yScale = d3
			.scaleLinear()
			.domain(d3.extent(data, yAccessor))
			.range([dimensions.boundedHeight, 0])
			.nice();

		const rScale = d3
			.scaleSqrt()
			.domain(d3.extent(data, rAccessor))
			.range([2, size / 50]);

		// with sequential scale
		// you pass the scheme into .scaleSequential
		const cScale = d3
			.scaleSequential(d3.interpolateSpectral)
			.domain(d3.extent(data, cAccessor));

		const oScale = d3
			.scaleSqrt()
			.domain(d3.extent(data, oAccessor))
			.range([1.5, 0.1])
			.nice();

		/////////////////////////////////////////////////
		// axes /////////////////////////////////////////
		/////////////////////////////////////////////////

		const yAxisGenerator = d3
			.axisLeft()
			.scale(yScale)
			// dynamic ticks, one every 200 px
			.ticks(dimensions.boundedWidth / 50);
		const yAxis = selectOrCreate("g", "yaxis", bounds)
			.transition()
			.call(yAxisGenerator);

		const xAxisGenerator = d3
			.axisBottom()
			.scale(xScale)
			// dynamic ticks, one every 200 px
			.ticks(dimensions.boundedHeight / 50);
		const xAxis = selectOrCreate("g", "xaxis", bounds)
			.transition()
			.call(xAxisGenerator)
			.style("transform", `translate(0,${dimensions.boundedHeight}px)`);

		const xAxisLabel = selectOrCreate("text", "xAxisLabel", bounds)
			.text("Relative Humidity")
			.attr("x", dimensions.boundedWidth / 2)
			.style("text-anchor", "middle")
			.attr("y", dimensions.boundedHeight + 40)
			.style("font-family", "sans-serif")
			.style("font-size", ".6em");

		const yAxisLabel = selectOrCreate("text", "yAxisLabel", bounds)
			.text("Dew Point")
			.attr("x", -dimensions.boundedHeight / 2)
			.style("text-anchor", "middle")
			.attr("y", -36)
			.style("transform", "rotate(-90deg)")
			.style("font-family", "sans-serif")
			.style("font-size", ".6em");

		/////////////////////////////////////////////////
		// plotting /////////////////////////////////////
		/////////////////////////////////////////////////

		const drawDots = (data) => {
			const onEnter = (selection) => {
				return selection
					.append("circle")
					.attr("r", 0)
					.attr("cx", (d) => xScale(-15))
					.attr("cy", (d) => yScale(0.35));
			};

			const tooltip = selectOrCreate("div", "tooltip", d3.select("#wrapper"));

			const dots = bounds
				.selectAll("circle")
				.data(data, (d) => d.date)
				.join(onEnter)
				.sort((a, b) => b.temperatureMax - a.temperatureMax) // smaller on top
				.classed("dots", true);

			dots
				.transition()
				.delay((d, i) => i * 2)
				.duration(250)
				.attr("r", (d) => rScale(rAccessor(d)))
				.attr("cx", (d) => xScale(xAccessor(d)))
				.attr("cy", (d) => yScale(yAccessor(d)))
				.attr("fill", (d) => cScale(cAccessor(d)))
				.style("opacity", (d) => oScale(oAccessor(d)));

			// tooltip
			dots.on("mouseenter", (event, d) => {
				console.log("hi");
				const x = xScale(xAccessor(d));
				const y = yScale(yAccessor(d));
				tooltip
					// offset by 50% of its own width and height
					// calc() lets you use different types of units
					.style(
						"transform",
						`translate(
							calc(${x + dimensions.margin.left}px - 50%), 
							calc(${y + dimensions.margin.top}px - 5%))`
					)
					.text(
						`dew point: ${yAccessor(d)} 
							humidity: ${xAccessor(d)}`
					);

				dots.style("opacity", 0.1);
				d3.select(event.target).style("opacity", 1);
			});

			wrapper.on("mouseleave", () => {
				tooltip.style("opacity", 0);
			});

			wrapper.on("mouseleave", () => {
				dots.style("opacity", (d) => oScale(oAccessor(d)));
			});
		};

		drawDots(data);
	};

	resize();

	d3.select(window).on("resize", (event) => {
		resize();
	});
};

createChart();
