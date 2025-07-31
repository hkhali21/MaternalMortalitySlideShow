
let currentScene = 0;
let data;

const width = 600;
const height = 500;
const svg = d3.select("#chart");

d3.csv("maternal_mortality_cleaned.csv").then(raw => {
  data = raw.map(d => ({
    country: d.Country,
    region: d.Region,
    income: d["Income group"],
    mmr: +d.MMR,
    births: +d.LiveBirths
  }));
  updateScene();
});

function updateScene() {
  svg.selectAll("*").remove();
  d3.select("#description").classed("visible", false).html("");

  if (currentScene === 0) {
    drawScene1();
  } else if (currentScene === 1) {
    drawScene2();
  } else if (currentScene === 2) {
    drawScene3();
  }
}

function drawScene1() {
  
  svg.append("defs").append("filter")
    .attr("id", "glow")
    .append("feGaussianBlur")
    .attr("stdDeviation", "3.5")
    .attr("result", "coloredBlur");
  const defs = svg.append("defs");
  defs.append("marker")
    .attr("id", "arrow")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 5)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "#333");

const xScale = d3.scalePoint()
    .domain(["Low income", "Lower middle income", "Upper middle income", "High income"])
    .range([100, width - 100]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.mmr)]).nice()
    .range([height - 50, 50]);

  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "#fff")
    .style("padding", "8px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px")
    .style("box-shadow", "0 0 10px rgba(0,0,0,0.2)")
    .style("pointer-events", "none")
    .style("opacity", 0);

  const bubbles = svg.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => xScale(d.income))
    .attr("cy", height - 50)
    .attr("r", d => Math.sqrt(d.births) / 200)
    .attr("fill", d => {
      if (d.country === "Nigeria") return "crimson";
      if (d.country === "Norway") return "darkblue";
      return "#89CFF0";
    })
    .attr("opacity", 0.8);

  bubbles.transition()
    .duration(2000)
    .attr("cy", d => yScale(d.mmr))
    .on("end", function (event, d) {
      if (d.country === "Nigeria" || d.country === "Norway") {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`<strong>${d.country}</strong><br>MMR: ${d.mmr}`)
          .style("left", (xScale(d.income) + 30) + "px")
          .style("top", (yScale(d.mmr) - 30) + "px");
      }
    });
  // Highlight with flare and annotation for Nigeria and Norway
  const highlighted = data.filter(d => d.country === "Nigeria" || d.country === "Norway");

  const flare = svg.selectAll(".flare")
    .data(highlighted)
    .enter()
    .append("circle")
    .attr("class", "flare")
    .attr("cx", d => xScale(d.income))
    .attr("cy", d => yScale(d.mmr))
    .attr("r", d => Math.sqrt(d.births) / 200 + 6)
    .style("fill", "none")
    .style("stroke", d => d.country === "Nigeria" ? "crimson" : "darkblue")
    .style("stroke-width", 2)
    .style("stroke-opacity", 0.6)
    .style("filter", "url(#glow)");
  // Add annotation arrows and boxes for Nigeria and Norway
  highlighted.forEach(d => {
    const x = xScale(d.income);
    const y = yScale(d.mmr);

    // Annotation text
    const annotationText = `${d.country}: ${d.mmr}`;

    // Create temporary text to measure width
    const tempText = svg.append("text")
      .attr("x", -9999)
      .attr("y", -9999)
      .style("font-size", "13px")
      .text(annotationText);

    const textWidth = tempText.node().getBBox().width;
    tempText.remove();

    const boxWidth = textWidth + 12;
    const boxHeight = 22;
    const offsetX = 20;
    const offsetY = -30;

    // Draw arrow line
    svg.append("line")
      .attr("x1", x)
      .attr("y1", y)
      .attr("x2", x + offsetX)
      .attr("y2", y + offsetY + boxHeight / 2)
      .attr("stroke", d.country === "Nigeria" ? "crimson" : "darkblue")
      .attr("stroke-width", 1.5)
      .attr("marker-end", "url(#arrow)");

    // Draw annotation background box
    svg.append("rect")
      .attr("x", x + offsetX)
      .attr("y", y + offsetY)
      .attr("width", boxWidth)
      .attr("height", boxHeight)
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("fill", "white")
      .attr("stroke", d.country === "Nigeria" ? "crimson" : "darkblue")
      .attr("stroke-width", 1.5)
      .style("filter", "drop-shadow(0px 1px 3px rgba(0,0,0,0.2))");

    // Add annotation text
    svg.append("text")
      .attr("x", x + offsetX + 6)
      .attr("y", y + offsetY + 15)
      .style("font-size", "13px")
      .style("font-weight", "bold")
      .style("fill", d.country === "Nigeria" ? "crimson" : "darkblue")
      .text(annotationText);
  });


  svg.selectAll(".annotation")
    .data(highlighted)
    .enter()
    .append("text")
    .attr("class", "annotation")
    .attr("x", d => xScale(d.income) + 12)
    .attr("y", d => yScale(d.mmr) - 12)
    .style("font-size", "13px")
    .style("font-weight", "bold")
    .style("fill", d => d.country === "Nigeria" ? "crimson" : "darkblue")
    .text(d => `${d.country}: ${d.mmr}`);


  // Axis labels
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .style("font-weight", "bold")
    .text("Income Group");

  xScale.domain().forEach(group => {
    svg.append("text")
      .attr("x", xScale(group))
      .attr("y", height - 55)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text(group);
  });

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("Scene 1: MMR vs Income Group");

  const legendData = [
    { label: "Other Countries", color: "#89CFF0" },
    { label: "Nigeria", color: "crimson" },
    { label: "Norway", color: "darkblue" }
  ];

  svg.selectAll("legend-dots")
    .data(legendData)
    .enter()
    .append("circle")
    .attr("cx", width - 180)
    .attr("cy", (d, i) => 60 + i * 20)
    .attr("r", 6)
    .style("fill", d => d.color);

  svg.selectAll("legend-labels")
    .data(legendData)
    .enter()
    .append("text")
    .attr("x", width - 165)
    .attr("y", (d, i) => 65 + i * 20)
    .text(d => d.label)
    .attr("text-anchor", "start")
    .style("alignment-baseline", "middle");

  
  svg.append("text")
    .attr("x", -height / 2)
    .attr("y", 20)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Maternal Mortality Ratio (MMR)");
