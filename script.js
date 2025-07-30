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

  svg.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => xScale(d.income))
    .attr("cy", d => yScale(d.mmr))
    .attr("r", d => Math.sqrt(d.births) / 200)
    .attr("fill", "steelblue")
    .attr("opacity", 0.7);

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .text("Scene 1: MMR vs Income Group");

  svg.selectAll("text.label")
    .data(xScale.domain())
    .join("text")
    .attr("class", "label")
    .attr("x", d => xScale(d))
    .attr("y", height - 10)
    .text(d => d)
    .attr("text-anchor", "middle");
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
