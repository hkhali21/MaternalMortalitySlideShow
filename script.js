let currentScene = 0;
let data;

const width = 800;
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

  if (currentScene === 0) {
    drawScene1();
  } else if (currentScene === 1) {
    drawScene2();
  } else if (currentScene === 2) {
    drawScene3();
  }
}




function drawScene1() {
  const xScale = d3.scalePoint()
    .domain(["Low income", "Lower middle income", "Upper middle income", "High income"])
    .range([100, width - 100]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.mmr)]).nice()
    .range([height - 50, 50]);

  // Tooltip setup
  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "#fff")
    .style("padding", "6px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px")
    .style("box-shadow", "0 0 5px rgba(0,0,0,0.2)")
    .style("pointer-events", "none")
    .style("opacity", 0);

  // Draw bubbles with color condition
  svg.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => xScale(d.income))
    .attr("cy", height - 50)
    .attr("r", d => Math.sqrt(d.births) / 200)
    .attr("fill", d => {
      if (d.country === "Nigeria") return "crimson";
      if (d.country === "Norway") return "green";
      return "#8888ff";  // lighter color for visibility
    })
    .attr("opacity", 0.7)
    .on("mouseover", function (event, d) {
      if (["Nigeria", "Norway"].includes(d.country)) {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`<strong>${d.country}</strong><br>Income: ${d.income}<br>MMR: ${d.mmr}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      }
    })
    .on("mouseout", function () {
      tooltip.transition().duration(300).style("opacity", 0);
    })
    .transition()
    .duration(1000)
    .attr("cy", d => yScale(d.mmr));

  // Axis labels
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .style("font-weight", "bold")
    .text("Income Group");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .style("font-weight", "bold")
    .text("Maternal Mortality Ratio");

  // Show x-axis category labels manually
  xScale.domain().forEach((group, i) => {
    svg.append("text")
      .attr("x", xScale(group))
      .attr("y", height - 55)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text(group);
  });

  // Title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("Scene 1: MMR vs Income Group");

  // Legend
  const legendData = [
    { label: "Other Countries", color: "#8888ff" },
    { label: "Nigeria", color: "crimson" },
    { label: "Norway", color: "green" }
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
}

function drawScene2() {
  const regionalData = data.filter(d => d.region.includes("Sub-Saharan"));

  const x = d3.scaleBand()
    .domain(regionalData.map(d => d.country))
    .range([50, width - 50])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(regionalData, d => d.mmr)]).nice()
    .range([height - 50, 50]);

  svg.selectAll("rect")
    .data(regionalData)
    .join("rect")
    .attr("x", d => x(d.country))
    .attr("y", d => y(d.mmr))
    .attr("width", x.bandwidth())
    .attr("height", d => height - 50 - y(d.mmr))
    .attr("fill", "darkorange");

  svg.selectAll("text.label")
    .data(regionalData)
    .join("text")
    .attr("class", "label")
    .attr("x", d => x(d.country) + x.bandwidth() / 2)
    .attr("y", height - 30)
    .text(d => d.country)
    .attr("transform", d => `rotate(-45, ${x(d.country) + x.bandwidth() / 2}, ${height - 30})`)
    .attr("text-anchor", "end");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .text("Scene 2: Sub-Saharan Africa MMRs");
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
