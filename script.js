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

    // Add axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
      .attr("transform", `translate(0, ${height - 50})`)
      .call(xAxis);

    svg.append("g")
      .attr("transform", `translate(100, 0)`)
      .call(yAxis);

    // Axis labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .text("Income Group");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .text("Maternal Mortality Ratio");

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
        return "steelblue";
      })
      .attr("opacity", 0.7)
      .transition()
      .duration(1000)
      .attr("cy", d => yScale(d.mmr));

    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .text("Scene 1: MMR vs Income Group");

    // Annotation: Nigeria
    const nigeria = data.find(d => d.country === "Nigeria");
    if (nigeria) {
      svg.append("text")
        .attr("x", xScale(nigeria.income))
        .attr("y", yScale(nigeria.mmr) - 15)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .style("font-weight", "bold")
        .text("🇳🇬 Nigeria");

      svg.append("line")
        .attr("x1", xScale(nigeria.income))
        .attr("y1", yScale(nigeria.mmr))
        .attr("x2", xScale(nigeria.income))
        .attr("y2", yScale(nigeria.mmr) - 10)
        .attr("stroke", "black")
        .attr("stroke-dasharray", "3,3");
    }

    // Annotation: Norway
    const norway = data.find(d => d.country === "Norway");
    if (norway) {
      svg.append("text")
        .attr("x", xScale(norway.income))
        .attr("y", yScale(norway.mmr) - 15)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .style("font-weight", "bold")
        .text("🇳🇴 Norway");

      svg.append("line")
        .attr("x1", xScale(norway.income))
        .attr("y1", yScale(norway.mmr))
        .attr("x2", xScale(norway.income))
        .attr("y2", yScale(norway.mmr) - 10)
        .attr("stroke", "black")
        .attr("stroke-dasharray", "3,3");
    }

    // Add legend
    const legendData = [
      { label: "Other Countries", color: "steelblue" },
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

    // add description
    const desc = d3.select("#description");
    desc.classed("visible", true).html(`
      <h2>Understanding Maternal Mortality & Income</h2>
      <p>
        This scene presents a bubble chart showing the <strong>Maternal Mortality Ratio (MMR)</strong> across different <strong>income groups</strong>.
        Each bubble represents a country, sized by the number of <strong>live births</strong>.
        Countries like <span style='color:crimson; font-weight:bold;'>Nigeria</span> show high MMR despite many births,
        while <span style='color:green; font-weight:bold;'>Norway</span> has low MMR, reflecting the disparities in healthcare outcomes.
      </p>
    `);
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
  d3.select("#nextBtn").on("click", () => {
    currentScene = (currentScene + 1) % 3;
    updateScene();
  });
});

d3.select("#prev").on("click", () => {
  d3.select("#prevBtn").on("click", () => {
    currentScene = (currentScene - 1 + 3) % 3;
    updateScene();
  });
});