// Set description with visible class
  d3.select("#description")
    .classed("visible", true)
    .html(`
      <h2>Understanding Maternal Mortality & Income</h2>
      <p>
        This scene presents a bubble chart showing the <strong>Maternal Mortality Ratio (MMR)</strong> across different <strong>income groups</strong>.
        Each bubble represents a country, sized by the number of <strong>live births</strong>.
        Countries like <span style='color:crimson; font-weight:bold;'>Nigeria</span> show high MMR despite many births,
        while <span style='color:darkblue; font-weight:bold;'>Norway</span> has low MMR, reflecting the disparities in healthcare outcomes.
      </p>
    `);
}

function drawScene2() {
  d3.select("#description").html(`
    <h2>Scene 2: Global Maternal Mortality Over Time</h2>
    <p>
      This line chart shows how the global <strong>Maternal Mortality Ratio (MMR)</strong> has changed over time.
      The chart reveals overall progress (or lack thereof) across the decades.
    </p>
  `);

  d3.csv("global_mmr_from_clean.csv").then(data => {
    data.forEach(d => {
      d.year = +d.year;
      d.global_mmr = +d.global_mmr;
    });

    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.year))
      .range([80, width - 80]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.global_mmr)]).nice()
      .range([height - 50, 50]);

    const line = d3.line()
      .x(d => x(d.year))
      .y(d => y(d.global_mmr))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#007acc")
      .attr("stroke-width", 3)
      .attr("d", line)
      .attr("stroke-dasharray", function () { return this.getTotalLength(); })
      .attr("stroke-dashoffset", function () { return this.getTotalLength(); })
      .transition()
      .duration(2000)
      .attr("stroke-dashoffset", 0);

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .text("Year");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .text("Global Maternal Mortality Ratio");
  });
}

function drawScene3() {
  const highlight = ["Afghanistan", "Norway", "Nigeria", "India"];
  const filtered = data.filter(d => highlight.includes(d.country));

  const x = d3.scaleBand()
    .domain(filtered.map(d => d.country))
    .range([100, width - 100])
    .padding(0.3);

  const y = d3.scaleLinear()
    .domain([0, d3.max(filtered, d => d.mmr)]).nice()
    .range([height - 50, 50]);

  svg.selectAll("rect")
    .data(filtered)
    .join("rect")
    .attr("x", d => x(d.country))
    .attr("y", d => y(d.mmr))
    .attr("width", x.bandwidth())
    .attr("height", d => height - 50 - y(d.mmr))
    .attr("fill", "crimson");

  svg.selectAll("text.label")
    .data(filtered)
    .join("text")
    .attr("x", d => x(d.country) + x.bandwidth() / 2)
    .attr("y", d => y(d.mmr) - 5)
    .attr("text-anchor", "middle")
    .text(d => `${d.country}: ${(d.mmr * 100000).toFixed(0)}`);
}

d3.select("#next").on("click", () => {
  currentScene = (currentScene + 1) % 3;
  updateScene();
});

d3.select("#prev").on("click", () => {
  currentScene = (currentScene - 1 + 3) % 3;
  updateScene();
});
